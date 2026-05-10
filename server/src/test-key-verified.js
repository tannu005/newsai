import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAhOkNItKlDY6-8o2Gt7aYfk_CKMXgznCs");

async function testKey() {
  try {
    // Using one of the models from the list
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent("Hello, are you working?");
    console.log("✅ API Key and Model are working!");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ Test failed!");
    console.error("Error:", error.message);
  }
}

testKey();
