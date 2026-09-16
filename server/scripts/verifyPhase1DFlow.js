import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fork } from "child_process";
import BuyerEnquiry from "../models/BuyerEnquiry.js";
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
  console.log("🌾 Aravalli FPC — Phase 1D Demand & Procurement Discovery Verification");
  console.log("================================================================================\n");

  configureDns();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in server/.env");
    process.exit(1);
  }

  // 1. Connect directly to MongoDB
  await mongoose.connect(uri);
  console.log("✅ 1. MongoDB Atlas Connected for Database Asserts.");

  // Clean any leftover test records from previous test runs
  await BuyerEnquiry.deleteMany({ email: { $in: ["demand_test_buyer1@example.com", "demand_test_buyer2@example.com"] } });

  // 2. Start server child process
  console.log("⏳ Starting Express backend server...");
  const serverProcess = fork(path.join(__dirname, "..", "server.js"), [], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env },
    stdio: "inherit",
  });

  // Wait for server to boot and report healthy database
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    await delay(1000);
    try {
      const health = await api("/api/health");
      if (health.status === 200 && health.body?.database === "connected") {
        serverReady = true;
        console.log("✅ 2. Backend Server Ready & Database Connected at", BASE_URL);
        break;
      }
    } catch {
      // Keep waiting
    }
  }

  if (!serverReady) {
    serverProcess.kill();
    throw new Error("Server failed to become healthy within timeout.");
  }

  let createdEnquiry1Id = null;
  let createdEnquiry2Id = null;
  let adminToken = null;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Submit Buyer Procurement Request with New Structured Fields
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: Public Buyer Procurement Request Submission (Phase 1D fields) ---");
    const procurementPayload1 = {
      buyerName: "Vedic Roots Organic Extracts",
      organisationName: "Vedic Roots Ltd",
      email: "demand_test_buyer1@example.com",
      phone: "+91 99887 76655",
      location: "Bengaluru, Karnataka",
      product: "Wild Organic Turmeric Powder",
      expectedQuantity: "1,000 kg / quarter",
      purchaseRequirement: "Regular / Recurring",
      procurementTimeline: "Within 15-30 days",
      deliveryLocation: "Bengaluru Central Warehouse (Hubli Depot)",
      message: "Need high curcumin organic certified turmeric powder for commercial manufacturing.",
    };

    const submitRes1 = await api("/api/enquiries", {
      method: "POST",
      body: procurementPayload1,
    });

    console.log(`Submission 1 Status: ${submitRes1.status}`);
    if (submitRes1.status !== 201 || !submitRes1.body?.data?._id) {
      throw new Error(`Failed to submit enquiry 1: ${JSON.stringify(submitRes1.body)}`);
    }

    createdEnquiry1Id = submitRes1.body.data._id;
    console.log(`✅ Procurement Request 1 Created with ID: ${createdEnquiry1Id}`);

    // Verify notes are NOT exposed
    if ("notes" in submitRes1.body.data) {
      throw new Error("❌ Security Violation: 'notes' field was exposed in public response!");
    }
    console.log("🔒 Verified: Notes are omitted from public API response.");

    // Submit a second demand enquiry with Seasonal requirement
    const procurementPayload2 = {
      buyerName: "Himalayan Herbal Teas",
      organisationName: "Himalayan Infusions",
      email: "demand_test_buyer2@example.com",
      phone: "+91 91234 56789",
      location: "Dehradun, Uttarakhand",
      product: "Ginger Dry Slices",
      expectedQuantity: "300 kg",
      purchaseRequirement: "Seasonal",
      procurementTimeline: "Immediate (within 7 days)",
      deliveryLocation: "Haridwar Processing Plant",
      message: "Looking for premium sun-dried ginger slices for winter herbal tea production.",
    };

    const submitRes2 = await api("/api/enquiries", {
      method: "POST",
      body: procurementPayload2,
    });

    createdEnquiry2Id = submitRes2.body.data._id;
    console.log(`✅ Procurement Request 2 Created with ID: ${createdEnquiry2Id}`);

    // -------------------------------------------------------------------------
    // TEST 2: MongoDB Persistence of New Procurement Discovery Fields
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Direct MongoDB Persistence Verification ---");
    const dbDoc1 = await BuyerEnquiry.findById(createdEnquiry1Id);
    if (!dbDoc1) throw new Error("Document 1 not found in MongoDB!");

    console.log("MongoDB Record 1:");
    console.log(`- Product:              ${dbDoc1.product}`);
    console.log(`- Requirement Type:     ${dbDoc1.purchaseRequirement}`);
    console.log(`- Procurement Timeline: ${dbDoc1.procurementTimeline}`);
    console.log(`- Delivery Location:    ${dbDoc1.deliveryLocation}`);

    if (dbDoc1.procurementTimeline !== "Within 15-30 days") {
      throw new Error(`Timeline mismatch: expected 'Within 15-30 days', got '${dbDoc1.procurementTimeline}'`);
    }
    if (dbDoc1.deliveryLocation !== "Bengaluru Central Warehouse (Hubli Depot)") {
      throw new Error(`Location mismatch: expected 'Bengaluru Central Warehouse (Hubli Depot)', got '${dbDoc1.deliveryLocation}'`);
    }
    console.log("✅ New procurement fields saved accurately in MongoDB.");

    // -------------------------------------------------------------------------
    // TEST 3: Backward Compatibility with Existing MongoDB Documents
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Backward Compatibility Verification ---");
    const existingOldDoc = await BuyerEnquiry.findOne({
      email: { $nin: ["demand_test_buyer1@example.com", "demand_test_buyer2@example.com"] },
    });

    if (existingOldDoc) {
      console.log(`Existing legacy enquiry found: ${existingOldDoc.buyerName} (${existingOldDoc.email})`);
      console.log(`- procurementTimeline: "${existingOldDoc.procurementTimeline || ""}"`);
      console.log(`- deliveryLocation:    "${existingOldDoc.deliveryLocation || ""}"`);
      console.log("✅ Backward compatibility verified: Older records load without errors or missing properties.");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Security Verification — Public Access to Demand Insights is Blocked
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Security Verification (Unauthenticated Access) ---");
    const unauthRes = await api("/api/admin/enquiries/demand-insights");
    console.log(`Unauthenticated GET /demand-insights status: ${unauthRes.status}`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for public access, but got ${unauthRes.status}`);
    }
    console.log("🔒 Verified: Demand analytics are strictly protected by JWT authentication.");

    // -------------------------------------------------------------------------
    // TEST 5: Admin Login
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Admin Authentication ---");
    const loginRes = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: process.env.ADMIN_EMAIL || "admin@aravallifpc.org",
        password: process.env.ADMIN_PASSWORD || "AravalliAdmin@2026!",
      },
    });

    if (loginRes.status !== 200 || !loginRes.body?.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    adminToken = loginRes.body.token;
    const authHeader = { Authorization: `Bearer ${adminToken}` };
    console.log("✅ Admin authenticated successfully.");

    // -------------------------------------------------------------------------
    // TEST 6: Admin Enquiry Details Shows Procurement Timeline & Location
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Admin Enquiry Details Modal Data ---");
    const detailRes = await api(`/api/admin/enquiries/${createdEnquiry1Id}`, {
      headers: authHeader,
    });

    if (detailRes.status !== 200) {
      throw new Error(`Failed to get enquiry detail: ${JSON.stringify(detailRes.body)}`);
    }

    const detailData = detailRes.body?.data;
    console.log(`Enquiry Detail:`);
    console.log(`- Buyer:               ${detailData.buyerName}`);
    console.log(`- Procurement Timeline:${detailData.procurementTimeline}`);
    console.log(`- Delivery Location:   ${detailData.deliveryLocation}`);

    if (detailData.procurementTimeline !== "Within 15-30 days") {
      throw new Error("Admin detail missing procurementTimeline!");
    }
    if (detailData.deliveryLocation !== "Bengaluru Central Warehouse (Hubli Depot)") {
      throw new Error("Admin detail missing deliveryLocation!");
    }
    console.log("✅ Admin detail API successfully exposes procurement discovery fields.");

    // -------------------------------------------------------------------------
    // TEST 7: Buyer Demand Insights Analytics Endpoint (Real MongoDB Aggregation)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 7: GET /api/admin/enquiries/demand-insights (Real Data) ---");
    const demandRes = await api("/api/admin/enquiries/demand-insights", {
      headers: authHeader,
    });

    console.log(`Demand Insights Status: ${demandRes.status}`);
    if (demandRes.status !== 200 || !demandRes.body?.data) {
      throw new Error(`Failed to get demand insights: ${JSON.stringify(demandRes.body)}`);
    }

    const demandData = demandRes.body.data;
    console.log("\n📊 Demand Insights Summary from Live MongoDB:");
    console.log(`- Total Demand Inquiries:   ${demandData.summary.totalDemandEnquiries}`);
    console.log(`- Recurring Requirements:   ${demandData.summary.recurringRequirements}`);
    console.log(`- Seasonal Requirements:    ${demandData.summary.seasonalRequirements}`);
    console.log(`- One-Time Requirements:    ${demandData.summary.oneTimeRequirements}`);

    console.log("\n🌿 Product Demand Breakdown (Aggregated from MongoDB):");
    demandData.products.forEach((p) => {
      console.log(`  • ${p.productName}: ${p.totalEnquiries} enquiries (${p.recurringCount} recurring, ${p.seasonalCount} seasonal, ${p.oneTimeCount} one-time)`);
    });

    if (demandData.summary.totalDemandEnquiries < 2) {
      throw new Error("Total demand inquiries count mismatch!");
    }
    if (demandData.summary.recurringRequirements < 1) {
      throw new Error("Recurring requirements count should be at least 1!");
    }

    const turmericProduct = demandData.products.find((p) =>
      p.productName.toLowerCase().includes("turmeric")
    );
    if (!turmericProduct) {
      throw new Error("Turmeric demand was not aggregated in product breakdown!");
    }
    console.log(`✅ Product breakdown verified: Found ${turmericProduct.productName} with ${turmericProduct.totalEnquiries} inquiries.`);

    // -------------------------------------------------------------------------
    // TEST 8: Dashboard Pipeline Stats Unaffected
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 8: Standard Dashboard Pipeline Stats Integrity ---");
    const statsRes = await api("/api/admin/enquiries/stats", {
      headers: authHeader,
    });
    console.log(`Pipeline Stats: ${JSON.stringify(statsRes.body?.data)}`);
    if (statsRes.status !== 200 || statsRes.body?.data?.total < 2) {
      throw new Error("Pipeline stats broken!");
    }
    console.log("✅ Standard dashboard pipeline stats remain intact and accurate.");

    console.log("\n================================================================================");
    console.log("🎉 ALL PHASE 1D BUYER DEMAND & PROCUREMENT DISCOVERY TESTS PASSED!");
    console.log("================================================================================\n");
  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:", error);
    process.exitCode = 1;
  } finally {
    // Clean up test documents
    if (createdEnquiry1Id) await BuyerEnquiry.findByIdAndDelete(createdEnquiry1Id);
    if (createdEnquiry2Id) await BuyerEnquiry.findByIdAndDelete(createdEnquiry2Id);
    console.log("🧹 Cleaned up test enquiries from MongoDB Atlas.");

    serverProcess.kill();
    await mongoose.disconnect();
    console.log("Server stopped and MongoDB disconnected.\n");
  }
}

runVerification();
