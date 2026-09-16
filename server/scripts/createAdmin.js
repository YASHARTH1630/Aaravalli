import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import AdminUser from "../models/AdminUser.js";
import { configureDns } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

async function createAdmin() {
  configureDns();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("\n❌ [createAdmin] Error: MONGODB_URI is not configured in server/.env");
    process.exit(1);
  }

  const name = process.env.ADMIN_NAME || "Aravalli Admin";
  // Support CLI arguments (node scripts/createAdmin.js <email> <password>) or fallback to .env
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || "admin@aravallifpc.org").trim().toLowerCase();
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error(
      "\n❌ [createAdmin] Error: Admin password is required.\n" +
      "   Usage: node scripts/createAdmin.js [email] [password]\n" +
      "   OR set ADMIN_PASSWORD in your server/.env file.\n"
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("\n❌ [createAdmin] Error: Admin password must be at least 6 characters long.");
    process.exit(1);
  }

  try {
    console.log(`\nConnecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB.");

    // Enforce exactly ONE administrator account by removing any other emails
    const removedOthers = await AdminUser.deleteMany({ email: { $ne: email } });
    if (removedOthers.deletedCount > 0) {
      console.log(`🧹 Removed ${removedOthers.deletedCount} extraneous account(s) to enforce exactly ONE admin.`);
    }

    let user = await AdminUser.findOne({ email });

    if (user) {
      console.log(`\nUpdating existing admin account: ${email}`);
      user.name = name;
      user.password = password; // pre-save hook will hash it with bcryptjs
      user.role = "admin";
      await user.save();
      console.log("✅ Administrator credentials updated and re-hashed with bcrypt.");
    } else {
      user = await AdminUser.create({
        name,
        email,
        password,
        role: "admin",
      });
      console.log(`\n✅ Administrator account created for: ${email}`);
    }

    // Direct database validation: verify password in MongoDB is a valid bcrypt hash
    const storedDoc = await AdminUser.findOne({ email }).lean();
    const isBcrypt = typeof storedDoc.password === "string" && /^\$2[aby]\$\d{2}\$/.test(storedDoc.password);
    if (!isBcrypt) {
      throw new Error("Security verification failed: password was not stored as a bcrypt hash!");
    }

    const totalAdmins = await AdminUser.countDocuments();

    console.log(`\n==================================================`);
    console.log(`✅ Administrator Provisioning Complete`);
    console.log(`==================================================`);
    console.log(`- Admin Name:         ${user.name}`);
    console.log(`- Admin Email:        ${user.email}`);
    console.log(`- Role:               ${user.role}`);
    console.log(`- Total Admin Count:  ${totalAdmins} (Single Admin Enforced)`);
    console.log(`- Password Storage:   bcryptjs salted hash (${storedDoc.password.length} chars)`);
    console.log(`- Status:             Active & Verified`);
    console.log(`==================================================`);
    console.log(`You can now log in at: http://localhost:5173/admin/login\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ [createAdmin] Failed to provision administrator:", error.message);
    process.exit(1);
  }
}

createAdmin();
