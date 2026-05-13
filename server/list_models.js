import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    const data = await result.json();
    console.log("Available Models:");
    data.models?.forEach(m => console.log(`- ${m.name}`));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
