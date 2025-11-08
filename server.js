import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Root route
app.get("/", (req, res) => {
  res.send("✅ Family Expense AI Agent Backend Running!");
});

// Chat endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, income, salariedCount, members, expenses } = req.body;

    // Create context string
    const context = `
You are a smart Indian financial advisor bot.
Here is the family data:
- Monthly income: ₹${income}
- Salaried persons: ${salariedCount}
- Family members: ${members
      .map((m, i) => `Member ${i + 1}: age ${m.age}`)
      .join(", ")}
- Recent expenses: ${expenses
      .slice(-5)
      .map((e) => `${e.category} ₹${e.amount}`)
      .join(", ")}

User query: "${message}"
Give realistic Indian middle-class budgeting advice with positivity and clarity.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful family finance assistant." },
        { role: "user", content: context },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const answer = completion.choices[0].message.content.trim();

    res.json({ ok: true, answer });
  } catch (error) {
    console.error("AI Error:", error);
    res.json({ ok: false, error: error.message });
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`🚀 AI Agent backend running on port ${PORT}`));
