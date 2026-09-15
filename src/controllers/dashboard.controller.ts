import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const LOW_STOCK_THRESHOLD = 5;

/// GET /api/dashboard -> solo ADMIN. Resumen ejecutivo del catalogo: totales,
/// valor de inventario por categoria y alertas de stock bajo. Pensado como
/// panel de control (no solo CRUD) para el area de administracion.
export const getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [productCount, categoryCount, userCount, products, lowStockProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.product.findMany({ select: { price: true, stock: true, categoryId: true } }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name: true, stock: true, category: { select: { name: true } } },
    }),
  ]);

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const byCategory = categories.map((cat) => {
    const inCategory = products.filter((p) => p.categoryId === cat.id);
    return {
      category: cat.name,
      slug: cat.slug,
      productCount: inCategory.length,
      inventoryValue: inCategory.reduce((sum, p) => sum + p.price * p.stock, 0),
    };
  });

  res.json({
    success: true,
    data: {
      totals: {
        products: productCount,
        categories: categoryCount,
        users: userCount,
        inventoryValue,
      },
      byCategory,
      lowStock: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        category: p.category.name,
        status: p.stock === 0 ? "critical" : "warning",
      })),
    },
  });
});
