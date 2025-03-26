import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('API Key ===> ', process.env.GEMINI_API_KEY);

// Generate AI Response using Gemini
const generateAIResponse = async (newMessage) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(newMessage);
        const response = result.response.text();

        console.log("Gemini API Response:", response);
        return response;
    } catch (error) {
        console.error("Gemini AI Chat Error:", error);
        return "Sorry, I couldn't process your request.";
    }
};

// ✅ Export for CommonJS Compatibility
export { generateAIResponse };
