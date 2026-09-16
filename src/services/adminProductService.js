import api from "./api.js";

const OFFLINE_DB_MESSAGE =
  "Product management is temporarily unavailable because the database connection is not available.";

/**
 * Service for administrative product CRUD operations.
 */
export async function getAllProducts() {
  try {
    const response = await api.get("/admin/products");
    return {
      success: true,
      products: response?.data || [],
      count: response?.count || 0,
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
      products: [],
    };
  }
}

export async function getProductById(id) {
  try {
    const response = await api.get(`/admin/products/${id}`);
    return {
      success: true,
      product: response?.data || null,
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.message || "Failed to fetch product details",
    };
  }
}

export async function createProduct(productData) {
  try {
    const response = await api.post("/admin/products", productData);
    return {
      success: true,
      product: response?.data,
      message: response?.message || "Product created successfully",
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      isValidation: error.isValidation || error.status === 400,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
      errors: error.data?.errors,
    };
  }
}

export async function updateProduct(id, productData) {
  try {
    const response = await api.put(`/admin/products/${id}`, productData);
    return {
      success: true,
      product: response?.data,
      message: response?.message || "Product updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      isValidation: error.isValidation || error.status === 400,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
      errors: error.data?.errors,
    };
  }
}

export async function togglePublish(id, isPublished) {
  try {
    const response = await api.patch(`/admin/products/${id}/publish`, {
      isPublished,
    });
    return {
      success: true,
      product: response?.data,
      message: response?.message,
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
    };
  }
}

export async function deleteProduct(id) {
  try {
    const response = await api.delete(`/admin/products/${id}`);
    return {
      success: true,
      message: response?.message || "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
    };
  }
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  togglePublish,
  deleteProduct,
};
