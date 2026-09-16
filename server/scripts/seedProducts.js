import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { configureDns } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

const initialProducts = [
  {
    name: "Turmeric",
    category: "Spices",
    description:
      "Turmeric grown by farmers in the Aravalli belt, cleaned and processed for whole and powdered supply.",
    availableForms: ["Whole (dried finger)", "Powder"],
    availabilityStatus: "Seasonal",
    packagingOptions: "Packaging options available on enquiry (bulk sacks, bags)",
    isPublished: true,
  },
  {
    name: "Ginger",
    category: "Spices",
    description:
      "Fresh and dried ginger aggregated from local growers, suitable for kitchens, processors and distributors.",
    availableForms: ["Fresh", "Dried"],
    availabilityStatus: "Seasonal",
    packagingOptions: "Packaging options available on enquiry",
    isPublished: true,
  },
  {
    name: "Jamun-based Products",
    category: "Value-added",
    description:
      "Jamun (Indian blackberry) sourced from local trees, processed by our women's units into value-added forms.",
    availableForms: ["Pulp", "Powder / seed powder", "Preserves"],
    availabilityStatus: "Seasonal",
    packagingOptions: "Bulk Supply Enquiry",
    isPublished: true,
  },
  {
    name: "Other Value-Added Products",
    category: "Value-added",
    description:
      "We are steadily developing additional value-added products from local agricultural and forest resources. Reach out to discuss what you're looking for.",
    availableForms: ["Varies by product"],
    availabilityStatus: "Available on Enquiry",
    packagingOptions: "Bulk Supply Enquiry",
    isPublished: true,
  },
];

async function seed() {
  configureDns();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in server environment variables.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    for (const item of initialProducts) {
      await Product.findOneAndUpdate(
        { name: item.name },
        { $set: item },
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded product: ${item.name}`);
    }

    console.log("\n✅ Product catalog seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
