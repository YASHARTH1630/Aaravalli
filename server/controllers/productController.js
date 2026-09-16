import Product from "../models/Product.js";
import { isDbConnected } from "../config/db.js";

/**
 * @desc    Get all published products
 * @route   GET /api/products
 * @access  Public
 */
export async function getProducts(req, res, next) {
  try {
    // Check if MongoDB is connected
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message:
          "Database is currently not connected. Please configure MONGODB_URI in your server/.env file.",
        data: [],
      });
    }

    const products = await Product.find({ isPublished: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}
