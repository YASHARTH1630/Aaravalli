import { Router } from "express";
import { getProducts } from "../controllers/productController.js";

const router = Router();

// Public route to fetch published products
router.get("/", getProducts);

// Note: Future CRUD routes for Phase 1B.2 & 1B.3 (Protected via authMiddleware):
// router.post("/", requireAuth, createProduct);
// router.put("/:id", requireAuth, updateProduct);
// router.delete("/:id", requireAuth, deleteProduct);

export default router;
