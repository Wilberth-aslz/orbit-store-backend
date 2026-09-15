import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/product.validator";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

const router = Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireRole("ADMIN"), validate({ body: createCategorySchema }), createCategory);
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  updateCategory
);
router.delete("/:id", requireAuth, requireRole("ADMIN"), validate({ params: idParamSchema }), deleteCategory);

export default router;
