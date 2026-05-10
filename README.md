# 🧠 NewsAI — Intelligent News Chatbot

A full-stack, AI-powered news chatbot that uses **Retrieval-Augmented Generation (RAG)** to answer questions from a curated news dataset. Built with React, Express.js, LangChain, and Google Gemini.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs) ![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C) ![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?logo=google) ![Three.js](https://img.shields.io/badge/Three.js-R169-000000?logo=threedotjs)

---

## ✨ Features

## 🎨 Premium Redesign (Black & Gold Edition)
- **Luxury Theme**: Implemented a famous Rich Black (#0D0D0D) and Gold (#FFD700) color palette.
- **3D Metallic AI Assistant**: Custom-built robotic companion with realistic steel/copper textures and interactive GSAP animations.
- **Matte Gold Typography**: Professional Inter/Roboto font hierarchy with gold/copper keyword highlighting.
- **Pill Badge UI**: Redesigned banner and history panel with modern pill badges and floating gold buttons.
- **Deep Analysis Engine**: Interactive modal system for multi-dimensional news breakdown.
- **RAG-Powered Chat** — Grounded answers from real news articles with source citations
- **Chat History** — Persistent session management with sidebar navigation
- **Real Data Ingestion** — Semantic chunking + vector embeddings from 30 curated news articles
- **Responsive Design** — Premium dark cyberpunk theme, works on mobile/tablet/desktop

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** installed
- **Google Gemini API Key** — free from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install

```bash
cd news-chatbot

# Install backend
cd server
npm install
cp .env.example .env
# Edit .env → add your GOOGLE_API_KEY

# Install frontend
cd ../client
npm install
```

### 2. Configure

Edit `server/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Run

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Ingest Data

Click the **"Ingest Data"** button in the header. This will:
1. Load 30 news articles from the bundled dataset
2. Chunk them into semantic segments
3. Generate vector embeddings via Gemini
4. Store them for similarity search

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  React + Three.js + Framer Motion               │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐   │
│  │ 3D Scene │ │ Chat UI   │ │ History Panel│   │
│  └──────────┘ └─────┬─────┘ └──────────────┘   │
│                     │                            │
│              fetch('/api/...')                    │
├─────────────────────┼───────────────────────────┤
│                   Backend                        │
│  Express.js + LangChain                         │
│  ┌──────────┐ ┌─────┴─────┐ ┌──────────────┐   │
│  │ Ingest   │ │ RAG Svc   │ │ History API  │   │
│  │ Pipeline │ │           │ │              │   │
│  └────┬─────┘ └─────┬─────┘ └──────┬───────┘   │
│       │             │               │            │
│  ┌────┴─────┐ ┌─────┴─────┐ ┌──────┴───────┐   │
│  │ Chunker  │ │ Vector    │ │ JSON File    │   │
│  │ + Embed  │ │ Store     │ │ Storage      │   │
│  └──────────┘ └───────────┘ └──────────────┘   │
│                     │                            │
│              Gemini 2.0 Flash                    │
│         (Embeddings + Generation)                │
└─────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/chat` | Send query → get RAG answer + sources |
| `POST` | `/api/ingest` | Trigger dataset ingestion pipeline |
| `GET` | `/api/ingest/status` | Check ingestion status |
| `GET` | `/api/history` | Fetch chat history (with session grouping) |
| `DELETE` | `/api/history` | Clear all chat history |
| `GET` | `/api/health` | Health check |

---

## 🛠 Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 18, Vite, React Three Fiber, Framer Motion, Lucide Icons |
| Design | Clean Modern UI, Navy/Teal Theme (#0A192F / #14B8A6) |
| 3D Graphics | Three.js, @react-three/drei (Ledger Background) |
| Backend | Node.js, Express.js |
| AI/RAG | LangChain.js, Google Gemini 1.5 Flash |
| Embeddings | Gemini text-embedding-004 |
| Vector Store | LangChain MemoryVectorStore (JSON persistence) |
| Styling | Vanilla CSS (Professional card-based layout) |

---

## 📁 Project Structure

```
news-chatbot/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── hooks/useChat.js    # Chat state management
│   │   ├── services/api.js     # API client
│   │   ├── App.jsx             # Root component
│   │   └── index.css           # Design system
│   └── vite.config.js
├── server/                     # Express backend
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # RAG pipeline services
│   │   ├── data/               # News dataset + history
│   │   └── config/             # Environment config
│   └── .env.example
└── README.md
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render)
- Set root directory to `server`
- Build command: `npm install`
- Start command: `npm start`
- Add `GOOGLE_API_KEY` environment variable

---

## 📜 License

MIT License — feel free to use, modify, and distribute.
