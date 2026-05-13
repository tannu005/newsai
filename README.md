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
- **Semantic Search**: Uses Google's `text-embedding-004` to find the most relevant news snippets.
- **Grounded Answers**: The AI (Gemini 1.5 Flash) answers *only* using the provided dataset context.
- **Source Citations**: Every response includes interactive cards linking back to the original news articles (Reuters, Bloomberg, etc.).

### 2. Deep Analysis Engine (Bonus Feature)
Every AI response features an **"Analyze with AI"** button that performs a multi-step workflow:
- **Detailed Explanation**: Nuanced breakdown of the news event.
- **Key Insights**: Auto-extracted bullet points of critical information.
- **Simplified Version**: Easy-to-understand summary for general audiences.
- **Additional Context**: Broader background information not in the original answer.
- **Follow-up Questions**: Smart suggestions to continue the exploration.

### 3. Professional History Management
- **Hybrid Persistence**: Supports MongoDB (Production), JSON Files (Local), and In-Memory Fallbacks (Vercel).
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

## 🛠 Setup & Installation

### 1. Prerequisites
- **Node.js 18+**
- **Google Gemini API Key** (from [AI Studio](https://aistudio.google.com/))
- **MongoDB URI** (Optional, for production history persistence)

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in GOOGLE_API_KEY and MONGODB_URI (if using)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📄 Dataset
The application comes bundled with a curated dataset of 30 modern news articles covering:
- **Technology** (OpenAI, Quantum Computing, SpaceX)
- **Business** (Federal Reserve, EV Market, Supply Chains)
- **Science** (Green Hydrogen, James Webb Telescope)
- **Health** (Alzheimer's breakthroughs, CRISPR therapy)

---

## 👨‍💻 Author
**Yogesh Pannu** — Full-Stack & GenAI Developer

---
## 📜 License
MIT
