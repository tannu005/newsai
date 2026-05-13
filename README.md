# 🧠 NewsAI — Premium Intelligent News Assistant

A professional, full-stack AI-powered news platform that uses **Retrieval-Augmented Generation (RAG)** to provide grounded, expert-level answers from a curated news dataset.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs) ![MongoDB](https://img.shields.io/badge/MongoDB-Persisted-47A248?logo=mongodb) ![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?logo=google) ![Three.js](https://img.shields.io/badge/Three.js-Metallic-000000?logo=threedotjs)

---

## 🎨 Design Philosophy: Black & Gold Edition
This project has been meticulously designed for **Recruiter Review**, featuring a luxury dark aesthetic that feels premium and state-of-the-art:
- **Luxury Theme**: A "Famous Rich Black" (#0D0D0D) and Matte Gold (#FFD700) color palette.
- **3D Metallic Assistant**: An interactive 3D robot companion with realistic steel/copper textures.
- **Glassmorphic UI**: High-end translucent panels with subtle gold borders and glow effects.
- **Micro-Animations**: Framer Motion transitions and GSAP-powered hover effects.

---

## 🚀 Core Features

### 1. RAG-Powered Intelligence
- **Semantic Search**: Uses Google's `gemini-embedding-001` to find the most relevant news snippets.
- **Grounded Answers**: The AI (Gemini 2.5 Flash Lite) answers *only* using the provided dataset context.
- **Source Citations**: Every response includes interactive cards linking back to the original news articles (Reuters, Bloomberg, etc.).

### 2. Deep Analysis Engine (Bonus Feature)
Every AI response features an **"Analyze with AI"** button that performs a multi-step workflow:
- **Detailed Explanation**: Nuanced breakdown of the news event.
- **Key Insights**: Auto-extracted bullet points of critical information.
- **Simplified Version**: Easy-to-understand summary for general audiences.
- **Additional Context**: Broader background information not in the original answer.
- **Follow-up Questions**: Smart suggestions to continue the exploration.

### 3. Professional History Management (MongoDB)
- **Primary Database**: The project uses **MongoDB** (via Mongoose) for robust chat history persistence.
- **Hybrid Strategy**: Supports MongoDB (Production), JSON Files (Local), and In-Memory Fallbacks (Serverless/Vercel).
- **Session Grouping**: Automatically organizes your chats into named sessions based on your first question.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  React + Three.js + Framer Motion               │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐   │
│  │ 3D Robot │ │ Chat UI   │ │ History Panel│   │
│  └──────────┘ └─────┬─────┘ └──────────────┘   │
│                     │                            │
│              fetch('/api/...')                    │
|                     ▼                            |
├─────────────────────┼───────────────────────────┤
│                   Backend                        │
│  Express.js + LangChain + Mongoose              │
│  ┌──────────┐ ┌─────┴─────┐ ┌──────────────┐   │
│  │ Ingest   │ │ RAG Svc   │ │ History Svc  │   │
│  │ Pipeline │ │ (Gemini)  │ │ (Mongo/JSON) │   │
│  └────┬─────┘ └─────┬─────┘ └──────┬───────┘   │
│       │             │               │            │
│  ┌────┴─────┐ ┌─────┴─────┐ ┌──────┴───────┐   │
│  │ Chunker  │ │ Vector    │ │ MongoDB /    │   │
│  │ + Embed  │ │ Store     │ │ history.json │   │
│  └──────────┘ └───────────┘ └──────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/chat` | Send question → get RAG answer + sources |
| `POST` | `/api/ingest` | Trigger dataset ingestion and embedding |
| `GET` | `/api/history` | Fetch chat history with session grouping |
| `DELETE`| `/api/history` | Clear all history |
| `GET` | `/api/health` | Diagnostic check (API status, DB status, Model) |

---

## 🛠 Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 18, Vite, React Three Fiber, Framer Motion, Lucide Icons |
| **Design** | Premium Black & Gold Theme (#0D0D0D / #FFD700) |
| **3D Graphics** | Three.js (Interactive Robotic Assistant) |
| **Backend** | Node.js, Express.js |
| **Database** | **MongoDB** (via Mongoose) |
| **AI / RAG** | LangChain.js, Google Gemini 2.5 Flash Lite |
| **Embeddings** | Gemini `gemini-embedding-001` |
| **Vector Store** | MemoryVectorStore (with JSON/Disk persistence) |
| **Styling** | Vanilla CSS (Glassmorphic design system) |

---

## ⚙️ Detailed Setup & Installation Procedure

This project uses a monorepo structure. Follow these step-by-step instructions to get everything running locally, including the Inngest background worker.

### Step 1: Clone and Install Dependencies
Open your terminal and clone the repository, then install the root dependencies.
```bash
git clone https://github.com/tannu005/news-ai-premium-dashboard.git
cd news-ai-premium-dashboard
npm install
```

### Step 2: Configure Environment Variables
You need a Google Gemini API Key for the RAG and LLM functionality to work.
1. Navigate to the `server` directory: `cd server`
2. Copy the example environment file: `cp .env.example .env` (or rename it manually).
3. Open `.env` and add your keys:
   - `GOOGLE_API_KEY=your_gemini_key_here`
   - `MONGODB_URI=your_mongodb_connection_string` *(Optional: If left blank, chat history will gracefully fall back to local disk/memory).*

### Step 3: Run the Application (Frontend & Backend)
We use `concurrently` to run both the frontend and backend with a single command from the root directory.
1. Go back to the root directory: `cd ..`
2. Start the development servers: `npm run dev`
*(This will start the backend Express server on `http://localhost:3001` and the React Vite frontend on `http://localhost:5173`).*

### Step 4: Start the Inngest Local Dev Server
The application uses **Inngest** for reliable background dataset ingestion.
1. Open a **new terminal window**.
2. Make sure you are in the root directory: `cd news-ai-premium-dashboard`
3. Run the Inngest dev server: `npm run inngest`
*(This launches the Inngest dashboard at `http://localhost:8288` and connects to your backend).*

### Step 5: Ingest the Data
1. Open your browser and navigate to `http://localhost:5173`.
2. Click the **"Ingest Data"** button in the top header.
3. You will see a real-time progress bar. The backend has securely offloaded the chunking and vectorization task to Inngest!
4. Once it reaches 100% and displays the vector count, the chatbot is ready.

### 🚀 Production Deployment (Vercel)
This project is configured for seamless deployment on Vercel. 
1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the root `package.json` build scripts.
3. Add `GOOGLE_API_KEY` and `MONGODB_URI` to your Vercel Environment Variables.
4. **Note:** The `vercel.json` file is already pre-configured to bundle the `news_dataset.json` correctly for the serverless environment, ensuring no 500 errors occur in production!
---

## 📄 Dataset
The application comes bundled with a curated dataset of 30 modern news articles covering:
- **Technology** (OpenAI, Quantum Computing, SpaceX)
- **Business** (Federal Reserve, EV Market, Supply Chains)
- **Science** (Green Hydrogen, James Webb Telescope)
- **Health** (Alzheimer's breakthroughs, CRISPR therapy)

---

## 👨‍💻 Author
**Tannu Yadav** — Full-Stack & GenAI Developer

---
## 📜 License
MIT
