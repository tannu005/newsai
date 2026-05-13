import { Inngest } from "inngest";

// Create a client to send and receive events
// It will automatically use INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY from process.env
export const inngest = new Inngest({ 
  id: "news-ai-chatbot",
  // In development, the SDK will connect to the local dev server (default: http://localhost:8288)
  // if INNGEST_DEV=1 or no signing key is found.
});

console.log('📡 Inngest client initialized with ID: news-ai-chatbot');
