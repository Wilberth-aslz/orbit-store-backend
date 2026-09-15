import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AppJwtPayload, verifyToken } from "../utils/jwt";

// Extiende el tipo Request de Express para adjuntar el usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AppJwtPayload;
    }
  }
}

/// Verifica el header Authorization: Bearer <token>. Si es valido, adjunta
/// el payload decodificado a req.user y continua; si no, responde 401.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Falta el token de autenticacion");
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Token invalido o expirado");
  }
}

/// Restringe el acceso a uno o mas roles. Debe usarse despues de requireAuth.
export function requireRole(...roles: Array<"ADMIN" | "USER">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("Tu rol no tiene acceso a este recurso");
    }
    next();
  };
}
