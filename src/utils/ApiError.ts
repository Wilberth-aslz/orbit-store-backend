/// Error controlado con codigo HTTP explicito, para que el middleware
/// central de errores responda de forma consistente.
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }
  static unauthorized(message = "No autenticado") {
    return new ApiError(401, message);
  }
  static forbidden(message = "No tienes permisos para esta accion") {
    return new ApiError(403, message);
  }
  static notFound(message = "Recurso no encontrado") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
}
