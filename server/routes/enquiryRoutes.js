import { Router } from "express";
import { createEnquiry } from "../controllers/enquiryController.js";

const router = Router();

// Public route to submit a buyer enquiry
router.post("/", createEnquiry);

// Note: Future Admin routes for Phase 1B.3 (Protected via authMiddleware):
// router.get("/", requireAuth, getAllEnquiries);
// router.get("/:id", requireAuth, getEnquiryById);
// router.patch("/:id/status", requireAuth, updateEnquiryStatus);

export default router;
