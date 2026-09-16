/**
 * Centralized API Client for Aravalli FPC Frontend
 * Handles HTTP requests, timeouts, JWT authentication, error normalization, and offline detection.
 */

const RAW_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api";
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export const TOKEN_STORAGE_KEY = "aravalli_admin_token";

/**
 * Custom error class for API failures
 */
export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      data = null,
      isDbOffline = false,
      isNetworkError = false,
      isValidation = false,
      isUnauthorized = false,
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isDbOffline = isDbOffline;
    this.isNetworkError = isNetworkError;
    this.isValidation = isValidation;
    this.isUnauthorized = isUnauthorized;
  }
}

/**
 * Standard fetch wrapper with timeout, token injection, and robust error extraction
 */
async function request(endpoint, options = {}) {
  const { timeout = 8000, headers = {}, ...restOptions } = options;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Retrieve auth token if stored
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders,
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Safely parse JSON response if available
    let responseData = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    }

    if (!response.ok) {
      const status = response.status;
      const message =
        responseData?.message ||
        `Request failed with status ${status} (${response.statusText || "Error"})`;

      const isDbOffline = status === 503;
      const isValidation = status === 400;
      const isUnauthorized = status === 401;

      throw new ApiError(message, {
        status,
        data: responseData,
        isDbOffline,
        isValidation,
        isUnauthorized,
      });
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    const isTimeout = error.name === "AbortError";
    const message = isTimeout
      ? "Request timed out. The server took too long to respond."
      : "Unable to connect to the server. Please check your network connection.";

    throw new ApiError(message, {
      status: 0,
      data: null,
      isNetworkError: true,
      isDbOffline: false,
    });
  }
}

export const api = {
  get(endpoint, options) {
    return request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options) {
    return request(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put(endpoint, body, options) {
    return request(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch(endpoint, body, options) {
    return request(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete(endpoint, options) {
    return request(endpoint, { ...options, method: "DELETE" });
  },

  async checkHealth() {
    try {
      return await request("/health", { timeout: 4000 });
    } catch (err) {
      return { success: false, status: "offline", error: err.message };
    }
  },

  getBaseUrl() {
    return API_BASE_URL;
  },
};

export default api;
