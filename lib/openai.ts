import OpenAI from "openai";

let openai: OpenAI | null = null;

// create the openai client on first use so builds don't need the api key
export function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return openai;
}
