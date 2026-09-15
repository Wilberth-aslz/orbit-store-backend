import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

/// GET /api/users -> solo ADMIN. Lista de usuarios registrados (sin password).
export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: users });
});
