require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ExcelJS = require("exceljs"); 

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log(err));

// Schema
const formSchema = new mongoose.Schema({}, { strict: false });
const Form = mongoose.model("Form", formSchema);

// SAVE API
app.post("/api/save-form", async (req, res) => {
  try {
    const formData = req.body;

    console.log("Incoming data:", formData);

    // Save in MongoDB
    const data = new Form(formData);
    await data.save();

    // Send to Google Sheet
    const response = await fetch("https://script.google.com/macros/s/AKfycbzV4wY8XSO_K9-wK8umpoG25_JRWQ20_z322hwG-wi2f7pBMk4IfQd-ePPZcA-FNPhl/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.text();
    console.log("Google response:", result);

    // ✅ VERY IMPORTANT: always send response
    return res.status(200).json({
      message: "Saved successfully",
      google: result
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);

    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
});


app.get("/api/get-data", async (req, res) => {
  const data = await Form.find();
  res.json(data);
});


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


app.listen(5000, () => console.log("🚀 Server running on port 5000"));