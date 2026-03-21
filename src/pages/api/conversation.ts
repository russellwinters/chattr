import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { VALID_LANGUAGE_CODES, TargetLanguageCode } from "@/utils/languages";
import {
  generateConversationResponse,
  ConversationMessage,
  isOpenAIConfigured,
} from "@/lib/openai";
import { PRESET_CHARACTERS } from "@/utils/characters";

// Lazy initialization to ensure env vars are available at runtime (required for Amplify SSR)
let translator: deepl.Translator | null = null;

function getTranslator(): deepl.Translator {
  if (!translator) {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPL_API_KEY environment variable is not set");
    }
    translator = new deepl.Translator(apiKey);
  }
  return translator;
}

type ConversationRequestBody = {
  userMessage: string;
  targetLanguage: string;
  nativeLanguage?: string;
  conversationHistory?: ConversationMessage[];
  characterId?: string;
};

type ConversationSuccessResponse = {
  userMessageTranslation: string;
  assistantResponse: string;
  assistantResponseTranslation: string;
  detectedInputLanguage?: string;
  isSameLanguage?: boolean;
};

const DEEPL_SOURCE_CODE_TO_NAME: Record<string, string> = {
  BG: "Bulgarian", CS: "Czech", DA: "Danish", DE: "German", EL: "Greek",
  EN: "English", ES: "Spanish", ET: "Estonian", FI: "Finnish", FR: "French",
  HU: "Hungarian", ID: "Indonesian", IT: "Italian", JA: "Japanese", KO: "Korean",
  LT: "Lithuanian", LV: "Latvian", NB: "Norwegian", NL: "Dutch", PL: "Polish",
  PT: "Portuguese", RO: "Romanian", RU: "Russian", SK: "Slovak", SL: "Slovenian",
  SV: "Swedish", TR: "Turkish", UK: "Ukrainian", ZH: "Chinese",
};

type ErrorResponse = {
  message: string;
  fallback?: boolean;
};

/**
 * Conversation API endpoint
 *
 * Implements a sequential flow:
 * 1. Translate user message → detect source language via DeepL
 * 2. Generate AI response with detected language injected into system prompt
 * 3. Translate AI response to target language
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
  const nativeLanguage = (data.nativeLanguage as TargetLanguageCode | undefined) ?? "en-US";
  const conversationHistory = data.conversationHistory || [];

  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, falling back to translation-only mode");
    return handleTranslationFallback(data.userMessage, targetLanguage, res);
  }


  const characterSystemPrompt = getCharacterPrompt(data.characterId);

  const userTranslationResult = await getTranslator().translateText(
    data.userMessage,
    null,
    targetLanguage
  ).catch((error) => {
    console.error("User message translation error:", error);
    return null;
  });

  if (!userTranslationResult) {
    res.status(500).json({ message: "Translation failed. Please try again." });
    return;
  }

  const detectedCode = userTranslationResult.detectedSourceLang?.toUpperCase();
  const detectedLanguage = detectedCode ? DEEPL_SOURCE_CODE_TO_NAME[detectedCode] ?? null : null;
  const isSameLanguage = detectedCode
    ? targetLanguage.toLowerCase().startsWith(detectedCode.toLowerCase())
    : false;

  const assistantResponse = await generateConversationResponse(
    data.userMessage,
    conversationHistory,
    characterSystemPrompt,
    detectedLanguage
  ).catch((error) => {
    console.error("OpenAI API error, falling back to translation:", error);
    return null;
  });

  if (!assistantResponse) {
    return handleTranslationFallback(data.userMessage, targetLanguage, res);
  }

  // When the user wrote in the target language, translate both the user message and AI
  // response back to their native language. Otherwise, translate the AI response to the
  // target language (the user message translation from step 1 is already in target language).
  const translationTarget = isSameLanguage ? nativeLanguage : targetLanguage;

  const [userMsgNativeResult, aiTranslationResult] = await Promise.all([
    isSameLanguage
      ? getTranslator().translateText(data.userMessage, null, nativeLanguage).catch((error) => {
          console.error("User message native translation error:", error);
          return null;
        })
      : Promise.resolve(userTranslationResult),
    getTranslator().translateText(assistantResponse, null, translationTarget).catch((error) => {
      console.error("AI response translation error:", error);
      return null;
    }),
  ]);

  if (!userMsgNativeResult || !aiTranslationResult) {
    res.status(500).json({ message: "Translation failed. Please try again." });
    return;
  }

  res.status(200).json({
    userMessageTranslation: userMsgNativeResult.text.trim(),
    assistantResponse: assistantResponse.trim(),
    assistantResponseTranslation: aiTranslationResult.text.trim(),
    detectedInputLanguage: detectedLanguage ?? undefined,
    isSameLanguage,
  });
}


function validateRequest(data: ConversationRequestBody): string | null {
  if (!data.userMessage) return "userMessage is required";
  if (!data.targetLanguage) return "targetLanguage is required";
  if (!VALID_LANGUAGE_CODES.has(data.targetLanguage)) {
    return `Invalid target language: ${data.targetLanguage}. Please provide a valid language code.`;
  }
  return null;
}


async function handleTranslationFallback(
  userMessage: string,
  targetLanguage: TargetLanguageCode,
  res: NextApiResponse<ConversationSuccessResponse | ErrorResponse>
) {
  const result = await getTranslator().translateText(
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
    assistantResponse:
      "I'm unable to generate a conversation response right now. Here's the translation of your message.",
    assistantResponseTranslation: result.text,
    isSameLanguage: true,
  });
}

function getCharacterPrompt(characterId?: string): string | undefined {
  if (!characterId) return undefined;
  const character = PRESET_CHARACTERS.find((c) => c.id === characterId);
  return character?.systemPrompt
}