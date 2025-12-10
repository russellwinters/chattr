import OpenAI from "openai";

/**
 * OpenAI client configuration for conversation mode
 * 
 * This client is used to generate conversational AI responses
 * in the user's original language, which are then translated
 * to the target language via the DeepL API.
 */

// Initialize OpenAI client with API key from environment
// If no key is provided, the client will still be created but API calls will fail
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Default model for conversation mode
 * GPT-3.5-turbo provides good quality at reasonable cost (~$0.002 per request)
 */
export const CONVERSATION_MODEL = "gpt-3.5-turbo";

/**
 * Maximum tokens for AI responses
 * Limits response length to keep costs reasonable and responses concise
 */
export const MAX_RESPONSE_TOKENS = 150;

/**
 * Maximum number of conversation messages to include as context
 * Keeps token usage manageable and focuses on recent conversation
 */
export const MAX_CONVERSATION_HISTORY = 10;

/**
 * System prompt for conversation mode
 * 
 * Instructs the AI to act as a language learning assistant
 * that provides natural, contextual responses in the user's language.
 * 
 * Key behaviors:
 * - Respond naturally and conversationally
 * - Keep responses concise (1-2 sentences)
 * - Be encouraging and supportive for language learners
 * - Stay on topic and contextual
 */
export const SYSTEM_PROMPT = `You are a friendly language learning assistant. Your role is to have natural conversations with users who are practicing a new language.

Guidelines:
- Respond naturally in the user's language (the language they write in)
- Keep your responses concise and conversational (1-2 sentences)
- Be encouraging and supportive
- Stay contextual to the conversation
- Use appropriate vocabulary for language learners
- Avoid overly complex grammar or idioms unless the user demonstrates advanced proficiency`;

/**
 * Generate a conversational AI response
 * 
 * @param userMessage - The user's message in their original language
 * @param conversationHistory - Array of previous messages for context (max 10)
 * @returns The AI's response in the same language as the user's message
 * 
 * @throws Error if OpenAI API key is not configured
 * @throws Error if API request fails
 * 
 * @example
 * ```typescript
 * const response = await generateConversationResponse(
 *   "Hello, how are you?",
 *   []
 * );
 * console.log(response); // "I'm doing great, thank you! How about you?"
 * ```
 */
export async function generateConversationResponse(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment."
    );
  }

  try {
    // Prepare messages array with system prompt and conversation history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      // Include up to MAX_CONVERSATION_HISTORY recent messages for context
      ...conversationHistory.slice(-MAX_CONVERSATION_HISTORY),
      { role: "user", content: userMessage },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: CONVERSATION_MODEL,
      messages,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.7, // Balanced between creativity and consistency
    });

    // Extract and return the AI's response
    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("OpenAI returned an empty response");
    }

    return response.trim();
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error("Unknown error occurred while calling OpenAI API");
  }
}

/**
 * Check if OpenAI is properly configured
 * 
 * @returns true if API key is set, false otherwise
 */
export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export default openai;
