import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";
import { isDbConnected } from "../config/db.js";

/**
 * Generate a signed JWT token
 */
function generateToken(user) {
  const jwtSecret = process.env.JWT_SECRET || "aravalli_fpc_default_jwt_secret";
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Check if database is connected
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message:
          "Authentication service is temporarily unavailable because the database connection is not available.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await AdminUser.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get current logged in admin
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

/**
 * @desc    Change authenticated admin password
 * @route   PUT /api/auth/change-password
 * @access  Private (Admin)
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both your current password and a new password.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message:
          "Password update is temporarily unavailable because the database connection is not available.",
      });
    }

    const userId = req.user._id || req.user.id;
    const user = await AdminUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password does not match our records.",
      });
    }

    // Assign new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
}
