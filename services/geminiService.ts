import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the build environment
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Gemini API key not found. Inspirational quotes will use a fallback.");
}

export const getInspirationalQuote = async (): Promise<string> => {
  if (!ai) {
    return "The best way to predict the future is to create it.";
  }

  const prompt = "You are an AI assistant. Provide a short, inspiring quote about productivity, habits, or personal growth. It should be a well-known quote. Keep it concise, similar in style to 'The best way to predict the future is to create it.'";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.replace(/"/g, ''); // Remove quotes from the response
  } catch (error) {
    console.error("Error fetching inspirational quote from Gemini:", error);
    return "Success is the sum of small efforts, repeated day in and day out.";
  }
};