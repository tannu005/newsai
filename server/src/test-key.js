import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testKey() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("✅ API Key is valid!");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ API Key is invalid!");
    console.error("Error:", error.message);
    if (error.status) console.error("Status:", error.status);
    if (error.errorDetails) console.error("Details:", JSON.stringify(error.errorDetails, null, 2));
  }
}

testKey();
