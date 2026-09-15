import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { slugify } from "../validators/category.validator";

/// GET /api/categories -> publico, incluye conteo de productos por categoria.
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, data: categories });
});

/// POST /api/categories -> solo ADMIN.
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const category = await prisma.category.create({
    data: { name, slug: slugify(name) },
  });
  res.status(201).json({ success: true, data: category });
});

/// PUT /api/categories/:id -> solo ADMIN.
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body as { name?: string };

  const category = await prisma.category.update({
    where: { id },
    data: name ? { name, slug: slugify(name) } : {},
  });
  res.json({ success: true, data: category });
});

/// DELETE /api/categories/:id -> solo ADMIN. Bloquea el borrado si tiene
/// productos asociados, para no dejar productos huerfanos.
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const productsCount = await prisma.product.count({ where: { categoryId: id } });
  if (productsCount > 0) {
    throw ApiError.badRequest(
      `No se puede eliminar: hay ${productsCount} producto(s) usando esta categoria`
    );
  }

  await prisma.category.delete({ where: { id } });
  res.json({ success: true, message: "Categoria eliminada" });
});
