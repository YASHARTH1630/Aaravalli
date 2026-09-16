import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fork } from "child_process";
import { configureDns } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

const BASE_URL = "http://127.0.0.1:5000";

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { ...options.headers };
  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, body: data };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log("\n================================================================================");
  console.log("🌾 Aravalli FPC — Phase 1E Polish & Deployment Readiness Verification");
  console.log("================================================================================\n");

  configureDns();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in server/.env");
    process.exit(1);
  }

  // 1. Verify Gitignore & Environment Configuration
  console.log("--- STEP 1: Gitignore & Environment Verification ---");
  const rootGitignorePath = path.join(__dirname, "..", "..", ".gitignore");
  const serverGitignorePath = path.join(__dirname, "..", ".gitignore");

  const rootGitignore = fs.readFileSync(rootGitignorePath, "utf-8");
  const serverGitignore = fs.readFileSync(serverGitignorePath, "utf-8");

  if (!rootGitignore.includes(".env") || !serverGitignore.includes(".env")) {
    throw new Error(".gitignore is missing .env protection rules!");
  }
  console.log("✅ .gitignore protects .env files across root and server directories.");

  const serverEnvExample = fs.readFileSync(path.join(__dirname, "..", ".env.example"), "utf-8");
  if (serverEnvExample.includes("rZuHHZBcA0D1Ms9o")) {
    throw new Error("server/.env.example still contains live database password!");
  }
  console.log("✅ server/.env.example is completely sanitized with template variables.");

  // 2. Connect directly to MongoDB
  await mongoose.connect(uri);
  console.log("✅ MongoDB Atlas connected successfully.");

  // 3. Start server child process
  console.log("\n--- STEP 2: Server Startup & Healthcheck ---");
  const serverProcess = fork(path.join(__dirname, "..", "server.js"), [], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env },
    stdio: "inherit",
  });

  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    await delay(1000);
    try {
      const health = await api("/api/health");
      if (health.status === 200 && health.body?.database === "connected") {
        serverReady = true;
        console.log("✅ Backend healthcheck passed:", health.body);
        break;
      }
    } catch {
      // Waiting
    }
  }

  if (!serverReady) {
    serverProcess.kill();
    throw new Error("Server failed to report healthy database connection.");
  }

  const originalPassword = process.env.ADMIN_PASSWORD || "AravalliAdmin@2026!";
  const tempNewPassword = "AravalliUpdated2026#Secure";

  try {
    // -------------------------------------------------------------------------
    // STEP 3: Admin Authentication & Profile
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 3: Admin Login & Profile Retrieval ---");
    const loginRes = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: process.env.ADMIN_EMAIL || "admin@aravallifpc.org",
        password: originalPassword,
      },
    });

    if (loginRes.status !== 200 || !loginRes.body?.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }

    let token = loginRes.body.token;
    console.log(`✅ Admin logged in successfully: ${loginRes.body.user?.name} (${loginRes.body.user?.email})`);

    const profileRes = await api("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (profileRes.status !== 200 || profileRes.body?.user?.email !== (process.env.ADMIN_EMAIL || "admin@aravallifpc.org")) {
      throw new Error("Failed to fetch admin profile via GET /api/auth/me");
    }
    console.log("✅ Profile information retrieved:", profileRes.body.user);

    // -------------------------------------------------------------------------
    // STEP 4: Password Change Validation (Negative Test: Wrong current password)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 4: Password Change Failure with Incorrect Current Password ---");
    const badChangeRes = await api("/api/auth/change-password", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        currentPassword: "WrongPassword123!",
        newPassword: tempNewPassword,
      },
    });

    console.log(`Bad change password status: ${badChangeRes.status} (Expected: 400)`);
    console.log(`Error message returned: "${badChangeRes.body?.message}"`);
    if (badChangeRes.status !== 400 || !badChangeRes.body?.message?.includes("Current password")) {
      throw new Error("Security check failed: Endpoint did not reject incorrect current password!");
    }
    console.log("✅ Password change correctly rejected with invalid current password.");

    // -------------------------------------------------------------------------
    // STEP 5: Password Change Success (Update to tempNewPassword)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 5: Password Change Execution ---");
    const validChangeRes = await api("/api/auth/change-password", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        currentPassword: originalPassword,
        newPassword: tempNewPassword,
      },
    });

    if (validChangeRes.status !== 200) {
      throw new Error(`Password change failed: ${JSON.stringify(validChangeRes.body)}`);
    }
    console.log("✅ Password successfully updated in MongoDB:", validChangeRes.body.message);

    // Verify login with new password
    const newLoginRes = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: process.env.ADMIN_EMAIL || "admin@aravallifpc.org",
        password: tempNewPassword,
      },
    });

    if (newLoginRes.status !== 200 || !newLoginRes.body?.token) {
      throw new Error("Failed to login with newly updated password!");
    }
    token = newLoginRes.body.token;
    console.log("✅ Authenticated successfully using new password.");

    // -------------------------------------------------------------------------
    // STEP 6: Revert Password Back to Standard Original Password
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 6: Reverting Password Back to Standard Admin Password ---");
    const revertRes = await api("/api/auth/change-password", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        currentPassword: tempNewPassword,
        newPassword: originalPassword,
      },
    });

    if (revertRes.status !== 200) {
      throw new Error("Failed to revert password to standard credentials!");
    }

    const testOriginalLogin = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: process.env.ADMIN_EMAIL || "admin@aravallifpc.org",
        password: originalPassword,
      },
    });

    if (testOriginalLogin.status !== 200) {
      throw new Error("Failed to authenticate with original password after revert!");
    }
    console.log("✅ Password successfully reverted to standard credentials.");

    // -------------------------------------------------------------------------
    // STEP 7: Public Website & Enquiries Verification
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 7: Public Website & Products Verification ---");
    const productsRes = await api("/api/products");
    console.log(`Public products status: ${productsRes.status}`);
    console.log(`Public products count: ${productsRes.body?.count || 0}`);
    if (productsRes.status !== 200) {
      throw new Error("Public products endpoint failed!");
    }
    console.log("✅ Public products catalog API functioning normally.");

    console.log("\n================================================================================");
    console.log("🎉 ALL PHASE 1E POLISH & DEPLOYMENT READINESS CHECKS PASSED!");
    console.log("================================================================================\n");

  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:", error);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
    await mongoose.disconnect();
    console.log("Server stopped and MongoDB disconnected.\n");
  }
}

runVerification();
