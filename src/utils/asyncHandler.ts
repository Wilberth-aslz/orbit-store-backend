import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/// Envuelve un controlador async para que cualquier error que lance
/// (o promesa rechazada) caiga automaticamente en el middleware de errores,
/// sin necesidad de try/catch repetido en cada controlador.
export function asyncHandler<Req extends Request = Request>(fn: AsyncRouteHandler<Req>) {
  return (req: Req, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
