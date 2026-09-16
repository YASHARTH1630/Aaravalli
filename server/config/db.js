import mongoose from "mongoose";
import dns from "node:dns";

/**
 * Optionally configure custom DNS servers for Node's resolver (e.g. in environments
 * where Node's default loopback lookup cannot resolve Atlas SRV records).
 * Preserves default system behavior if DNS_SERVERS is not configured.
 */
export function configureDns() {
  const customDns = process.env.DNS_SERVERS;
  if (customDns && customDns.trim()) {
    const servers = customDns.split(",").map((s) => s.trim()).filter(Boolean);
    if (servers.length > 0) {
      try {
        dns.setServers(servers);
        console.log(`📡 [DNS] Configured custom DNS servers: ${servers.join(", ")}`);
      } catch (err) {
        console.warn(`⚠️  [DNS] Failed to set custom DNS servers: ${err.message}`);
      }
    }
  }
}

/**
 * Connect to MongoDB using the URI defined in process.env.MONGODB_URI.
 * Designed to fail gracefully if the URI is not yet configured, allowing
 * the Express server and non-DB endpoints to run reliably.
 */
export async function connectDB() {
  configureDns();

  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.warn(
      "\n⚠️  [MongoDB] Warning: MONGODB_URI is not set in environment variables.\n" +
      "   The Express server will run, but database features will be disabled.\n" +
      "   To connect MongoDB, create server/.env and add your MONGODB_URI connection string.\n"
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB] Connection error: ${error.message}`);
    console.warn("   The server will remain running in offline database mode.\n");
    return false;
  }
}

/**
 * Returns true if the MongoDB connection is open and ready.
 */
export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Monitor connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  [MongoDB] Disconnected from database.");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ [MongoDB] Reconnected to database.");
});
