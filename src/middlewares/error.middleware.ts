import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/// Ruta no encontrada -> 404 uniforme en JSON.
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
  });
}

/// Middleware central de errores. Traduce ApiError, errores conocidos de
/// Prisma y cualquier otro error inesperado a una respuesta JSON consistente.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: `Ya existe un registro con ese valor unico (${(err.meta?.target as string[])?.join(", ")})`,
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Recurso no encontrado" });
      return;
    }
  }

  console.error("[ERROR NO CONTROLADO]", err);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
}
