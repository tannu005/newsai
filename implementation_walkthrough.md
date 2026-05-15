# NewsAI Implementation Deep Dive

This document outlines the core technical implementation of the NewsAI platform, a RAG-based intelligent news chatbot.

## 1. The RAG Pipeline (`Ingest` Feature)
The ingestion process is the heart of the platform. It transforms raw news articles into a searchable vector database.

### Ingestion Logic (`server/src/services/embeddingService.js`)
When you click **"Ingest"**, the following sequence occurs:
1. **Clear Store**: The existing vector store is purged to avoid duplicates.
2. **Chunking**: Articles are split into 800-character chunks with a 200-character overlap using `RecursiveCharacterTextSplitter`.
3. **Embeddings**: Each chunk is sent to the Google `text-embedding-004` model.
4. **Persistence**: Vectors are saved to a local disk-based store using `HNSWLib`.

```javascript
// Example Ingestion Trigger
export async function ingestDataset() {
  const articles = await loadArticles();
  const docs = await splitter.createDocuments(articles);
  await vectorStore.addDocuments(docs);
  await vectorStore.save(VECTOR_STORE_PATH);
}
```

## 2. Interactive Chat Features

### Copy to Clipboard
Implemented in the `Message` component using the modern Web Clipboard API for a seamless user experience.
- **Location**: `client/src/components/ChatInterface.jsx`
- **Behavior**: Clicking the copy icon triggers a temporary "Copied!" tooltip.

### Delete Message
Each message is tracked by a unique UUID. The delete function performs an optimistic UI update and sends a request to the backend to remove the entry from `history.json`.
- **Location**: `client/src/services/api.js` (delete endpoint)

```javascript
// client/src/components/Message.jsx snippet
const handleDelete = async (id) => {
  setMessages(prev => prev.filter(m => m.id !== id));
  await api.deleteMessage(id);
};
```

## 3. Link Integration & Grounding
The AI is strictly grounded in the provided context. Every fact is cited with a source index (e.g., `[1]`).
- **Source Links**: The metadata for each chunk includes the original URL.
- **UI**: Clicking a source badge opens the external URL in a new tab using `target="_blank"`.

## 4. Immersive 3D UI (`Scene3D`)
The background is not a static image but a live **Three.js** scene rendered via `@react-three/fiber`.
- **Dynamic Particles**: A field of floating nodes that react to mouse position.
- **Perspective**: Dragging the mouse across the background shifts the 3D perspective, creating depth.

---

### How to Demo Manually
1. **Ingest**: Click the "Ingest" button in the top right.
2. **Ask**: "Tell me about the latest semiconductor news."
3. **Verify**: Note the source links in the answer.
4. **Interact**: Use the Copy and Delete icons on the message bubble.
5. **Explore**: Drag your mouse across the background to see the 3D perspective shift.
