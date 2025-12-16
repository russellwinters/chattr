import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { VALID_LANGUAGE_CODES, TargetLanguageCode } from "@/utils/languages";

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

type Data = {
  result: deepl.TextResult | deepl.TextResult[];
};

type ErrorResponse = {
  message: string;
};

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  const data = await req.body;

  if (!data.text) {
    res.status(400).json({ message: "Please send text to translate" });
    return;
  }

  // Get targetLanguage from request, default to 'es'
  const requestedLanguage = data.targetLanguage || "es";

  // Validate targetLanguage
  if (!VALID_LANGUAGE_CODES.has(requestedLanguage)) {
    res.status(400).json({
      message: `Invalid target language: ${requestedLanguage}. Please provide a valid language code.`
    });
    return;
  }

  // Safe to cast after validation
  const targetLanguage = requestedLanguage as TargetLanguageCode;

  const result = await getTranslator().translateText(data.text, null, targetLanguage);

  res.status(200).json({ result });
}
