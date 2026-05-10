import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAhOkNItKlDY6-8o2Gt7aYfk_CKMXgznCs");

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAhOkNItKlDY6-8o2Gt7aYfk_CKMXgznCs`);
    const data = await response.json();
    console.log("Models:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
