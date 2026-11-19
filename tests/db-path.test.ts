import { describe, expect, it } from "vitest";
import { resolveDbPath } from "@/lib/db";

describe("resolveDbPath", () => {
  it("prefers an explicit DATABASE_PATH", () => {
    expect(resolveDbPath({ DATABASE_PATH: "/x/y.db", RAILWAY_VOLUME_MOUNT_PATH: "/data" }, "/app")).toBe("/x/y.db");
  });
  it("uses the Railway volume when one is attached", () => {
    expect(resolveDbPath({ RAILWAY_VOLUME_MOUNT_PATH: "/data" }, "/app")).toBe("/data/app.db");
  });
  it("ignores a blank DATABASE_PATH and falls back to the project folder", () => {
    expect(resolveDbPath({ DATABASE_PATH: "" }, "/app")).toBe("/app/data/app.db");
  });
});

import { clientIpHeader, normalizeIp } from "@/lib/request-ip";

describe("clientIpHeader", () => {
  it("uses X-Real-IP on Railway", () => {
    expect(clientIpHeader({ RAILWAY_ENVIRONMENT_NAME: "production" })).toBe("x-real-ip");
  });
  it("uses X-Forwarded-For elsewhere", () => {
    expect(clientIpHeader({})).toBe("x-forwarded-for");
  });
  it("honors an explicit override", () => {
    expect(clientIpHeader({ RAILWAY_ENVIRONMENT_NAME: "production", CLIENT_IP_HEADER: "X-Forwarded-For" })).toBe("x-forwarded-for");
  });
  it("treats a missing X-Real-IP as unknown", () => {
    expect(normalizeIp("")).toBe("unknown");
  });
});
