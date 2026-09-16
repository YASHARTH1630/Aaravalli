import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
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

async function runVerification() {
  console.log("\n================================================================================");
  console.log("🌾 Aravalli FPC — Phase 1C Full Flow Verification (Live MongoDB Atlas)");
  console.log("================================================================================\n");

  configureDns();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in server/.env");
    process.exit(1);
  }

  // Connect client mongoose for direct DB assertions
  await mongoose.connect(uri);
  console.log("✅ 1. MongoDB Atlas Connected for Direct DB Verification.");

  // Clean any old test records
  await BuyerEnquiry.deleteMany({ email: "procurement@aravalliherbals.com" });

  // Check health endpoint
  const health = await api("/api/health");
  console.log("✅ 2. Live Server Health Check:", health.body);
  if (health.body?.database !== "connected") {
    throw new Error("Server database is not connected!");
  }

  let createdEnquiryId = null;
  let adminToken = null;

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Public Buyer Enquiry Submission (POST /api/enquiries)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 1: Public Buyer Enquiry Submission ---");
    const enquiryPayload = {
      buyerName: "Aravalli Herbal Exports Pvt Ltd",
      organisationName: "Aravalli Herbals International",
      email: "procurement@aravalliherbals.com",
      phone: "+91 98765 43210",
      location: "Udaipur, Rajasthan",
      product: "Wild Forest Raw Honey",
      expectedQuantity: "500 kg / month",
      purchaseRequirement: "Regular / Recurring",
      message: "Looking for regular bulk procurement of raw forest honey for European export.",
    };

    const submitRes = await api("/api/enquiries", {
      method: "POST",
      body: enquiryPayload,
    });

    console.log(`Response Status: ${submitRes.status}`);
    console.log(`Response Success: ${submitRes.body?.success}`);
    console.log(`Response Message: ${submitRes.body?.message}`);

    if (submitRes.status !== 201 || !submitRes.body?.data?._id) {
      throw new Error(`Failed to submit enquiry: ${JSON.stringify(submitRes.body)}`);
    }

    createdEnquiryId = submitRes.body.data._id;
    console.log(`✅ Public Enquiry Created with ID: ${createdEnquiryId}`);

    // REQUIREMENT 5 Check: notes MUST NEVER be exposed in public APIs
    if ("notes" in submitRes.body.data) {
      throw new Error("❌ Security Violation: 'notes' field was exposed in public API response!");
    } else {
      console.log("🔒 Verified Requirement 5: 'notes' field is strictly omitted from public API response.");
    }

    // -------------------------------------------------------------------------
    // STEP 2: MongoDB Verification
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 2: Direct MongoDB Verification ---");
    const dbDoc = await BuyerEnquiry.findById(createdEnquiryId);
    if (!dbDoc) throw new Error("Document not found in MongoDB!");
    console.log(`✅ MongoDB Document confirmed:`);
    console.log(`   - Buyer Name:   ${dbDoc.buyerName}`);
    console.log(`   - Organisation: ${dbDoc.organisationName}`);
    console.log(`   - Product:      ${dbDoc.product}`);
    console.log(`   - Status:       ${dbDoc.status} (Expected: 'New')`);
    console.log(`   - Notes Array:  ${JSON.stringify(dbDoc.notes)} (Expected empty array)`);

    if (dbDoc.status !== "New") {
      throw new Error(`Expected status 'New', but got '${dbDoc.status}'`);
    }

    // -------------------------------------------------------------------------
    // STEP 3: Admin Login (POST /api/auth/login)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 3: Admin Authentication ---");
    const loginRes = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: process.env.ADMIN_EMAIL || "admin@aravallifpc.org",
        password: process.env.ADMIN_PASSWORD || "AravalliAdmin@2026!",
      },
    });

    console.log(`Login Status: ${loginRes.status}`);
    if (loginRes.status !== 200 || !loginRes.body?.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }

    adminToken = loginRes.body.token;
    console.log(`✅ Admin logged in successfully: ${loginRes.body.user?.name} (${loginRes.body.user?.email})`);

    const authHeader = { Authorization: `Bearer ${adminToken}` };

    // -------------------------------------------------------------------------
    // STEP 4: Enquiry List (GET /api/admin/enquiries)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 4: Enquiry List ---");
    const listRes = await api("/api/admin/enquiries", {
      method: "GET",
      headers: authHeader,
    });

    console.log(`List Status: ${listRes.status}`);
    console.log(`Total Enquiries in Admin List: ${listRes.body?.count}`);
    const foundInList = listRes.body?.data?.some((e) => e._id === createdEnquiryId);
    if (!foundInList) throw new Error("Created enquiry was not found in admin list!");
    console.log("✅ Created enquiry is present in admin list.");

    // -------------------------------------------------------------------------
    // STEP 5: Search & Filter Verification
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 5: Search & Filter ---");
    // 5a. Search by keyword
    const searchRes = await api("/api/admin/enquiries?search=Herbals", {
      headers: authHeader,
    });
    console.log(`Search 'Herbals' returned: ${searchRes.body?.count} results`);
    if (!searchRes.body?.data?.some((e) => e._id === createdEnquiryId)) {
      throw new Error("Search filter failed to find matching enquiry!");
    }
    console.log("✅ Search filter by buyer/org keyword works.");

    // 5b. Status filter: New
    const filterNewRes = await api("/api/admin/enquiries?status=New", {
      headers: authHeader,
    });
    console.log(`Filter status 'New' returned: ${filterNewRes.body?.count} results`);
    if (!filterNewRes.body?.data?.some((e) => e._id === createdEnquiryId)) {
      throw new Error("Status 'New' filter failed to find newly submitted enquiry!");
    }
    console.log("✅ Filter by status 'New' works.");

    // 5c. Status filter: Converted (should not include this enquiry yet)
    const filterConvertedRes = await api("/api/admin/enquiries?status=Converted", {
      headers: authHeader,
    });
    if (filterConvertedRes.body?.data?.some((e) => e._id === createdEnquiryId)) {
      throw new Error("Enquiry unexpectedly appeared in 'Converted' filter!");
    }
    console.log("✅ Filter by status 'Converted' correctly excludes new enquiry.");

    // -------------------------------------------------------------------------
    // STEP 6: Enquiry Details (GET /api/admin/enquiries/:id)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 6: Enquiry Details by ID ---");
    const detailRes = await api(`/api/admin/enquiries/${createdEnquiryId}`, {
      headers: authHeader,
    });

    console.log(`Detail Status: ${detailRes.status}`);
    const detailData = detailRes.body?.data;
    if (detailData?._id !== createdEnquiryId) {
      throw new Error("Enquiry detail ID mismatch!");
    }
    console.log(`✅ Enquiry details retrieved: Buyer=${detailData.buyerName}, Product=${detailData.product}`);

    // -------------------------------------------------------------------------
    // STEP 7: Status Update (PATCH /api/admin/enquiries/:id/status)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 7: Status Update to 'Negotiating' ---");
    const statusUpdateRes = await api(`/api/admin/enquiries/${createdEnquiryId}/status`, {
      method: "PATCH",
      headers: authHeader,
      body: { status: "Negotiating" },
    });

    console.log(`Status Update Response: ${statusUpdateRes.body?.message}`);
    if (statusUpdateRes.body?.data?.status !== "Negotiating") {
      throw new Error("Status update failed to reflect 'Negotiating'!");
    }
    console.log("✅ Status successfully updated to 'Negotiating'.");

    // -------------------------------------------------------------------------
    // STEP 8: Add Internal Note (POST /api/admin/enquiries/:id/notes)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 8: Add Internal Follow-up Note ---");
    const noteText = "Discussed MOQs with procurement director. Dispatched 1kg sample batch via express parcel.";
    const addNoteRes = await api(`/api/admin/enquiries/${createdEnquiryId}/notes`, {
      method: "POST",
      headers: authHeader,
      body: { text: noteText },
    });

    console.log(`Note Addition Status: ${addNoteRes.status}`);
    console.log(`Note Addition Message: ${addNoteRes.body?.message}`);

    const updatedEnquiry = addNoteRes.body?.data;
    if (!updatedEnquiry?.notes || updatedEnquiry.notes.length === 0) {
      throw new Error("No notes found on updated enquiry!");
    }

    const savedNote = updatedEnquiry.notes[updatedEnquiry.notes.length - 1];
    console.log(`Saved Note Details in MongoDB:`);
    console.log(`   - text:      "${savedNote.text}"`);
    console.log(`   - createdAt: ${savedNote.createdAt}`);
    console.log(`   - createdBy: ${savedNote.createdBy}`);

    // Requirement 2 Check: text, createdAt, createdBy from authenticated admin
    if (savedNote.text !== noteText) throw new Error("Note text mismatch!");
    if (!savedNote.createdAt) throw new Error("Note createdAt missing!");
    if (!savedNote.createdBy || savedNote.createdBy === "Unknown") {
      throw new Error("Note createdBy missing or unauthenticated!");
    }
    console.log(`✅ Requirement 2 Met: note schema matches { text, createdAt, createdBy: '${savedNote.createdBy}' }`);

    // -------------------------------------------------------------------------
    // STEP 9: Dashboard Metrics Verification (GET /api/admin/enquiries/stats)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 9: Dashboard Metrics Verification ---");
    const statsRes = await api("/api/admin/enquiries/stats", {
      headers: authHeader,
    });

    console.log(`Stats Response Status: ${statsRes.status}`);
    const stats = statsRes.body?.data;
    console.log("Real MongoDB Stats from API:", stats);
    console.log(`- Total Enquiries: ${stats.total}`);
    console.log(`- New Enquiries:   ${stats.new}`);
    console.log(`- Active Leads:    ${stats.activeLeads}`);
    console.log(`- Converted:       ${stats.converted}`);
    console.log(`- Closed:          ${stats.closed}`);

    // Verify definitions (Requirement 3):
    // Total = all enquiries
    // Active Leads includes "Negotiating"
    if (stats.activeLeads < 1) {
      throw new Error("Active Leads count should be at least 1 after moving to 'Negotiating'!");
    }
    console.log("✅ Requirement 3 Met: Active Leads correctly accounts for 'Negotiating' lead.");

    // -------------------------------------------------------------------------
    // STEP 10: Status Update to 'Converted' & Metric Re-check
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 10: Convert Lead and Verify Metric Re-check ---");
    await api(`/api/admin/enquiries/${createdEnquiryId}/status`, {
      method: "PATCH",
      headers: authHeader,
      body: { status: "Converted" },
    });

    await api(`/api/admin/enquiries/${createdEnquiryId}/notes`, {
      method: "POST",
      headers: authHeader,
      body: { text: "Commercial contract signed. Initial order confirmed." },
    });

    const reStatsRes = await api("/api/admin/enquiries/stats", {
      headers: authHeader,
    });

    const reStats = reStatsRes.body?.data;
    console.log("Updated MongoDB Stats after Conversion:", reStats);
    if (reStats.converted < 1) {
      throw new Error("Converted count should be at least 1 after moving to 'Converted'!");
    }
    console.log("✅ Converted metric updated in real time from MongoDB.");

    console.log("\n================================================================================");
    console.log("🎉 ALL 10 STEPS OF THE COMPLETE FLOW VERIFIED ON LIVE MONGODB ATLAS!");
    console.log("================================================================================\n");

  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:", error);
    process.exitCode = 1;
  } finally {
    // Clean up test document
    if (createdEnquiryId) {
      await BuyerEnquiry.findByIdAndDelete(createdEnquiryId);
      console.log(`🧹 Cleaned up test enquiry: ${createdEnquiryId}`);
    }
    await mongoose.disconnect();
    console.log("MongoDB disconnected.\n");
  }
}

runVerification();
