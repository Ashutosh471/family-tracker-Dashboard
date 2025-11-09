// src/index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // loads .env variables

const app = express();

// ✅ Add your frontend Render URL here
const allowedOrigins = [
  "http://localhost:5500", // for local testing (optional)
  "https://family-expense-tracker-dashboard.onrender.com/" // ⚠️ replace with your actual Render static site URL
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

// === Example test route ===
app.post("/api/advice", async (req, res) => {
  try {
    // here your OpenAI logic will go later
    res.json({ reply: "AI advice generated successfully!" });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
