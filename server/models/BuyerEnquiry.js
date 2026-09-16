import mongoose from "mongoose";

const buyerEnquirySchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
      trim: true,
    },
    organisationName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    product: {
      type: String,
      required: [true, "Product is required"],
      trim: true,
    },
    expectedQuantity: {
      type: String,
      trim: true,
      default: "",
    },
    purchaseRequirement: {
      type: String,
      trim: true,
      default: "One-time",
    },
    procurementTimeline: {
      type: String,
      trim: true,
      default: "",
    },
    deliveryLocation: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: [
          "New",
          "Contacted",
          "Negotiating",
          "Converted",
          "Closed",
          "Sample / Discussion",
          "Negotiation",
          "Order Confirmed",
        ],
        message: "{VALUE} is not a valid enquiry status",
      },
      default: "New",
    },
    notes: [
      {
        text: {
          type: String,
          required: [true, "Note content cannot be empty"],
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: String,
          trim: true,
          default: "Admin",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for query sorting by creation date and status
buyerEnquirySchema.index({ status: 1, createdAt: -1 });

const BuyerEnquiry =
  mongoose.models.BuyerEnquiry ||
  mongoose.model("BuyerEnquiry", buyerEnquirySchema);

export default BuyerEnquiry;
