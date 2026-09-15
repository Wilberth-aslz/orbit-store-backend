import { describe, expect, it } from "vitest";
import { categoryWithSlug, createCategorySchema, slugify } from "./category.validator";

describe("slugify", () => {
  it("convierte a minusculas y reemplaza espacios por guiones", () => {
    expect(slugify("Ropa Deportiva")).toBe("ropa-deportiva");
  });

  it("quita acentos y caracteres especiales", () => {
    expect(slugify("Electrónica")).toBe("electronica");
    expect(slugify("Bebés y Niños")).toBe("bebes-y-ninos");
  });

  it("colapsa guiones repetidos y recorta guiones al inicio/final", () => {
    expect(slugify("  --Hogar & Jardin--  ")).toBe("hogar-jardin");
  });
});

describe("createCategorySchema", () => {
  it("acepta un nombre valido", () => {
    expect(() => createCategorySchema.parse({ name: "Deportes" })).not.toThrow();
  });

  it("rechaza un nombre demasiado corto", () => {
    expect(() => createCategorySchema.parse({ name: "D" })).toThrow();
  });
});

describe("categoryWithSlug", () => {
  it("genera el slug automaticamente a partir del nombre", () => {
    const result = categoryWithSlug.parse({ name: "Hogar y Jardín" });
    expect(result).toEqual({ name: "Hogar y Jardín", slug: "hogar-y-jardin" });
  });
});
