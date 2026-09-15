import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import favoriteRoutes from "./routes/favorite.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";

export const app = express();

// --- Seguridad y utilidades base ---
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Limite de peticiones para mitigar fuerza bruta / abuso, sobre todo en auth.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// --- Healthcheck ---
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "ORBIT Store API viva", timestamp: new Date().toISOString() });
});

// --- Rutas ---
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/users", userRoutes);

// --- Manejo de errores (siempre al final) ---
app.use(notFoundHandler);
app.use(errorHandler);
