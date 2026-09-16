import express from "express";
import {
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  togglePublishProduct,
  deleteAdminProduct,
} from "../controllers/adminProductController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin product routes require authentication
router.use(protect);

router.route("/")
  .get(getAdminProducts)
  .post(createAdminProduct);

router.route("/:id")
  .get(getAdminProductById)
  .put(updateAdminProduct)
  .delete(deleteAdminProduct);

router.patch("/:id/publish", togglePublishProduct);

export default router;
