import type { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { openDb } from "@/lib/db";
import { clientIpFrom, normalizeIp } from "@/lib/request-ip";
import {
  LOGIN_LIMITS,
  admitLogin,
  allowMailTo,
  allowSignup,
  hit,
  loginDelayMs,
  loginSubject,
  peek,
  pruneLimits,
  recordLoginFailure,
  recordLoginSuccess,
  reserveLoginPair,
} from "@/lib/throttle";

const NOW = 1_000_000;

describe("login limits", () => {
  let db: DatabaseSync;
  const owner = loginSubject("player", 7);

  beforeEach(() => {
    db = openDb(":memory:");
  });

  it("gives a username and an email for one account the same bucket", () => {
    expect(loginSubject("player", 7)).toBe(loginSubject("player@test.invalid", 7));
  });

  it("stops one address spraying across many accounts", () => {
    for (let i = 0; i < LOGIN_LIMITS.perIp; i++) expect(admitLogin(db, "1.1.1.1", NOW)).toBe("ok");
    expect(admitLogin(db, "1.1.1.1", NOW)).toBe("throttled");
    expect(admitLogin(db, "2.2.2.2", NOW)).toBe("ok");
  });

  it("locks the attacking address out of an account, not the owner", () => {
    for (let i = 0; i < LOGIN_LIMITS.perIpAndAccount; i++) {
      expect(reserveLoginPair(db, "6.6.6.6", owner, NOW)).toBe(true);
      recordLoginFailure(db, owner, NOW);
    }
    expect(reserveLoginPair(db, "6.6.6.6", owner, NOW)).toBe(false);
    expect(reserveLoginPair(db, "1.1.1.1", owner, NOW)).toBe(true);
  });

  it("slows repeat failures progressively and caps the wait", () => {
    expect(loginDelayMs(db, owner, NOW)).toBe(0);
    for (let i = 0; i < LOGIN_LIMITS.accountFreeFailures; i++) recordLoginFailure(db, owner, NOW);
    const first = loginDelayMs(db, owner, NOW);
    recordLoginFailure(db, owner, NOW);
    expect(first).toBe(LOGIN_LIMITS.baseDelayMs);
    expect(loginDelayMs(db, owner, NOW)).toBe(first * 2);
    for (let i = 0; i < 40; i++) recordLoginFailure(db, owner, NOW);
    expect(loginDelayMs(db, owner, NOW)).toBe(LOGIN_LIMITS.maxDelayMs);
  });

  it("turns away addresses that already failed once site-wide failures are high", () => {
    admitLogin(db, "6.6.6.6", NOW);
    for (let i = 0; i < LOGIN_LIMITS.globalSoft; i++) recordLoginFailure(db, `unknown:${i}`, NOW);
    expect(admitLogin(db, "6.6.6.6", NOW)).toBe("throttled");
    expect(admitLogin(db, "1.1.1.1", NOW)).toBe("ok");
  });

  it("pauses login at the site-wide ceiling", () => {
    for (let i = 0; i < LOGIN_LIMITS.globalHard; i++) recordLoginFailure(db, `unknown:${i}`, NOW);
    expect(admitLogin(db, "1.1.1.1", NOW)).toBe("busy");
  });

  it("keeps an active limit however many other keys are tracked", () => {
    for (let i = 0; i < LOGIN_LIMITS.perIpAndAccount; i++) reserveLoginPair(db, "6.6.6.6", owner, NOW);
    for (let i = 0; i < 12_000; i++) hit(db, `junk:${i}`, LOGIN_LIMITS.windowMs, NOW);
    pruneLimits(db, NOW);
    expect(reserveLoginPair(db, "6.6.6.6", owner, NOW)).toBe(false);
  });

  it("resets a counter after its window ends", () => {
    hit(db, "bucket", 1000, NOW);
    expect(peek(db, "bucket", NOW + 999)).toBe(1);
    expect(peek(db, "bucket", NOW + 1000)).toBe(0);
    expect(hit(db, "bucket", 1000, NOW + 1000)).toBe(1);
  });

  it("clears the owner's counters after a good login", () => {
    admitLogin(db, "1.1.1.1", NOW);
    for (let i = 0; i < 12; i++) recordLoginFailure(db, owner, NOW);
    recordLoginSuccess(db, "1.1.1.1", owner);
    expect(loginDelayMs(db, owner, NOW)).toBe(0);
  });
});

describe("signup and mail limits", () => {
  it("limits signups per address", () => {
    const db = openDb(":memory:");
    for (let i = 0; i < 5; i++) expect(allowSignup(db, "1.1.1.1", NOW)).toBe(true);
    expect(allowSignup(db, "1.1.1.1", NOW)).toBe(false);
    expect(allowSignup(db, "2.2.2.2", NOW)).toBe(true);
  });

  it("caps mail to one inbox", () => {
    const db = openDb(":memory:");
    for (let i = 0; i < 4; i++) expect(allowMailTo(db, "a@test.invalid", NOW)).toBe(true);
    expect(allowMailTo(db, "a@test.invalid", NOW)).toBe(false);
  });
});

describe("client address", () => {
  it("trusts only the entry added by the nearest proxy", () => {
    expect(clientIpFrom("9.9.9.9, 1.2.3.4", 1)).toBe("1.2.3.4");
    expect(clientIpFrom("9.9.9.9, 1.2.3.4, 10.0.0.1", 2)).toBe("1.2.3.4");
  });

  it("falls back to a shared bucket when there is no usable address", () => {
    expect(clientIpFrom(null, 1)).toBe("unknown");
    expect(clientIpFrom("not-an-ip", 1)).toBe("unknown");
  });

  it("treats a whole IPv6 /64 as one address", () => {
    expect(normalizeIp("2001:db8:1:2:aaaa::1")).toBe(normalizeIp("2001:db8:1:2:bbbb::2"));
    expect(normalizeIp("2001:db8:1:3::1")).not.toBe(normalizeIp("2001:db8:1:2::1"));
  });

  it("unwraps an IPv4-mapped address", () => {
    expect(normalizeIp("::ffff:1.2.3.4")).toBe("1.2.3.4");
  });
});
