import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  idParamSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "./product.validator";

describe("createProductSchema", () => {
  const validInput = {
    name: "Audifonos",
    description: "Audifonos bluetooth",
    price: "899.5", // llega como string desde form-data / query
    imageUrl: "https://picsum.photos/seed/1/400",
    categoryId: "1",
  };

  it("acepta un producto valido y coerciona price/categoryId a numero", () => {
    const result = createProductSchema.parse(validInput);
    expect(result.price).toBe(899.5);
    expect(result.categoryId).toBe(1);
    expect(typeof result.price).toBe("number");
  });

  it("aplica stock = 0 por defecto cuando no se envia", () => {
    const result = createProductSchema.parse(validInput);
    expect(result.stock).toBe(0);
  });

  it("rechaza precio negativo o cero", () => {
    expect(() => createProductSchema.parse({ ...validInput, price: -5 })).toThrow();
    expect(() => createProductSchema.parse({ ...validInput, price: 0 })).toThrow();
  });

  it("rechaza una URL de imagen invalida", () => {
    expect(() => createProductSchema.parse({ ...validInput, imageUrl: "no-es-url" })).toThrow();
  });

  it("rechaza nombre demasiado corto", () => {
    expect(() => createProductSchema.parse({ ...validInput, name: "X" })).toThrow();
  });
});

describe("updateProductSchema", () => {
  // Regresion: un PUT parcial (ej. solo cambiar el precio) NO debe traer un
  // default de stock=0 que sobreescriba el valor real en la base de datos.
  // Este bug se detecto manualmente probando la API con curl (ver README) y
  // se corrigio separando los campos base sin default del schema de creacion.
  it("NO agrega stock=0 por defecto en una actualizacion parcial", () => {
    const result = updateProductSchema.parse({ price: 150 });
    expect(result).toEqual({ price: 150 });
    expect(result.stock).toBeUndefined();
  });

  it("permite actualizar un solo campo sin exigir los demas", () => {
    expect(() => updateProductSchema.parse({ name: "Nuevo nombre" })).not.toThrow();
  });

  it("sigue validando el tipo/rango de los campos que si vienen", () => {
    expect(() => updateProductSchema.parse({ stock: -1 })).toThrow();
    expect(() => updateProductSchema.parse({ price: -10 })).toThrow();
  });

  it("acepta un objeto vacio (ninguna actualizacion)", () => {
    expect(updateProductSchema.parse({})).toEqual({});
  });
});

describe("listProductsQuerySchema", () => {
  it("aplica page=1 y limit=6 por defecto", () => {
    const result = listProductsQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(6);
  });

  it("coerciona page/limit desde query string", () => {
    const result = listProductsQuerySchema.parse({ page: "2", limit: "10" });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("respeta el limite maximo de 50", () => {
    expect(() => listProductsQuerySchema.parse({ limit: "999" })).toThrow();
  });

  it("rechaza page menor a 1", () => {
    expect(() => listProductsQuerySchema.parse({ page: "0" })).toThrow();
  });
});

describe("idParamSchema", () => {
  it("coerciona un id numerico valido", () => {
    expect(idParamSchema.parse({ id: "42" })).toEqual({ id: 42 });
  });

  it("rechaza un id no numerico", () => {
    expect(() => idParamSchema.parse({ id: "abc" })).toThrow();
  });

  it("rechaza un id negativo o cero", () => {
    expect(() => idParamSchema.parse({ id: "-1" })).toThrow();
    expect(() => idParamSchema.parse({ id: "0" })).toThrow();
  });
});
