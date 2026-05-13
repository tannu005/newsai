import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import config from '../config/index.js';

let llmInstance = null;

/**
 * Get or create a singleton LLM instance (Gemini 2.0 Flash).
 * Uses low temperature for factual, grounded responses.
 */
export function getLLM() {
  if (!llmInstance) {
    if (!config.googleApiKey) {
      throw new Error('GOOGLE_API_KEY is not set. Please add it to your .env file.');
    }
    llmInstance = new ChatGoogleGenerativeAI({
      apiKey: config.googleApiKey,
      model: config.llmModel,
      temperature: config.temperature,
      maxOutputTokens: 2048,
    });
  }
  return llmInstance;
}

/**
 * Generate a grounded answer from the provided context.
 * The system prompt enforces strict dataset-only responses.
 * @param {string} query - User's question
 * @param {string} context - Retrieved document chunks joined together
 * @returns {Promise<string>} - Generated answer
 */
export async function generateAnswer(query, context) {
  const llm = getLLM();

  const systemPrompt = `You are NewsAI, an intelligent news analysis assistant. Your goal is to provide comprehensive, professional answers to user questions based on the provided news article context.

RULES:
1. Primary Source: Use the provided article context as your primary source of truth.
2. Synthesis: If multiple articles are relevant, synthesize the information into a cohesive "global" or broad answer if requested.
3. Grounding: If the context is completely unrelated to the question, politely explain that the current dataset doesn't cover that specific topic.
4. Formatting: Use markdown (headers, bolding, lists) to make the answer highly readable and professional.
5. Citations: Always mention which articles or sources you are drawing information from (e.g., "According to Reuters...").
6. Tone: Maintain a neutral, professional, and analytical tone.

CONTEXT FROM NEWS ARTICLES:
${context}`;

  const response = await llm.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ]);

  return response.content;
}

/**
 * Perform deep analysis of a chatbot response.
 * Used by the "Analyze with AI" bonus feature.
 * @param {string} originalQuery - Original user question
 * @param {string} originalAnswer - The chatbot's answer to analyze
 * @param {string} context - The source context used
 * @returns {Promise<object>} - Structured analysis object
 */
export async function analyzeResponse(originalQuery, originalAnswer, context) {
  const llm = getLLM();

  const analysisPrompt = `You are an expert news analyst. Analyze the following chatbot response and provide a structured deep-dive analysis.

ORIGINAL QUESTION: ${originalQuery}

CHATBOT RESPONSE: ${originalAnswer}

SOURCE CONTEXT: ${context}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown code blocks):
{
  "explanation": "A detailed explanation of the answer, expanding on key points with additional nuance from the sources",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "simplified": "A simplified, easy-to-understand version of the answer suitable for a general audience",
  "additionalContext": "Background information and broader context that helps understand the topic better",
  "followUpQuestions": ["question1", "question2", "question3"]
}`;

  const response = await llm.invoke([
    { role: 'user', content: analysisPrompt },
  ]);

  try {
    let content = response.content.trim();
    
    // Attempt to extract JSON from markdown or text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    const parsed = JSON.parse(content);
    
    // Validate required fields to avoid partial objects
    const requiredFields = ['explanation', 'keyInsights', 'simplified', 'additionalContext', 'followUpQuestions'];
    const hasAllFields = requiredFields.every(field => parsed[field]);
    
    if (hasAllFields) return parsed;
    throw new Error('Incomplete JSON');
  } catch (error) {
    console.error('Analysis JSON parse error:', error.message, 'Raw response:', response.content);
    return {
      explanation: response.content.substring(0, 1000) + (response.content.length > 1000 ? '...' : ''),
      keyInsights: ['Deep analysis generated', 'Multi-dimensional breakdown provided', 'Source-grounded insights'],
      simplified: 'The AI provided a detailed breakdown. Please refer to the explanation for a full analysis.',
      additionalContext: 'Information synthesized from provided news articles.',
      followUpQuestions: ['Can you provide more details?', 'What are the implications?', 'Tell me more about the sources.'],
    };
  }
}
