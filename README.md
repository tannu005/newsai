# NewsAI: Premium Intelligent RAG Dashboard
Developed by **Tannu Yadav**

NewsAI is a high-performance RAG (Retrieval-Augmented Generation) platform designed to synthesize and analyze current news datasets using Gemini 2.5 Flash Lite and Vector Embeddings. It features a stunning Three.js-powered 3D immersive UI and a robust background ingestion pipeline powered by Inngest.

![NewsAI Dashboard Screenshot](https://raw.githubusercontent.com/user-attachments/assets/your-placeholder-image)

## 🌟 Key Features

- **Advanced RAG Pipeline:** Intelligent retrieval of news context for grounded AI responses.
- **Gemini 2.5 Flash Lite:** Leveraging Google's latest high-speed, high-reasoning LLM.
- **Inngest Background Workers:** Decoupled ingestion pipeline with real-time progress tracking.
- **Deep AI Analysis:** Interactive "Analyze with AI" feature for executive summaries and insight extraction.
- **Premium 3D UI:** A sleek, dark-mode dashboard with interactive Three.js backgrounds and micro-animations.
- **Resilient Vector Store:** Sequential fallback mechanisms to handle API rate limits gracefully.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Lucide React, Three.js
- **Backend:** Node.js, Express, LangChain
- **AI Models:** Gemini 2.5 Flash Lite (LLM), Gemini Embedding 2 (Embeddings)
- **Infrastructure:** Inngest (Event Pipeline), Vercel (Deployment)

## 🛠️ Local Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### 2. Clone and Install
```bash
git clone https://github.com/tannu005/newsai.git
cd newsai
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```
Fill in your `GOOGLE_API_KEY` in `server/.env`.

### 4. Run the Development Environment
Start both the client and server concurrently:
```bash
npm run dev
```

### 5. Start the Inngest Dev Server
In a separate terminal, start the Inngest CLI to handle background ingestion events:
```bash
npm run inngest
```

## 📂 Data Ingestion
1. Open the dashboard at `http://localhost:5173`.
2. Click the **"Ingest Data"** button in the header.
3. Monitor the live progress bar as the system loads, chunks, and vectorizes the news dataset.
4. Once completed, you can start chatting with your data!

## 🌍 Production Deployment

### Vercel Deployment
This project is pre-configured for Vercel. 
1. Push your code to a new GitHub repository.
2. Connect the repo to Vercel.
3. Add the `GOOGLE_API_KEY` as an environment variable in the Vercel dashboard.
4. Ensure `server/src/data/news_dataset.json` is included in the build (handled by `vercel.json`).

---

## 📺 Demo Video
[Click here to watch the full walkthrough (5 mins)](https://github.com/tannu005/newsai/blob/main/demo_video.md)

## 📄 License
MIT License. Created by [Tannu Yadav](https://github.com/tannu005).
