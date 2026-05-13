import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import config from '../config/index.js';

let llmInstance = null;

/**
 * Get or create a singleton LLM instance (Gemini 2.5 Flash Lite).
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
      maxOutputTokens: 4096,
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
4. Formatting: Use markdown (headers, bolding, lists) to make the answer highly readable and professional. Use H2 or H3 headers for main sections.
5. Citations: Always mention which articles or sources you are drawing information from (e.g., "According to Reuters...").
6. URL Integrity: If you include links, ONLY use the exact URLs provided in the [Article] metadata below. DO NOT generate, shorten, or guess any URLs.
7. Tone: Maintain a neutral, authoritative, and analytical tone.

CONTEXT FROM NEWS ARTICLES:
${context}`;

  let response;
  const allModels = [config.llmModel, 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];
  // Deduplicate
  const modelsToTry = [...new Set(allModels)];

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const currentLlm = model === config.llmModel ? llm : new ChatGoogleGenerativeAI({
          apiKey: config.googleApiKey,
          model: model,
          temperature: config.temperature,
          maxOutputTokens: 4096,
        });
        console.info(`Trying model: ${model} (attempt ${attempt + 1})...`);
        response = await currentLlm.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ]);
        if (response) break;
      } catch (err) {
        console.warn(`Model ${model} attempt ${attempt + 1} failed: ${err.message}`);
        // If rate-limited (429), wait and retry the same model
        if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          const delay = (attempt + 1) * 5000;
          console.info(`Rate limited on ${model}, waiting ${delay}ms before retry...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        break; // Non-retryable error, try next model
      }
    }
    if (response) break;
  }

  if (response) {
    return response.content;
  }

  console.error('All generation models failed.');
  // Graceful degradation: If API fails, provide a simple summary from context
    if (context && context.length > 0) {
      const snippets = context.split('\n\n---\n\n').slice(0, 2);
      const summary = snippets.map(s => s.split('\n').slice(1).join(' ').substring(0, 300)).join('... ');
      return `⚠️ **Note: AI is currently in "High Traffic" mode.**\n\nI retrieved the following key information from our dataset:\n\n${summary}...\n\n*Please try again in a few minutes for a more detailed analysis.*`;
    }
    
    return "⚠️ I'm currently experiencing high demand. Please try again in a few moments.";
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
  const primaryLlm = getLLM();
  const allModels = [config.llmModel, 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];
  const modelsToTry = [...new Set(allModels)];
  
  const analysisPrompt = `You are an expert news analyst. Analyze the following chatbot response and provide a structured deep-dive analysis.

ORIGINAL QUESTION: ${originalQuery}

CHATBOT RESPONSE: ${originalAnswer}

SOURCE CONTEXT: ${context}

Provide your analysis in the following JSON format. Your goal is to provide an executive-level deep dive that adds strategic value.
- "explanation": A detailed, 3-4 paragraph technical and contextual breakdown. Cover economic, social, and future implications where relevant.
- "keyInsights": 5 strategic, punchy bullet points.
- "simplified": A clear, simple version of the answer using an analogy if appropriate.
- "additionalContext": Broader historical or industry background related to the topic.
- "followUpQuestions": 3 thought-provoking questions to deepen the conversation.

Respond ONLY with valid JSON. Do not include markdown code blocks.

{
  "explanation": "...",
  "keyInsights": ["...", "...", "...", "...", "..."],
  "simplified": "...",
  "additionalContext": "...",
  "followUpQuestions": ["...", "...", "..."]
}`;

  let response;
  let lastError;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const currentLlm = model === config.llmModel ? primaryLlm : new ChatGoogleGenerativeAI({
          apiKey: config.googleApiKey,
          model: model,
          temperature: config.temperature,
          maxOutputTokens: 4096,
        });
        console.info(`Analysis: trying model ${model} (attempt ${attempt + 1})...`);
        response = await currentLlm.invoke([{ role: 'user', content: analysisPrompt }]);
        if (response) break;
      } catch (err) {
        lastError = err;
        console.warn(`Analysis model ${model} attempt ${attempt + 1} failed: ${err.message}`);
        if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          const delay = (attempt + 1) * 5000;
          console.info(`Rate limited on ${model}, waiting ${delay}ms before retry...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        break;
      }
    }
    if (response) break;
  }

  if (!response) {
    console.error('All analysis models failed.');
    return {
      explanation: `Analysis failed. Last error: ${lastError?.message || 'Unknown error'}`,
      keyInsights: ['Check your API key and quota', 'Verify model availability', 'Try again later'],
      simplified: 'The AI was unable to perform the deep dive at this time.',
      additionalContext: 'This error typically occurs due to model unavailability or API limits.',
      followUpQuestions: ['Retry?', 'Try a different question?', 'Check system status?']
    };
  }

  try {
    let content = response.content.trim();
    console.log('--- RAW ANALYSIS RESPONSE ---\n', content, '\n---------------------------');
    
    // Try to extract the JSON object from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(content);
      
      // Validate and clean fields
      const cleaned = {
        explanation: typeof parsed.explanation === 'string' ? parsed.explanation : JSON.stringify(parsed.explanation),
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        simplified: typeof parsed.simplified === 'string' ? parsed.simplified : '',
        additionalContext: typeof parsed.additionalContext === 'string' ? parsed.additionalContext : '',
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : []
      };
      
      if (cleaned.explanation && cleaned.keyInsights.length > 0) return cleaned;
      throw new Error('Missing core fields');
    } catch (parseError) {
      console.warn('JSON Parse failed, attempting line-by-line fallback');
      // If full parse fails, try to extract whatever we can or return a formatted version of the content
      return {
        explanation: content.length > 100 ? content : "I've analyzed the response but encountered a formatting issue. Here is the summary: " + content,
        keyInsights: ['Strategic analysis generated', 'Multi-dimensional breakdown provided', 'Source-grounded insights'],
        simplified: 'The AI provided a detailed breakdown. Please refer to the explanation for a full analysis.',
        additionalContext: 'Information synthesized from provided news articles.',
        followUpQuestions: ['Can you provide more details?', 'What are the implications?', 'Tell me more about the sources.'],
      };
    }
  } catch (error) {
    console.error('Analysis pipeline error:', error);
    return {
      explanation: "I encountered an error while analyzing this response. Please try again or ask a more specific question.",
      keyInsights: ["Error during analysis"],
      simplified: "Analysis unavailable.",
      additionalContext: "",
      followUpQuestions: ["Retry the analysis?"]
    };
  }
}
