import api from "./api.js";

const OFFLINE_DB_MESSAGE =
  "Enquiry management is temporarily unavailable because the database connection is not available.";

/**
 * Service for administrative buyer enquiry and lead management operations.
 */
export async function getEnquiries({ status, search } = {}) {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (search && search.trim()) params.append("search", search.trim());
    const query = params.toString() ? `?${params.toString()}` : "";

    const response = await api.get(`/admin/enquiries${query}`);
    return {
      success: true,
      enquiries: response?.data || [],
      count: response?.count || 0,
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
      enquiries: [],
    };
  }
}

export async function getEnquiryById(id) {
  try {
    const response = await api.get(`/admin/enquiries/${id}`);
    return {
      success: true,
      enquiry: response?.data || null,
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.message || "Failed to fetch enquiry details",
    };
  }
}

export async function updateEnquiryStatus(id, status) {
  try {
    const response = await api.patch(`/admin/enquiries/${id}/status`, { status });
    return {
      success: true,
      enquiry: response?.data,
      message: response?.message || "Status updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
    };
  }
}

export async function addEnquiryNote(id, text) {
  try {
    const response = await api.post(`/admin/enquiries/${id}/notes`, { text });
    return {
      success: true,
      enquiry: response?.data,
      message: response?.message || "Note added successfully",
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      message: error.isDbOffline ? OFFLINE_DB_MESSAGE : error.message,
    };
  }
}

export async function getEnquiryStats() {
  try {
    const response = await api.get("/admin/enquiries/stats");
    return {
      success: true,
      stats: response?.data || { total: 0, new: 0, activeLeads: 0, converted: 0, closed: 0 },
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      stats: { total: 0, new: 0, activeLeads: 0, converted: 0, closed: 0 },
      message: error.message,
    };
  }
}

export async function getDemandInsights() {
  try {
    const response = await api.get("/admin/enquiries/demand-insights");
    return {
      success: true,
      data: response?.data || {
        summary: {
          totalDemandEnquiries: 0,
          recurringRequirements: 0,
          seasonalRequirements: 0,
          oneTimeRequirements: 0,
        },
        products: [],
        recentDemand: [],
      },
    };
  } catch (error) {
    return {
      success: false,
      isDbOffline: error.isDbOffline || error.status === 503,
      data: {
        summary: {
          totalDemandEnquiries: 0,
          recurringRequirements: 0,
          seasonalRequirements: 0,
          oneTimeRequirements: 0,
        },
        products: [],
        recentDemand: [],
      },
      message: error.message,
    };
  }
}

export default {
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  addEnquiryNote,
  getEnquiryStats,
  getDemandInsights,
};
