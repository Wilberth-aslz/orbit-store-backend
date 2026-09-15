import { Router } from "express";
import { addFavorite, listFavorites, removeFavorite } from "../controllers/favorite.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth); // todo el recurso de favoritos requiere sesion

router.get("/", listFavorites);
router.post("/:productId", addFavorite);
router.delete("/:productId", removeFavorite);

export default router;
