import { z } from "zod";

// Campos base SIN valores por defecto. Los defaults se aplican solo en el
// schema de creacion: si tambien vivieran aqui, un PUT parcial (ej. solo
// { price: 150 }) terminaria reescribiendo stock a 0 en cada actualizacion,
// porque Zod rellena el default cuando el campo llega como undefined.
const productFields = {
  name: z.string().trim().min(2, "El nombre es requerido"),
  description: z.string().trim().min(5, "La descripcion es requerida"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  imageUrl: z.string().url("La imagen debe ser una URL valida"),
  categoryId: z.coerce.number().int().positive("Selecciona una categoria valida"),
};

export const createProductSchema = z.object({
  ...productFields,
  stock: productFields.stock.default(0),
});

export const updateProductSchema = z.object(productFields).partial();

export const listProductsQuerySchema = z.object({
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  search: z.string().trim().optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
