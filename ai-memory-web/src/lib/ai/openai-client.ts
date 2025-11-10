import OpenAI from "openai";

import { serverEnv } from "@/lib/env";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (client) {
    return client;
  }
  if (!serverEnv.OPENAI_API_KEY) {
    return null;
  }
  client = new OpenAI({
    apiKey: serverEnv.OPENAI_API_KEY,
  });
  return client;
}
