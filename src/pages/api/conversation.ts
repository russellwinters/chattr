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

  // Validate required fields
  if (!data.userMessage) {
    res.status(400).json({ message: "userMessage is required" });
    return;
  }

  if (!data.targetLanguage) {
    res.status(400).json({ message: "targetLanguage is required" });
    return;
  }

  // Validate target language
  if (!VALID_LANGUAGE_CODES.has(data.targetLanguage)) {
    res.status(400).json({
      message: `Invalid target language: ${data.targetLanguage}. Please provide a valid language code.`,
    });
    return;
  }

  const targetLanguage = data.targetLanguage as TargetLanguageCode;
  const conversationHistory = data.conversationHistory || [];

  try {
    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      // Fallback: Translation-only mode
      console.warn(
        "OpenAI not configured, falling back to translation-only mode"
      );
      return handleTranslationFallback(
        data.userMessage,
        targetLanguage,
        res
      );
    }

    // Step 1: Generate AI response in original language
    let assistantResponseOriginal: string;
    try {
      assistantResponseOriginal = await generateConversationResponse(
        data.userMessage,
        conversationHistory
      );
    } catch (error) {
      // If OpenAI fails, fallback to translation-only
      console.error("OpenAI API error, falling back to translation:", error);
      return handleTranslationFallback(
        data.userMessage,
        targetLanguage,
        res
      );
    }

    // Step 2: Batch translate both messages to target language
    // Using a delimiter that's unlikely to appear in natural text
    const combinedText = `${data.userMessage}\n|||DEEPL_DELIMITER|||\n${assistantResponseOriginal}`;

    try {
      const translationResult = await translator.translateText(
        combinedText,
        null,
        targetLanguage
      );

      const translatedParts = translationResult.text.split(
        "\n|||DEEPL_DELIMITER|||\n"
      );

      // Handle edge case where delimiter might be translated
      if (translatedParts.length !== 2) {
        // Fallback: translate separately
        const userTranslation = await translator.translateText(
          data.userMessage,
          null,
          targetLanguage
        );
        const assistantTranslation = await translator.translateText(
          assistantResponseOriginal,
          null,
          targetLanguage
        );

        res.status(200).json({
          userMessageTranslation: userTranslation.text.trim(),
          assistantResponse: assistantTranslation.text.trim(),
          assistantResponseTranslation: assistantResponseOriginal.trim(),
        });
        return;
      }

      const [userMessageTranslation, assistantResponse] = translatedParts;

      res.status(200).json({
        userMessageTranslation: userMessageTranslation.trim(),
        assistantResponse: assistantResponse.trim(),
        assistantResponseTranslation: assistantResponseOriginal.trim(),
      });
    } catch (error) {
      console.error("DeepL translation error:", error);
      res.status(500).json({
        message: "Translation failed. Please try again.",
      });
    }
  } catch (error) {
    console.error("Conversation API error:", error);
    res.status(500).json({
      message: "Failed to process conversation. Please try again.",
    });
  }
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
  try {
    const result = await translator.translateText(
      userMessage,
      null,
      targetLanguage
    );

    // Return translation with a generic assistant response
    res.status(200).json({
      userMessageTranslation: result.text,
      assistantResponse: result.text,
      assistantResponseTranslation:
        "I'm unable to generate a conversation response right now. Here's the translation of your message.",
      fallback: true,
    } as ConversationSuccessResponse & { fallback: boolean });
  } catch (error) {
    console.error("Translation fallback error:", error);
    res.status(500).json({
      message: "Translation failed. Please try again.",
      fallback: true,
    });
  }
}
