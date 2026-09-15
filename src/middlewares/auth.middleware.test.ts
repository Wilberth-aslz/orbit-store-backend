import { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { signToken } from "../utils/jwt";
import { requireAuth, requireRole } from "./auth.middleware";

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

describe("requireAuth", () => {
  it("lanza 401 si no hay header Authorization", () => {
    const next = vi.fn();
    expect(() => requireAuth(makeReq(), {} as Response, next)).toThrow(/token de autenticacion/i);
  });

  it("lanza 401 si el header no empieza con 'Bearer '", () => {
    const next = vi.fn();
    const req = makeReq({ authorization: "Token abc123" });
    expect(() => requireAuth(req, {} as Response, next)).toThrow();
  });

  it("lanza 401 si el token es invalido", () => {
    const next = vi.fn();
    const req = makeReq({ authorization: "Bearer token-invalido" });
    expect(() => requireAuth(req, {} as Response, next)).toThrow(/invalido o expirado/i);
  });

  it("adjunta el usuario decodificado a req.user y llama next() con un token valido", () => {
    const token = signToken({ sub: 3, email: "user@orbit.com", role: "USER" });
    const req = makeReq({ authorization: `Bearer ${token}` });
    const next = vi.fn();

    requireAuth(req, {} as Response, next);

    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe(3);
    expect(req.user?.role).toBe("USER");
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("requireRole", () => {
  it("llama next() cuando el rol del usuario esta permitido", () => {
    const req = { user: { sub: 1, email: "a@orbit.com", role: "ADMIN" as const } } as Request;
    const next = vi.fn();

    requireRole("ADMIN")(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("lanza 403 cuando el rol del usuario NO esta permitido", () => {
    const req = { user: { sub: 2, email: "u@orbit.com", role: "USER" as const } } as Request;
    const next = vi.fn();

    expect(() => requireRole("ADMIN")(req, {} as Response, next)).toThrow(/no tiene acceso/i);
    expect(next).not.toHaveBeenCalled();
  });

  it("lanza 401 si no hay usuario en el request (no se aplico requireAuth antes)", () => {
    const req = {} as Request;
    const next = vi.fn();
    expect(() => requireRole("ADMIN")(req, {} as Response, next)).toThrow();
  });

  it("acepta multiples roles permitidos", () => {
    const req = { user: { sub: 1, email: "a@orbit.com", role: "USER" as const } } as Request;
    const next = vi.fn();

    requireRole("ADMIN", "USER")(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
