import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validator";

interface ListQuery {
  category?: string;
  page: number;
  limit: number;
  search?: string;
}

/// GET /api/products?category=slug&page=1&limit=6&search=texto
/// Publico. Soporta filtro por categoria (slug), busqueda por nombre y
/// paginacion (usada por el frontend para el boton "Cargar mas").
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  // El middleware `validate` ya parseo y coercio estos valores con Zod
  // (Express 5 no permite mutar req.query directamente, ver validate.middleware.ts).
  const { category, page, limit, search } = req.validated!.query as ListQuery;

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? { name: { contains: search } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: page * limit < total,
    },
  });
});

/// GET /api/products/:id -> publico.
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }
  res.json({ success: true, data: product });
});

/// POST /api/products -> solo ADMIN.
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateProductInput;

  const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
  if (!category) {
    throw ApiError.badRequest("La categoria indicada no existe");
  }

  const product = await prisma.product.create({
    data: body,
    include: { category: true },
  });
  res.status(201).json({ success: true, data: product });
});

/// PUT /api/products/:id -> solo ADMIN.
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as UpdateProductInput;

  if (body.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
    if (!category) {
      throw ApiError.badRequest("La categoria indicada no existe");
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: body,
    include: { category: true },
  });
  res.json({ success: true, data: product });
});

/// DELETE /api/products/:id -> solo ADMIN.
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: "Producto eliminado" });
});
