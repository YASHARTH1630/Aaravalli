import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    availableForms: {
      type: [String],
      default: [],
    },
    packagingOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: [
          "Available",
          "Seasonal",
          "Seasonal Product",
          "Available on Enquiry",
          "Bulk Supply Enquiry",
          "Currently Unavailable",
        ],
        message: "{VALUE} is not a valid availability status",
      },
      default: "Available on Enquiry",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching and filtering
productSchema.index({ category: 1, isPublished: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
