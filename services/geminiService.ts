
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, TransactionLog } from "../types";

// Always initialize the GoogleGenAI client using a named parameter with process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Changed parameter from BorrowRecord[] to TransactionLog[] to match the audit trail data passed in Dashboard.tsx
export const getInventoryInsights = async (items: InventoryItem[], history: TransactionLog[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this inventory data and borrowing history. Provide a short summary of stock health, identify frequently borrowed items, and suggest restocking for low items.
      
      Inventory: ${JSON.stringify(items)}
      Borrow History: ${JSON.stringify(history)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            alerts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "alerts", "recommendations"]
        }
      }
    });

    // Extract the generated text using the .text property (not a method).
    const resultText = response.text;
    if (!resultText) {
      return {
        summary: "Inventory data analysis unavailable.",
        alerts: ["Empty response from AI."],
        recommendations: ["Manual audit recommended."]
      };
    }

    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      summary: "Inventory data analysis unavailable.",
      alerts: ["Connection to AI services lost."],
      recommendations: ["Check manual stock logs."]
    };
  }
};
