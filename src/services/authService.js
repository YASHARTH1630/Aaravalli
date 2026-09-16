import api, { TOKEN_STORAGE_KEY } from "./api.js";

/**
 * Authentication service handling admin login, token storage, and session checks.
 */
export async function login(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response?.success && response.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    }

    return {
      success: false,
      message: response?.message || "Invalid credentials",
    };
  } catch (error) {
    if (error.isDbOffline || error.status === 503) {
      return {
        success: false,
        isDbOffline: true,
        message:
          "Authentication service is temporarily unavailable because the database connection is not available.",
      };
    }

    return {
      success: false,
      message: error.message || "Invalid email or password.",
    };
  }
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await api.get("/auth/me");
    return response?.user || null;
  } catch (error) {
    // If token expired or invalid, clear it
    if (error.status === 401) {
      logout();
    }
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return {
      success: true,
      message: response?.message || "Password updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update password. Please check your current password and try again.",
    };
  }
}

export default {
  login,
  getCurrentUser,
  logout,
  getToken,
  isAuthenticated,
  changePassword,
};
