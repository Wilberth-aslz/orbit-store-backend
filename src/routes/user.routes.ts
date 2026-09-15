import { Router } from "express";
import { listUsers } from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), listUsers);

export default router;
