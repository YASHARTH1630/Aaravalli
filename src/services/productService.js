import api from "./api.js";
import { products as staticProducts } from "../data/products.js";

/**
 * Normalizes product data from either backend MongoDB documents or static fallback.
 * Ensures that both formats provide identical property names to frontend components.
 */
export function normalizeProduct(raw) {
  if (!raw) return null;

  const rawForms = raw.availableForms || raw.forms || [];
  const forms = Array.isArray(rawForms) ? rawForms : [String(rawForms)];

  const availabilityLabel =
    raw.availabilityStatus || raw.availabilityLabel || "Available on Enquiry";

  const isSeasonal =
    (raw.availability === "seasonal") ||
    availabilityLabel.toLowerCase().includes("seasonal");

  // Format packaging options cleanly (e.g. ["250g", "500g"] -> "250g, 500g")
  let packaging = "Packaging options available on enquiry";
  const rawPackaging = raw.packagingOptions || raw.packaging;
  if (Array.isArray(rawPackaging)) {
    const joined = rawPackaging.filter(Boolean).join(", ");
    if (joined) packaging = joined;
  } else if (typeof rawPackaging === "string" && rawPackaging.trim()) {
    packaging = rawPackaging.trim();
  }

  return {
    id: raw._id ? String(raw._id) : (raw.id || String(raw.name).toLowerCase().replace(/\s+/g, "-")),
    name: raw.name || "Unnamed Product",
    category: raw.category || "General",
    description: raw.description || "",
    forms,
    availability: isSeasonal ? "seasonal" : "year-round",
    availabilityLabel,
    packaging,
    image: raw.image || null,
  };
}

/**
 * Fetch all published products.
 * Seamlessly falls back to static product catalogue if the API is down,
 * MongoDB is unavailable (503), or if the remote catalogue is empty.
 */
export async function getProducts() {
  try {
    const response = await api.get("/products");

    if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
      const normalized = response.data.map(normalizeProduct);
      return {
        products: normalized,
        isFallback: false,
        source: "backend",
      };
    }

    // Backend is reachable but returned empty products array
    return {
      products: staticProducts,
      isFallback: true,
      source: "static",
    };
  } catch (error) {
    // Graceful fallback for offline DB, network errors, or backend downtime
    if (import.meta.env?.DEV) {
      console.warn(
        `[productService] Live products unavailable (${error.message}). Gracefully using fallback catalogue.`
      );
    }

    return {
      products: staticProducts,
      isFallback: true,
      source: "static",
    };
  }
}

/**
 * Direct synchronous access to the static product catalogue.
 */
export function getStaticProducts() {
  return staticProducts;
}

export default {
  getProducts,
  getStaticProducts,
  normalizeProduct,
};
