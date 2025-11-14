import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";

// This is using Replit's AI Integrations service, which provides OpenRouter-compatible API access without requiring your own OpenRouter API key.
const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY
});

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

// Process a single prompt with retry logic
export async function generateWithRetry(
  prompt: string,
  model: string = "meta-llama/llama-3.3-70b-instruct"
): Promise<string> {
  return await pRetry(
    async () => {
      try {
        const response = await openrouter.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 8192,
          temperature: 0.8,
        });
        return response.choices[0]?.message?.content || "";
      } catch (error: any) {
        if (isRateLimitError(error)) {
          throw error; // Rethrow to trigger p-retry
        }
        throw new pRetry.AbortError(error);
      }
    },
    {
      retries: 7,
      minTimeout: 2000,
      maxTimeout: 128000,
      factor: 2,
    }
  );
}

// Process multiple prompts concurrently with rate limiting
export async function batchProcessPrompts(
  prompts: string[],
  model: string = "meta-llama/llama-3.3-70b-instruct"
): Promise<string[]> {
  const limit = pLimit(2);
  
  const processingPromises = prompts.map((prompt) =>
    limit(() => generateWithRetry(prompt, model))
  );
  
  return await Promise.all(processingPromises);
}
