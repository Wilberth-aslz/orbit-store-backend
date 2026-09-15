import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

const SALT_ROUNDS = 10;

function toPublicUser(user: { id: number; name: string; email: string; role: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/// POST /api/auth/register -> siempre crea usuarios con rol USER.
/// (Los admin se crean via seed, para no exponer una forma publica de
/// autoasignarse privilegios.)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("Ya existe una cuenta con ese correo");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "USER" },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.status(201).json({ success: true, data: { user: toPublicUser(user), token } });
});

/// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized("Correo o contrasena incorrectos");
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw ApiError.unauthorized("Correo o contrasena incorrectos");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.json({ success: true, data: { user: toPublicUser(user), token } });
});

/// GET /api/auth/me -> requiere requireAuth previo.
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    throw ApiError.notFound("Usuario no encontrado");
  }
  res.json({ success: true, data: toPublicUser(user) });
});
