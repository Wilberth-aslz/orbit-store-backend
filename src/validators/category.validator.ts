import { z } from "zod";

// Rango unicode de marcas diacriticas combinadas (acentos, tildes) que quedan
// sueltas tras normalizar un string a forma NFD. Se escribe con \\u para
// evitar caracteres combinados literales en el codigo fuente.
const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "") // quita acentos (a con acento -> a, n con tilde -> n, etc.)
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "El nombre es requerido"),
});

export const categoryWithSlug = createCategorySchema.transform((data) => ({
  ...data,
  slug: slugify(data.name),
}));

export const updateCategorySchema = createCategorySchema.partial();

export { slugify };
