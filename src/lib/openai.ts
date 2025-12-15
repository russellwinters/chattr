import OpenAI from "openai";

/**
 * OpenAI client configuration for conversation mode
 * 
 * This client is used to generate conversational AI responses
 * in the user's original language, which are then translated
 * to the target language via the DeepL API.
 */


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Model selection: https://platform.openai.com/docs/models
// Pricing: https://openai.com/api/pricing/
export const CONVERSATION_MODEL = "gpt-3.5-turbo";

// Token limits: https://platform.openai.com/docs/guides/rate-limits
export const MAX_RESPONSE_TOKENS = 150;

// Context window management: https://platform.openai.com/docs/guides/chat-completions
export const MAX_CONVERSATION_HISTORY = 10;

// Temperature range (0-2): https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature
// Lower values (0.0-0.5) = more focused and deterministic
// Higher values (1.0-2.0) = more random and creative
export const TEMPERATURE = 0.7;

export const SYSTEM_PROMPT = `You are a friendly conversation assistant. Your role is to have natural conversations with users who are practicing a new language.

Guidelines:
- Respond in English
- Keep your responses concise and conversational (1-2 sentences)
- Be encouraging and supportive
- Stay contextual to the conversation
- Use appropriate vocabulary for language learners
- Avoid overly complex grammar or idioms unless the user demonstrates advanced proficiency`;

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Generate a conversational AI response
 * 
 * @param userMessage - The user's message in their original language
 * @param conversationHistory - Array of previous messages for context (max 10)
 * @param characterSystemPrompt - Optional character-specific system prompt to use instead of default
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
  conversationHistory: ConversationMessage[] = [],
  characterPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment."
    );
  }

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: characterPrompt },
      ...conversationHistory.slice(-MAX_CONVERSATION_HISTORY),
      { role: "user", content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: CONVERSATION_MODEL,
      messages,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: TEMPERATURE,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("OpenAI returned an empty response");
    }

    return response.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(` APOpenAII error: ${error.message}`);
    }
    throw new Error("Unknown error occurred while calling OpenAI API");
  }
}


export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export default openai;
