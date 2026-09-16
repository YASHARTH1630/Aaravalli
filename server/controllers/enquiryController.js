import BuyerEnquiry from "../models/BuyerEnquiry.js";
import { isDbConnected } from "../config/db.js";

/**
 * @desc    Submit a new buyer enquiry
 * @route   POST /api/enquiries
 * @access  Public
 */
export async function createEnquiry(req, res, next) {
  try {
    const {
      buyerName,
      organisationName,
      email,
      phone,
      location,
      product,
      expectedQuantity,
      purchaseRequirement,
      procurementTimeline,
      deliveryLocation,
      message,
    } = req.body;

    // Basic request validation
    const missingFields = [];
    if (!buyerName || !buyerName.trim()) missingFields.push("buyerName");
    if (!email || !email.trim()) missingFields.push("email");
    if (!phone || !phone.trim()) missingFields.push("phone");
    if (!product || !product.trim()) missingFields.push("product");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
        errors: missingFields.map((f) => `${f} is required`),
      });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format",
      });
    }

    // Check if database is connected
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message:
          "Database is currently not connected. Enquiry cannot be saved to MongoDB yet. Please configure MONGODB_URI in server/.env.",
      });
    }

    const enquiry = await BuyerEnquiry.create({
      buyerName: buyerName.trim(),
      organisationName: (organisationName || "").trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: (location || "").trim(),
      product: product.trim(),
      expectedQuantity: (expectedQuantity || "").trim(),
      purchaseRequirement: (purchaseRequirement || "One-time").trim(),
      procurementTimeline: (procurementTimeline || "").trim(),
      deliveryLocation: (deliveryLocation || "").trim(),
      message: (message || "").trim(),
      status: "New",
    });

    const publicData = enquiry.toObject ? enquiry.toObject() : { ...enquiry._doc };
    delete publicData.notes;

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: publicData,
    });
  } catch (error) {
    next(error);
  }
}
