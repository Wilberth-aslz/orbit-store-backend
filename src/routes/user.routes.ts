import { Router } from "express";
import { listUsers, updateUserRole } from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/product.validator";
import { updateUserRoleSchema } from "../validators/user.validator";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), listUsers);
router.patch(
  "/:id/role",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: updateUserRoleSchema }),
  updateUserRole
);

export default router;
