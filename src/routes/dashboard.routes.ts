import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), getDashboardSummary);

export default router;
