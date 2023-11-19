import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
const authKey = process.env.DEEPL_API_KEY; // Replace with your key
const translator = new deepl.Translator(authKey || "");

type Data = {
  result: deepl.TextResult;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const result = await translator.translateText("Hello, world!", null, "es");

  res.status(200).json({ result });
}
