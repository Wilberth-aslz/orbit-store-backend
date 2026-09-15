import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./jwt";

describe("signToken / verifyToken", () => {
  it("firma y verifica un payload, obteniendo los mismos datos de vuelta", () => {
    const payload = { sub: 7, email: "admin@orbit.com", role: "ADMIN" as const };
    const token = signToken(payload);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("lanza un error al verificar un token invalido", () => {
    expect(() => verifyToken("esto.no.es-un-jwt-valido")).toThrow();
  });

  it("lanza un error al verificar un token manipulado", () => {
    const token = signToken({ sub: 1, email: "x@orbit.com", role: "USER" });
    const tampered = token.slice(0, -2) + "xx";
    expect(() => verifyToken(tampered)).toThrow();
  });
});
