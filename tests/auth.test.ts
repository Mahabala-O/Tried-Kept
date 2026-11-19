import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { HashingBusyError, hashPassword, verifyPassword } from "@/lib/auth";

describe("password hashing", () => {
  it("verifies the right password", async () => {
    expect(await verifyPassword("correct horse", await hashPassword("correct horse"))).toBe(true);
  });

  it("rejects the wrong password", async () => {
    expect(await verifyPassword("wrong horse", await hashPassword("correct horse"))).toBe(false);
  });

  it("salts each hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("does not store the password", async () => {
    expect(await hashPassword("visible-secret")).not.toContain("visible-secret");
  });

  it("keeps the event loop free while hashing", async () => {
    let ticked = false;
    const pending = hashPassword("does not block");
    setImmediate(() => {
      ticked = true;
    });
    await new Promise((resolve) => setImmediate(resolve));
    expect(ticked).toBe(true);
    await pending;
  });

  it("refuses work once too many hashes are queued, then recovers", async () => {
    const flood = Array.from({ length: 80 }, () => hashPassword("flood").catch((error: unknown) => error));
    const results = await Promise.all(flood);
    expect(results.some((result) => result instanceof HashingBusyError)).toBe(true);
    expect(await verifyPassword("after", await hashPassword("after"))).toBe(true);
  });

  it.each(["zz:zz", "abcd:zz", "abcd:abcd"])("rejects the stored value %j, whose hash is not 64 bytes", async (stored) => {
    expect(await verifyPassword("anything", stored)).toBe(false);
  });

  it.each(["", "nocolon", ":", "abcd:", ":abcd"])("rejects the malformed stored value %j", async (stored) => {
    expect(await verifyPassword("anything", stored)).toBe(false);
  });
});
