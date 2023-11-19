import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
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

  const result = await translator.translateText(data.text, null, "es");

  res.status(200).json({ result });
}
