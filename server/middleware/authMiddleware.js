import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";
import { isDbConnected } from "../config/db.js";

/**
 * Middleware to protect admin routes.
 * Verifies JWT token from Authorization header (Bearer <token>).
 */
export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No authentication token provided.",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "aravalli_fpc_default_jwt_secret";
    const decoded = jwt.verify(token, jwtSecret);

    if (isDbConnected()) {
      const user = await AdminUser.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found or session has expired.",
        });
      }
      req.user = user;
    } else {
      // In offline mode, pass decoded payload
      req.user = {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role || "admin",
        name: decoded.name || "Admin",
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
      error: error.message,
    });
  }
}
