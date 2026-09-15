import { PrismaClient } from "@prisma/client";

// Instancia unica de Prisma reutilizada en toda la app (evita agotar
// conexiones en desarrollo con hot-reload).
export const prisma = new PrismaClient();
