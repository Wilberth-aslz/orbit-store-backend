import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: required("JWT_SECRET", "dev-secret-inseguro-cambiame"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
