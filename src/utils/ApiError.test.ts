import { describe, expect, it } from "vitest";
import { ApiError } from "./ApiError";

describe("ApiError", () => {
  it("es una instancia de Error con statusCode", () => {
    const err = new ApiError(418, "soy una tetera");
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe("soy una tetera");
  });

  it.each([
    ["badRequest", 400] as const,
    ["unauthorized", 401] as const,
    ["forbidden", 403] as const,
    ["notFound", 404] as const,
  ])("%s() crea un error %i", (method, expectedStatus) => {
    const err = (ApiError as unknown as Record<string, (msg?: string) => ApiError>)[method]("mensaje");
    expect(err.statusCode).toBe(expectedStatus);
    expect(err.message).toBe("mensaje");
  });

  it("conflict() crea un error 409 con el mensaje dado", () => {
    const err = ApiError.conflict("ya existe");
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("ya existe");
  });

  it("usa mensajes por defecto cuando no se pasa ninguno", () => {
    expect(ApiError.unauthorized().message).toBe("No autenticado");
    expect(ApiError.forbidden().message).toBe("No tienes permisos para esta accion");
    expect(ApiError.notFound().message).toBe("Recurso no encontrado");
  });
});
