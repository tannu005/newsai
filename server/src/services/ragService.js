import { similaritySearch, isStorePopulated } from './vectorStoreService.js';
import { generateAnswer, analyzeResponse } from './llmService.js';

/**
 * Core RAG pipeline: embed query → retrieve context → generate grounded answer.
 * @param {string} query - User's question
 * @returns {Promise<{answer: string, sources: Array, context: string}>}
 */
export async function runRAGPipeline(query) {
  // Check if vector store is populated
  const populated = await isStorePopulated();
  if (!populated) {
    return {
      answer: '⚠️ The news dataset has not been ingested yet. Please click the **"Ingest Data"** button in the header to load the dataset first.',
      sources: [],
      context: '',
    };
  }

  // Step 1: Retrieve relevant chunks
  const results = await similaritySearch(query);

  if (results.length === 0) {
    return {
      answer: "I couldn't find any relevant articles in the dataset for your question. Try rephrasing or asking about a different topic.",
      sources: [],
      context: '',
    };
  }

  // Step 2: Build context from retrieved documents
  const context = results
    .map(
      (r, i) =>
        `[Article ${i + 1}: "${r.document.metadata.title}" — ${r.document.metadata.source}]\n${r.document.pageContent}`
    )
    .join('\n\n---\n\n');

  // Step 3: Generate grounded answer
  const answer = await generateAnswer(query, context);

  // Step 4: Extract unique sources with relevance scores
  const sourceMap = new Map();
  for (const r of results) {
    const key = r.document.metadata.articleId;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, {
        title: r.document.metadata.title,
        category: r.document.metadata.category,
        source: r.document.metadata.source,
        url: r.document.metadata.url,
        publishedAt: r.document.metadata.publishedAt,
        relevanceScore: Math.round((1 - r.score) * 100) / 100, // Convert distance to similarity
        snippet: r.document.pageContent.substring(0, 200) + '...',
      });
    }
  }

  const sources = Array.from(sourceMap.values()).sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  return { answer, sources, context };
}

/**
 * Deep analysis of a previous chatbot response.
 * Used by the "Analyze with AI" bonus feature.
 * @param {string} query - Original user question
 * @param {string} answer - The chatbot's response to analyze
 * @param {string} context - The source context used
 * @returns {Promise<object>} - Structured analysis
 */
export async function runAnalysisPipeline(query, answer, context) {
  return analyzeResponse(query, answer, context);
}
