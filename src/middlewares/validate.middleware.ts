import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

// Express 5 expone `req.query` y `req.params` como getters de solo lectura
// (se recalculan en cada acceso), asi que no se pueden mutar ni reasignar.
// En vez de eso, el resultado ya validado/coercionado por Zod se guarda
// aparte en `req.validated`, y los controladores lo leen de ahi.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validated?: {
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

/// Middleware generico de validacion con Zod. Se le pasan schemas opcionales
/// para body/query/params; si algo no cumple el esquema, responde 400 con
/// el detalle de cada campo invalido.
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);

      req.validated = req.validated ?? {};
      if (schemas.query) req.validated.query = schemas.query.parse(req.query);
      if (schemas.params) req.validated.params = schemas.params.parse(req.params);

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const detail = err.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(" | ");
        next(ApiError.badRequest(`Datos invalidos -> ${detail}`));
        return;
      }
      next(err);
    }
  };
}
