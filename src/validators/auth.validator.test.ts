import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.validator";

describe("registerSchema", () => {
  it("acepta datos validos", () => {
    const result = registerSchema.parse({ name: "Ana", email: "Ana@Ejemplo.com", password: "123456" });
    expect(result.email).toBe("ana@ejemplo.com"); // normaliza a minusculas
  });

  it("recorta espacios en nombre y correo", () => {
    const result = registerSchema.parse({ name: "  Ana  ", email: "  ana@ejemplo.com  ", password: "123456" });
    expect(result.name).toBe("Ana");
    expect(result.email).toBe("ana@ejemplo.com");
  });

  it("rechaza un correo invalido", () => {
    expect(() => registerSchema.parse({ name: "Ana", email: "no-es-correo", password: "123456" })).toThrow();
  });

  it("rechaza contrasenas de menos de 6 caracteres", () => {
    expect(() => registerSchema.parse({ name: "Ana", email: "ana@ejemplo.com", password: "123" })).toThrow();
  });

  it("rechaza nombres de un solo caracter", () => {
    expect(() => registerSchema.parse({ name: "A", email: "ana@ejemplo.com", password: "123456" })).toThrow();
  });
});

describe("loginSchema", () => {
  it("acepta credenciales validas", () => {
    expect(() => loginSchema.parse({ email: "ana@ejemplo.com", password: "cualquier-cosa" })).not.toThrow();
  });

  it("rechaza contrasena vacia", () => {
    expect(() => loginSchema.parse({ email: "ana@ejemplo.com", password: "" })).toThrow();
  });

  it("rechaza correo invalido", () => {
    expect(() => loginSchema.parse({ email: "invalido", password: "x" })).toThrow();
  });
});
