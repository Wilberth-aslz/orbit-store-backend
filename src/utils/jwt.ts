import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AppJwtPayload {
  sub: number;
  email: string;
  role: "ADMIN" | "USER";
}

export function signToken(payload: AppJwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): AppJwtPayload {
  return jwt.verify(token, env.jwtSecret) as unknown as AppJwtPayload;
}
