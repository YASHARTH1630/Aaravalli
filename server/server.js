import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, isDbConnected } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminEnquiryRoutes from "./routes/adminEnquiryRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

// Determine directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (supports running from root or server directory)
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config(); // fallback to default current working directory .env

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration: support comma-separated origins from CLIENT_URL
const clientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server) or listed origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS policy"));
    },
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Aravalli Aadivasi Mahila Grih Udyog FPC — Backend API",
    status: "online",
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? "connected" : "disconnected",
    version: "1.0.0",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/enquiries", adminEnquiryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/enquiries", enquiryRoutes);

// Catch 404 for unmapped endpoints
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Initialize Database Connection and Start Listening
async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `\n🌾 Aravalli FPC Backend running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
    console.log(`📡 Healthcheck available at: http://localhost:${PORT}/api/health\n`);
  });

  // Graceful shutdown handlers
  const shutdown = () => {
    console.log("\nShutting down server gracefully...");
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer();

export default app;
