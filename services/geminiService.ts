
import { GoogleGenAI } from "@google/genai";

export const generateEventDescription = async (title: string, category: string) => {
  // Always initialize GoogleGenAI with the API key from process.env.API_KEY directly
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a catchy, professional, and short event description (max 2 sentences) for an event titled "${title}" in the category "${category}".`,
    });
    // Use the .text property directly to get the generated content as per guidelines
    return response.text || "Join us for this amazing event!";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "Join us for this incredible experience.";
  }
};
