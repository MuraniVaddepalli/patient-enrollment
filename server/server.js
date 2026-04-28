require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ExcelJS = require("exceljs");

const app = express();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "1mb" }));

// Schema
const formSchema = new mongoose.Schema(
  {
    syncStatus: {
      type: String,
      enum: ["pending", "processing", "synced", "failed"],
      default: "pending",
    },
    retryCount: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: false }
);

const Form = mongoose.model("Form", formSchema);

// Health check endpoint — use for uptime monitoring to prevent cold starts
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  res.status(200).json({ status: "ok", db: dbStatus });
});

// SAVE API
app.post("/api/save-form", async (req, res) => {
  try {
    const formData = req.body;

    const data = new Form({
      ...formData,
      syncStatus: "pending",
      retryCount: 0,
    });

    await data.save();

    return res.status(200).json({
      message: "Saved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/get-data", async (req, res) => {
  try {
    const data = await Form.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get("/api/health", (req, res) => {
//   res.send("OK");
// });


const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzV4wY8XSO_K9-wK8umpoG25_JRWQ20_z322hwG-wi2f7pBMk4IfQd-ePPZcA-FNPhl/exec";

async function syncToGoogle() {
  try {
    const records = await Form.find({
      syncStatus: { $in: ["pending", "failed"] },
      retryCount: { $lt: 5 },
    }).limit(5);

    for (const item of records) {
      try {
        item.syncStatus = "processing";
        await item.save();

        const res = await fetch(GOOGLE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
          signal: AbortSignal.timeout(8000),
        });

        const result = await res.text();

        if (!res.ok) throw new Error(result);

        item.syncStatus = "synced";
        item.lastError = "";
        await item.save();

        console.log("✅ Synced:", item._id);
      } catch (err) {
        item.syncStatus = "failed";
        item.retryCount += 1;
        item.lastError = err.message;
        await item.save();

        console.log("❌ Failed:", item._id, err.message);
      }
    }
  } catch (err) {
    console.error("Worker error:", err);
  }
}

// ADD EXCEL API HERE
app.get("/api/download-excel", async (req, res) => {
  try {
    const data = await Form.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Patients");

    worksheet.columns = [
      { header: "First Name", key: "firstName" },
      { header: "Last Name", key: "lastName" },
      { header: "Mobile", key: "mobile" },
      { header: "Email", key: "email" },
      { header: "Purpose", key: "purpose" },
      { header: "Doctor", key: "doctorName" },
      { header: "Date", key: "date" },
    ];

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=patients.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Process-level error handlers to prevent crashes from killing the instance
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB with optimized options for free-tier / serverless environments
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log("✅ MongoDB Atlas Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);

      // run every 30 seconds instead of 5 to reduce event-loop pressure
      setInterval(syncToGoogle, 30000);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();

