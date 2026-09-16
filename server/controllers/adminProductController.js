import Product from "../models/Product.js";
import { isDbConnected } from "../config/db.js";

const OFFLINE_DB_MESSAGE =
  "Product management is temporarily unavailable because the database connection is not available.";

/**
 * @desc    Get all products for admin (both published and unpublished)
 * @route   GET /api/admin/products
 * @access  Private (Admin)
 */
export async function getAdminProducts(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
        data: [],
      });
    }

    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single product details
 * @route   GET /api/admin/products/:id
 * @access  Private (Admin)
 */
export async function getAdminProductById(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create a new product
 * @route   POST /api/admin/products
 * @access  Private (Admin)
 */
export async function createAdminProduct(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    const {
      name,
      category,
      description,
      image,
      availableForms,
      packagingOptions,
      availabilityStatus,
      isPublished,
    } = req.body;

    // Validation
    const missing = [];
    if (!name || !name.trim()) missing.push("Product name");
    if (!category || !category.trim()) missing.push("Category");
    if (!description || !description.trim()) missing.push("Description");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(", ")}`,
        errors: missing.map((m) => `${m} is required`),
      });
    }

    // Normalize forms array
    let forms = [];
    if (Array.isArray(availableForms)) {
      forms = availableForms.map((f) => String(f).trim()).filter(Boolean);
    } else if (typeof availableForms === "string") {
      forms = availableForms.split(",").map((f) => f.trim()).filter(Boolean);
    }

    // Normalize packaging
    let packaging = packagingOptions;
    if (Array.isArray(packagingOptions)) {
      packaging = packagingOptions.map((p) => String(p).trim()).filter(Boolean);
    } else if (typeof packagingOptions === "string") {
      packaging = packagingOptions.trim();
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      image: image ? image.trim() : null,
      availableForms: forms,
      packagingOptions: packaging || "",
      availabilityStatus: availabilityStatus || "Available on Enquiry",
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update an existing product
 * @route   PUT /api/admin/products/:id
 * @access  Private (Admin)
 */
export async function updateAdminProduct(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      category,
      description,
      image,
      availableForms,
      packagingOptions,
      availabilityStatus,
      isPublished,
    } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (image !== undefined) product.image = image ? image.trim() : null;

    if (availableForms !== undefined) {
      if (Array.isArray(availableForms)) {
        product.availableForms = availableForms.map((f) => String(f).trim()).filter(Boolean);
      } else if (typeof availableForms === "string") {
        product.availableForms = availableForms.split(",").map((f) => f.trim()).filter(Boolean);
      }
    }

    if (packagingOptions !== undefined) {
      if (Array.isArray(packagingOptions)) {
        product.packagingOptions = packagingOptions.map((p) => String(p).trim()).filter(Boolean);
      } else if (typeof packagingOptions === "string") {
        product.packagingOptions = packagingOptions.trim();
      }
    }

    if (availabilityStatus !== undefined) product.availabilityStatus = availabilityStatus;
    if (isPublished !== undefined) product.isPublished = Boolean(isPublished);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle or set publish state
 * @route   PATCH /api/admin/products/:id/publish
 * @access  Private (Admin)
 */
export async function togglePublishProduct(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (req.body.isPublished !== undefined) {
      product.isPublished = Boolean(req.body.isPublished);
    } else {
      product.isPublished = !product.isPublished;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isPublished ? "published" : "unpublished"} successfully`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a product
 * @route   DELETE /api/admin/products/:id
 * @access  Private (Admin)
 */
export async function deleteAdminProduct(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: OFFLINE_DB_MESSAGE,
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
}
