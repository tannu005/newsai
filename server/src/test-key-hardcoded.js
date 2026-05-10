import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAhOkNItKlDY6-8o2Gt7aYfk_CKMXgznCs");

async function testKey() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("✅ API Key is valid!");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ API Key is invalid!");
    console.error("Error:", error.message);
  }
}

testKey();
