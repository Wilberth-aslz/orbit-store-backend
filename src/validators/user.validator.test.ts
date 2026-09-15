import { describe, expect, it } from "vitest";
import { updateUserRoleSchema } from "./user.validator";

describe("updateUserRoleSchema", () => {
  it("acepta ADMIN y USER", () => {
    expect(updateUserRoleSchema.parse({ role: "ADMIN" })).toEqual({ role: "ADMIN" });
    expect(updateUserRoleSchema.parse({ role: "USER" })).toEqual({ role: "USER" });
  });

  it("rechaza un rol que no existe", () => {
    expect(() => updateUserRoleSchema.parse({ role: "SUPERADMIN" })).toThrow();
  });

  it("rechaza un rol en minusculas (case-sensitive)", () => {
    expect(() => updateUserRoleSchema.parse({ role: "admin" })).toThrow();
  });

  it("rechaza si falta el campo role", () => {
    expect(() => updateUserRoleSchema.parse({})).toThrow();
  });
});
