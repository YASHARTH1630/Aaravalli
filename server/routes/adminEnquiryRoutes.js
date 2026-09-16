import express from "express";
import {
  getAdminEnquiries,
  getAdminEnquiryStats,
  getAdminDemandInsights,
  getAdminEnquiryById,
  updateAdminEnquiryStatus,
  addAdminEnquiryNote,
} from "../controllers/adminEnquiryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin enquiry routes are protected by JWT authentication
router.use(protect);

router.get("/", getAdminEnquiries);
router.get("/stats", getAdminEnquiryStats);
router.get("/demand-insights", getAdminDemandInsights);
router.get("/:id", getAdminEnquiryById);
router.patch("/:id/status", updateAdminEnquiryStatus);
router.post("/:id/notes", addAdminEnquiryNote);

export default router;
