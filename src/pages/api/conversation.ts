import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { VALID_LANGUAGE_CODES, TargetLanguageCode } from "@/utils/languages";
import {
  generateConversationResponse,
  ConversationMessage,
  isOpenAIConfigured,
} from "@/lib/openai";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY || "");

type ConversationRequestBody = {
  userMessage: string;
  targetLanguage: string;
  conversationHistory?: ConversationMessage[];
};

type ConversationSuccessResponse = {
  userMessageTranslation: string;
  assistantResponse: string;
  assistantResponseTranslation: string;
};

type ErrorResponse = {
  message: string;
  fallback?: boolean;
};

/**
 * Conversation API endpoint
 * 
 * Implements a 2-step flow:
 * 1. Generate AI response in user's original language
 * 2. Batch translate both user message and AI response to target language
 * 
 * Falls back to translation-only mode if OpenAI is unavailable
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversationSuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const data = req.body as ConversationRequestBody;
  const validationError = validateRequest(data);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  const targetLanguage = data.targetLanguage as TargetLanguageCode;
  const conversationHistory = data.conversationHistory || [];

  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, falling back to translation-only mode");
    return handleTranslationFallback(data.userMessage, targetLanguage, res);
  }

  // Step 1: Generate AI response
  const assistantResponse = await generateConversationResponse(
    data.userMessage,
    conversationHistory
  ).catch((error) => {
    console.error("OpenAI API error, falling back to translation:", error);
    return null;
  });

  if (!assistantResponse) {
    return handleTranslationFallback(data.userMessage, targetLanguage, res);
  }

  // Step 2: Batch translate both messages to target language
  const translationResult = await batchTranslate(
    data.userMessage,
    assistantResponse,
    targetLanguage
  ).catch((error) => {
    console.error("Translation error:", error);
    return null;
  });

  if (!translationResult) {
    res.status(500).json({ message: "Translation failed. Please try again." });
    return;
  }

  res.status(200).json(translationResult);
}

/**
 * Validates the request body
 */
function validateRequest(data: ConversationRequestBody): string | null {
  if (!data.userMessage) return "userMessage is required";
  if (!data.targetLanguage) return "targetLanguage is required";
  if (!VALID_LANGUAGE_CODES.has(data.targetLanguage)) {
    return `Invalid target language: ${data.targetLanguage}. Please provide a valid language code.`;
  }
  return null;
}

/**
 * Batch translates user message and assistant response using a delimiter strategy
 * Falls back to separate translations if delimiter is modified
 */
async function batchTranslate(
  userMessage: string,
  assistantResponse: string,
  targetLanguage: TargetLanguageCode
): Promise<ConversationSuccessResponse> {
  const combinedText = `${userMessage}\n|||DEEPL_DELIMITER|||\n${assistantResponse}`;
  const translationResult = await translator.translateText(
    combinedText,
    null,
    targetLanguage
  );

  const translatedParts = translationResult.text.split("\n|||DEEPL_DELIMITER|||\n");

  // Handle edge case where delimiter might be translated
  if (translatedParts.length !== 2) {
    return translateSeparately(userMessage, assistantResponse, targetLanguage);
  }

  const [userMessageTranslation, assistantResponseTranslation] = translatedParts;

  return {
    userMessageTranslation: userMessageTranslation.trim(),
    assistantResponse: assistantResponseTranslation.trim(),
    assistantResponseTranslation: assistantResponse.trim(),
  };
}

/**
 * Translates user message and assistant response separately
 */
async function translateSeparately(
  userMessage: string,
  assistantResponse: string,
  targetLanguage: TargetLanguageCode
): Promise<ConversationSuccessResponse> {
  const [userTranslation, assistantTranslation] = await Promise.all([
    translator.translateText(userMessage, null, targetLanguage),
    translator.translateText(assistantResponse, null, targetLanguage),
  ]);

  return {
    userMessageTranslation: userTranslation.text.trim(),
    assistantResponse: assistantTranslation.text.trim(),
    assistantResponseTranslation: assistantResponse.trim(),
  };
}

/**
 * Fallback handler when OpenAI is unavailable
 * Returns a simple translation of the user's message
 */
async function handleTranslationFallback(
  userMessage: string,
  targetLanguage: TargetLanguageCode,
  res: NextApiResponse<ConversationSuccessResponse | ErrorResponse>
) {
  const result = await translator.translateText(
    userMessage,
    null,
    targetLanguage
  ).catch((error) => {
    console.error("Translation fallback error:", error);
    return null;
  });

  if (!result) {
    res.status(500).json({
      message: "Translation failed. Please try again.",
      fallback: true,
    });
    return;
  }

  res.status(200).json({
    userMessageTranslation: result.text,
    assistantResponse: result.text,
    assistantResponseTranslation:
      "I'm unable to generate a conversation response right now. Here's the translation of your message.",
    fallback: true,
  } as ConversationSuccessResponse & { fallback: boolean });
}
