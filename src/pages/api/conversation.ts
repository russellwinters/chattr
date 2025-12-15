import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { VALID_LANGUAGE_CODES, TargetLanguageCode } from "@/utils/languages";
import {
  generateConversationResponse,
  ConversationMessage,
  isOpenAIConfigured,
} from "@/lib/openai";
import { PRESET_CHARACTERS } from "@/utils/characters";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY || "");

type ConversationRequestBody = {
  userMessage: string;
  targetLanguage: string;
  conversationHistory?: ConversationMessage[];
  characterId?: string;
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

  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, falling back to translation-only mode");
    return handleTranslationFallback(data.userMessage, targetLanguage, res);
  }


  const characterSystemPrompt = getCharacterPrompt(data.characterId);

  const conversationResponse = await generateConversationResponse(
    data.userMessage,
    conversationHistory,
    characterSystemPrompt
  ).catch((error) => {
    console.error("OpenAI API error, falling back to translation:", error);
    return null;
  });

  if (!conversationResponse) {
    return handleTranslationFallback(data.userMessage, targetLanguage, res);
  }

  const translationResult = await batchTranslate(
    data.userMessage,
    conversationResponse,
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


function validateRequest(data: ConversationRequestBody): string | null {
  if (!data.userMessage) return "userMessage is required";
  if (!data.targetLanguage) return "targetLanguage is required";
  if (!VALID_LANGUAGE_CODES.has(data.targetLanguage)) {
    return `Invalid target language: ${data.targetLanguage}. Please provide a valid language code.`;
  }
  return null;
}

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

  const parsedTranslation = parseTranslation(translationResult.text);
  const unexpectedParseResponse = parsedTranslation.length !== 2;

  if (unexpectedParseResponse) {
    return translateSeparately(userMessage, assistantResponse, targetLanguage);
  }

  const [userMessageTranslation, assistantResponseTranslation] = parsedTranslation;

  return {
    userMessageTranslation: userMessageTranslation.trim(),
    assistantResponse: assistantResponseTranslation.trim(),
    assistantResponseTranslation: assistantResponse.trim(),
  };
}

function parseTranslation(translatedText: string): string[] {
  return translatedText.split("\n|||DEEPL_DELIMITER|||\n");
}

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

function getCharacterPrompt(characterId?: string): string | undefined {
  if (!characterId) return undefined;
  const character = PRESET_CHARACTERS.find((c) => c.id === characterId);
  return character?.systemPrompt
}