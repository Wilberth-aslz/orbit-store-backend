import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UpdateUserRoleInput } from "../validators/user.validator";

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

/// PATCH /api/users/:id/role -> solo ADMIN. Asciende/degrada a un usuario ya
/// registrado. Es la unica forma de que alguien obtenga el rol ADMIN fuera
/// del seed inicial: un admin existente tiene que otorgarlo explicitamente,
/// nunca se puede auto-asignar desde el registro publico.
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { role } = req.body as UpdateUserRoleInput;

  if (id === req.user!.sub) {
    throw ApiError.badRequest("No puedes cambiar tu propio rol. Pidele a otro admin que lo haga.");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    throw ApiError.notFound("Usuario no encontrado");
  }

  if (target.role === "ADMIN" && role === "USER") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw ApiError.badRequest("No puedes quitar el ultimo administrador del sistema");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { favorites: true } } },
  });

  res.json({ success: true, data: updated });
});
