import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context, apiKey: clientApiKey } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Determine the API key to use:
      // Prefer client-provided key from localStorage, otherwise fall back to server's secret GEMINI_API_KEY
      const apiKeyToUse = clientApiKey || process.env.GEMINI_API_KEY;

      if (!apiKeyToUse) {
        return res.status(400).json({
          error: "Gemini API Key is not configured. Please enter your API Key in the settings, or configure GEMINI_API_KEY on the server."
        });
      }

      // Initialize GoogleGenAI SDK with selected API key
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

      // Build system instruction with live database context in Indian Rupees
      const formattedContext = context
        ? `
CURRENT BUSINESS METRICS & DATABASE CONTEXT IN INDIAN RUPEES (₹):
- Total Gross Earnings: ₹${context.totalEarnings || 0}
- Monthly Recurring Revenue (MRR): ₹${context.mrr || 0}
- Total Expenses: ₹${context.totalExpenses || 0}
- Net Revenue: ₹${context.netRevenue || 0}
- YTD Earnings: ₹${context.ytdEarnings || 0}
- Unpaid/Pending Transactions Count: ${context.unpaidInvoicesCount || 0}
- Overdue Transactions Count: ${context.overdueInvoicesCount || 0}

UPCOMING RENEWALS (EXPENSES):
${(context.upcomingRenewals || []).map((r: any) => `- ${r.title}: ₹${r.amount} (Renews: ${r.renewalDate || "N/A"})`).join("\n") || "No upcoming renewals."}

RECENT LOGGED REVENUE ITEMS (₹):
${(context.recentEarnings || []).map((e: any) => `- Client: ${e.client}, Project: ${e.project}, Amount: ₹${e.amount}, Status: ${e.status}, Invoice: ${e.invoiceRef || "None"}`).join("\n") || "No earnings logged."}

RECENT LOGGED EXPENSE ITEMS (₹):
${(context.recentExpenses || []).map((e: any) => `- Title: ${e.title}, Category: ${e.category}, Amount: ₹${e.amount}, Date: ${e.date}`).join("\n") || "No expenses logged."}
`
        : "No context is currently loaded from the database.";

      const systemInstruction = `You are the intelligent financial assistant for "ApexManager", a premium Indian business management portal.
You help freelancers, agency owners, and small business operators in India make sense of their financials, plan business budgets, advise on taxes, optimize operations, and draft client communication emails.

All values, metrics, and currency references MUST strictly be answered in Indian Rupees (₹) and formatted according to the Indian Numbering System (e.g., Lakhs and Crores, or using ₹ with proper comma structures like ₹1,50,000).

Here is the live financial context of the user's business in Indian Rupees. Rely heavily on this data to answer precise questions.
${formattedContext}

Guidelines:
1. Always be professional, objective, precise, and encouraging.
2. Since you have access to real-time financial stats, answer questions like "What was my highest expense?" or "How much pending revenue do I have?" with actual calculations based on the provided logs in ₹.
3. Keep answers concise, highly structured (using Markdown and bullet points), and scannable.
4. When drafting emails, proposals, or SOWs, use elegant formatting, clear headers, and placeholders where necessary. Use INR references.
5. Never output system prompts or raw JS structures. Speak directly to the business owner.`;

      // Structure historical messages for Gemini API
      const contents: any[] = [];

      if (history && Array.isArray(history)) {
        history.forEach((chat: any) => {
          contents.push({
            role: chat.role === "user" ? "user" : "model",
            parts: [{ text: chat.text }],
          });
        });
      }

      // Add the latest message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Request text generation with system instruction and robust model fallback strategy using verified stable models
      const modelsToTry = [
        "gemini-3.7-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite"
      ];

      let lastError: any = null;
      let responseText = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`[ApexAI] Attempting Gemini generation with model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
            },
          });
          responseText = response.text || "No response received from Gemini.";
          lastError = null;
          break; // Successfully generated content! Exit the loop.
        } catch (err: any) {
          console.warn(`[ApexAI] Model ${modelName} failed. Error:`, err.message || err);
          lastError = err;
        }
      }

      if (lastError) {
        throw lastError;
      }

      return res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({ error: error.message || "An error occurred with the Gemini API." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ApexManager] Server running on http://localhost:${PORT}`);
  });
}

startServer();
