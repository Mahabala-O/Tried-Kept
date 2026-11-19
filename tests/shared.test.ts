import { describe, expect, it } from "vitest";
import { cleanDisplayName, displayNameError } from "@/app/me/_shared";

const check = (raw: string) => displayNameError(cleanDisplayName(raw));

describe("display names", () => {
  it.each(["Ana", "José María", "李娜", "Stafford", "Ana 🎾"])("accepts %s", (name) => {
    expect(check(name)).toBeNull();
  });

  it.each(["​", "‮‍", "ㅤ", "⠀", "   ", "..."])("rejects the invisible name %j", (name) => {
    expect(check(name)).not.toBeNull();
  });

  it.each(["Tried & Kept staff", "TRIED AND KEPT", "tried-kept", "Site Admin", "Ｓｔａｆｆ", "Official"])(
    "rejects the staff-like name %s",
    (name) => {
      expect(check(name)).toMatch(/mistaken/);
    },
  );

  it("strips bidirectional controls from a real name", () => {
    expect(cleanDisplayName("A‮na")).toBe("Ana");
  });
});
