import api from "./api.js";

/**
 * Validates buyer enquiry form input fields on the client side.
 * Returns an object mapping field names to human-readable error strings.
 */
export function validateBuyerEnquiry(form) {
  const errors = {};

  const fullName = (form.buyerName || form.fullName || "").trim();
  const organisation = (form.organisationName || form.organisation || "").trim();
  const email = (form.email || "").trim();
  const phone = (form.phone || "").trim();
  const product = (form.product || "").trim();

  if (!fullName) {
    errors.fullName = "Please enter your full name.";
  }

  if (!organisation) {
    errors.organisation = "Please enter your organisation name.";
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Please enter a contact phone number.";
  } else if (!/^[\d+\-\s()]{7,20}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number (at least 7 digits).";
  }

  if (!product) {
    errors.product = "Please select or specify a product of interest.";
  }

  return errors;
}

/**
 * Submits a buyer enquiry to POST /api/enquiries.
 * Provides clear, professional responses for success, validation, offline DB, and network errors.
 */
export async function submitBuyerEnquiry(form) {
  const payload = {
    buyerName: (form.buyerName || form.fullName || "").trim(),
    organisationName: (form.organisationName || form.organisation || "").trim(),
    email: (form.email || "").trim().toLowerCase(),
    phone: (form.phone || "").trim(),
    location: (form.location || "").trim(),
    product: (form.product || "").trim(),
    expectedQuantity: (form.expectedQuantity || form.quantity || "").trim(),
    purchaseRequirement: (form.purchaseRequirement || form.requirementType || "One-time").trim(),
    procurementTimeline: (form.procurementTimeline || form.timeline || "").trim(),
    deliveryLocation: (form.deliveryLocation || "").trim(),
    message: (form.message || "").trim(),
  };

  try {
    const response = await api.post("/enquiries", payload);

    return {
      success: true,
      data: response?.data || null,
      message: response?.message || "Enquiry submitted successfully",
    };
  } catch (error) {
    // 1. Database is disconnected or unavailable (HTTP 503)
    if (error.isDbOffline || error.status === 503) {
      return {
        success: false,
        isDbOffline: true,
        status: 503,
        message:
          "Thank you for your interest. Our enquiry system is temporarily unavailable. Please contact us directly through the contact details provided.",
      };
    }

    // 2. Validation error from backend (HTTP 400)
    if (error.isValidation || error.status === 400) {
      return {
        success: false,
        isValidationError: true,
        status: 400,
        message: error.message || "Please check the highlighted fields and try again.",
        errors: error.data?.errors || [error.message],
      };
    }

    // 3. Network or connection failure
    if (error.isNetworkError || error.status === 0) {
      return {
        success: false,
        isNetworkError: true,
        status: 0,
        message:
          "Unable to connect to our server. Please check your internet connection, or contact us directly.",
      };
    }

    // 4. Other unexpected server errors
    return {
      success: false,
      status: error.status || 500,
      message:
        "Something went wrong while submitting your enquiry. Please try again later or contact us directly.",
    };
  }
}

export default {
  validateBuyerEnquiry,
  submitBuyerEnquiry,
};
