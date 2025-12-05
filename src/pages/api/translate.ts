import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { VALID_LANGUAGE_CODES, TargetLanguageCode } from "@/utils/languages";

const authKey = process.env.DEEPL_API_KEY; // Replace with your key
const translator = new deepl.Translator(authKey || "");

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

  const result = await translator.translateText(data.text, null, targetLanguage);

  res.status(200).json({ result });
}
