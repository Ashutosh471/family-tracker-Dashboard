import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.OPENAI_API_KEY;

// ✅ Check for API key early
if (!apiKey || apiKey.trim() === "") {
  console.log("❌ Missing OpenAI API key. Please add it to your .env file like:");
  console.log("   OPENAI_API_KEY=sk-your-real-key-here");
  console.log("⚠️  Backend will start, but AI features won't work until key is added.\n");
}

const openai = new OpenAI({
  apiKey: apiKey || "none"
});

app.get("/", (req, res) => {
  if (!apiKey) {
    return res.status(500).send("⚠️ Missing OpenAI API Key. Add it to your .env file.");
  }
  res.send("✅ Family Expense Tracker AI Backend Running!");
});

app.post("/api/advice", async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        reply: "⚠️ AI features are disabled — missing API key in backend.",
      });
    }

    const { income, salaried, members, totalExpenses } = req.body;

    if (!income || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, reply: "Missing family details or income." });
    }

    const familySummary = members
      .map((m, i) => `${m.name || "Member " + (i + 1)} (Age: ${m.age})`)
      .join(", ");

    const prompt = `
      You are a smart family financial advisor AI.
      Family Details:
      - Total Monthly Income: ₹${income}
      - Salaried Members: ${salaried}
      - Total Expenses So Far: ₹${totalExpenses || 0}
      - Members: ${familySummary}

      10% of income is automatically saved.
      Suggest a realistic monthly spending plan for categories like Food, Rent, Education, Groceries, Transport, Insurance, Health, and Entertainment.
      Include a short summary and 2–3 actionable tips.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a financial planning assistant." },
        { role: "user", content: prompt }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (err) {
    console.error("❌ Error fetching AI advice:", err.message);
    res.status(500).json({
      success: false,
      reply: "❌ Unable to connect to AI. Check your internet or API key."
    });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
);
