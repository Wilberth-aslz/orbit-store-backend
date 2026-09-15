import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  idParamSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "../validators/product.validator";

const router = Router();

router.get("/", validate({ query: listProductsQuerySchema }), listProducts);
router.get("/:id", validate({ params: idParamSchema }), getProduct);
router.post("/", requireAuth, requireRole("ADMIN"), validate({ body: createProductSchema }), createProduct);
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: updateProductSchema }),
  updateProduct
);
router.delete("/:id", requireAuth, requireRole("ADMIN"), validate({ params: idParamSchema }), deleteProduct);

export default router;
