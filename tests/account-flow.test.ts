import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const jar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined),
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9" }),
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", () => ({ after: (work: () => unknown) => work() }));

import {
  changePasswordAction,
  confirmEmailAction,
  deleteAccountAction,
  loginAction,
  logoutOtherDevicesAction,
  requestPasswordResetAction,
  resetPasswordAction,
  signupAction,
} from "@/lib/actions/account";
import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { devOutbox } from "@/lib/mail";

const PASSWORD = "correct horse battery";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

/** Runs an action and returns where it redirected, or the state it returned. */
async function run<T>(action: () => Promise<T>): Promise<{ to?: string; state?: T }> {
  try {
    return { state: await action() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("REDIRECT:")) return { to: message.slice("REDIRECT:".length) };
    throw error;
  }
}

const latestToken = () => new URLSearchParams((devOutbox()[0]?.link ?? "").split("?")[1]).get("token") ?? "";

let count = 0;
const fresh = () => {
  count += 1;
  return { username: `player_${count}`, email: `player${count}@test.invalid` };
};

const signup = (who: { username: string; email: string }, next = "/me") =>
  run(() =>
    signupAction({}, form({ username: who.username, display_name: "Ana", email: who.email, password: PASSWORD, next })),
  );

async function joinAndConfirm(next = "/me") {
  const who = fresh();
  await signup(who, next);
  const confirmed = await run(() => confirmEmailAction({}, form({ token: latestToken() })));
  return { who, confirmed };
}

describe("account flow", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "tk-account-"));

  beforeAll(() => {
    process.env.DATABASE_PATH = path.join(dir, "test.db");
  });

  afterAll(() => {
    getDb().close();
    rmSync(dir, { recursive: true, force: true });
  });

  beforeEach(() => {
    jar.clear();
    getDb().exec("DELETE FROM rate_limits");
  });

  it("does not log a player in until the email is confirmed, then returns them to their page", async () => {
    const who = fresh();
    expect((await signup(who, "/gear/nike-vapor-12")).to).toBe("/check-email");
    expect(await currentUser()).toBeNull();

    const login = await run(() => loginAction({}, form({ identifier: who.username, password: PASSWORD, next: "/me" })));
    expect(login.to).toBe("/check-email");
    expect(await currentUser()).toBeNull();

    const confirmed = await run(() => confirmEmailAction({}, form({ token: latestToken() })));
    expect(confirmed.to).toBe("/me");
    expect((await currentUser())?.username).toBe(who.username);
  });

  it("answers the same for a registered email as for a new one", async () => {
    const { who } = await joinAndConfirm();
    jar.clear();
    const again = await signup({ username: fresh().username, email: who.email });
    const brandNew = await signup(fresh());
    expect(again.to).toBe("/check-email");
    expect(again).toEqual(brandNew);
  });

  it("lets a real owner replace a signup nobody confirmed", async () => {
    const squatted = fresh();
    await signup(squatted);
    const owner = { username: fresh().username, email: squatted.email };
    await signup(owner);
    const row = getDb().prepare("SELECT username FROM users WHERE email = ?").get(squatted.email) as { username: string };
    expect(row.username).toBe(owner.username);
  });

  it("limits signups from one address", async () => {
    for (let i = 0; i < 5; i++) expect((await signup(fresh())).to).toBe("/check-email");
    expect((await signup(fresh())).state?.error).toMatch(/Too many/);
  });

  it("lets the owner in with the right password after a stranger's failures elsewhere", async () => {
    const { who } = await joinAndConfirm();
    jar.clear();
    for (let i = 0; i < 8; i++) {
      const miss = await run(() => loginAction({}, form({ identifier: who.username, password: "wrong password", next: "/me" })));
      expect(miss.state?.error).toMatch(/did not work/);
    }
    const blocked = await run(() => loginAction({}, form({ identifier: who.email, password: PASSWORD, next: "/me" })));
    expect(blocked.state?.error).toMatch(/Too many/);

    getDb().exec("DELETE FROM rate_limits WHERE bucket LIKE 'login:pair:%' OR bucket LIKE 'login:ip:%'");
    const owner = await run(() => loginAction({}, form({ identifier: who.email, password: PASSWORD, next: "/me" })));
    expect(owner.to).toBe("/me");
  }, 20_000);

  it("resets a password with a single-use link and ends old sessions", async () => {
    const { who } = await joinAndConfirm();
    const oldSession = jar.get("tk_session");

    const asked = await run(() => requestPasswordResetAction({}, form({ email: who.email })));
    expect(asked.state?.ok).toMatch(/If that email/);
    const token = latestToken();
    const newPassword = "a brand new password";

    expect((await run(() => resetPasswordAction({}, form({ token, password: newPassword })))).to).toBe("/me");
    expect(jar.get("tk_session")).not.toBe(oldSession);

    jar.set("tk_session", oldSession as string);
    expect(await currentUser()).toBeNull();

    const reused = await run(() => resetPasswordAction({}, form({ token, password: "another new password" })));
    expect(reused.state?.error).toMatch(/expired/);
  });

  it("gives the same reset answer for an unknown email", async () => {
    const asked = await run(() => requestPasswordResetAction({}, form({ email: "nobody@test.invalid" })));
    expect(asked.state?.ok).toMatch(/If that email/);
  });

  it("changes a password only with the current one and logs out other devices", async () => {
    await joinAndConfirm();
    const refused = await run(() =>
      changePasswordAction({}, form({ current_password: "wrong password", new_password: "a brand new password" })),
    );
    expect(refused.state?.error).toMatch(/not right/);

    const before = jar.get("tk_session") as string;
    const changed = await run(() =>
      changePasswordAction({}, form({ current_password: PASSWORD, new_password: "a brand new password" })),
    );
    expect(changed.state?.ok).toMatch(/changed/);
    expect(await currentUser()).not.toBeNull();

    const current = jar.get("tk_session") as string;
    jar.set("tk_session", before);
    expect(await currentUser()).toBeNull();
    jar.set("tk_session", current);
  });

  it("ends other sessions on request and keeps this one", async () => {
    const { who } = await joinAndConfirm();
    const first = jar.get("tk_session") as string;
    await run(() => loginAction({}, form({ identifier: who.username, password: PASSWORD, next: "/me" })));
    const second = jar.get("tk_session") as string;
    expect(second).not.toBe(first);

    await logoutOtherDevicesAction({});
    expect(await currentUser()).not.toBeNull();
    jar.set("tk_session", first);
    expect(await currentUser()).toBeNull();
  });

  it("deletes an account only with the password", async () => {
    const { who } = await joinAndConfirm();
    const refused = await run(() => deleteAccountAction({}, form({ password: "wrong password" })));
    expect(refused.state?.error).toMatch(/not right/);

    expect((await run(() => deleteAccountAction({}, form({ password: PASSWORD })))).to).toBe("/privacy?deleted=1");
    expect(getDb().prepare("SELECT 1 FROM users WHERE username = ?").get(who.username)).toBeUndefined();
    expect(jar.has("tk_session")).toBe(false);
  });
});
