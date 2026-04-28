require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ExcelJS = require("exceljs"); 

const app = express();



const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log(err));

// Schema
const formSchema = new mongoose.Schema({
  syncStatus: {
    type: String,
    enum: ["pending", "processing", "synced", "failed"],
    default: "pending"
  },
  retryCount: { type: Number, default: 0 },
  lastError: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Form = mongoose.model("Form", formSchema);
//SAVE API
app.post("/api/save-form", async (req, res) => {
  try {
    const formData = req.body;

    const data = new Form({
      ...formData,
      syncStatus: "pending",
      retryCount: 0
    });

    await data.save();

    // ✅ send response immediately
    return res.status(200).json({
      message: "Saved successfully"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// app.post("/api/save-form", async (req, res) => {
//   try {
//     const formData = req.body;

//     // ✅ Save in MongoDB (FAST)
//     const data = new Form(formData);
//     await data.save();

//     // ✅ Send response immediately (IMPORTANT)
//     res.status(200).json({
//       message: "Saved successfully"
//     });

//     // ✅ Run Google Sheet in background (NON-BLOCKING)
//     fetch("https://script.google.com/macros/....", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(formData)
//     })
//     .then(res => res.text())
//     .then(result => console.log("Google response:", result))
//     .catch(err => console.error("Google error:", err));

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


app.get("/api/get-data", async (req, res) => {
  const data = await Form.find();
  res.json(data);
});


const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbzV4wY8XSO_K9-wK8umpoG25_JRWQ20_z322hwG-wi2f7pBMk4IfQd-ePPZcA-FNPhl/exec";

async function syncToGoogle() {
  try {
    const records = await Form.find({
      syncStatus: { $in: ["pending", "failed"] },
      retryCount: { $lt: 5 }
    }).limit(5);

    for (const item of records) {
      try {
        item.syncStatus = "processing";
        await item.save();

        const res = await fetch(GOOGLE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(item)
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

        console.log("❌ Failed:", item._id);
      }
    }

  } catch (err) {
    console.error("Worker error:", err);
  }
}


// ✅ ADD EXCEL API HERE
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
      { header: "Date", key: "date" }
    ];

    data.forEach(item => {
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // run every 5 seconds
  setInterval(syncToGoogle, 5000);
});