/**
 * Legacy enquiry adapter & client-side storage utility.
 * Backwards-compatible adapter connecting to the centralized enquiryService.
 */

import { submitBuyerEnquiry } from "../services/enquiryService.js";

const STORAGE_KEY = "aravalli_fpc_enquiries";

/**
 * Backwards compatible enquiry submitter.
 * Routes buyer enquiries to the backend API service, while preserving
 * localStorage backup for offline general contact messages.
 */
export async function submitEnquiry(data) {
  // If this is a business / buyer enquiry, route through enquiryService
  if (data.product || data.requirementType || data.quantity) {
    const result = await submitBuyerEnquiry(data);
    if (!result.success && !result.isDbOffline) {
      throw new Error(result.message || "Failed to submit buyer enquiry");
    }
    return result;
  }

  // General contact message fallback storage
  const record = {
    ...data,
    id: `msg_${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    existing.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Could not persist contact message locally:", err);
  }

  return record;
}

export function getStoredEnquiries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export { submitBuyerEnquiry };
