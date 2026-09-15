import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/// GET /api/favorites -> favoritos del usuario autenticado.
export const listFavorites = asyncHandler(async (req: Request, res: Response) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user!.sub },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: favorites });
});

/// POST /api/favorites/:productId -> agrega un producto a favoritos.
export const addFavorite = asyncHandler(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }

  const favorite = await prisma.favorite.upsert({
    where: { userId_productId: { userId: req.user!.sub, productId } },
    update: {},
    create: { userId: req.user!.sub, productId },
    include: { product: { include: { category: true } } },
  });

  res.status(201).json({ success: true, data: favorite });
});

/// DELETE /api/favorites/:productId -> quita un producto de favoritos.
export const removeFavorite = asyncHandler(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);

  await prisma.favorite.deleteMany({
    where: { userId: req.user!.sub, productId },
  });

  res.json({ success: true, message: "Producto removido de favoritos" });
});
