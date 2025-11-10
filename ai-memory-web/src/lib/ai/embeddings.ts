import { createHash } from "node:crypto";

import { getOpenAIClient } from "@/lib/ai/openai-client";
import { serverEnv } from "@/lib/env";

export async function embedText(input: string): Promise<number[]> {
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const response = await openai.embeddings.create({
        model: serverEnv.OPENAI_EMBEDDING_MODEL,
        input,
      });
      return response.data[0]?.embedding ?? [];
    } catch (error) {
      console.error("OpenAI embedding failed", error);
    }
  }

  // deterministic fallback vector using hashing
  const hash = createHash("sha256").update(input).digest();
  const vector = [];
  for (let index = 0; index < hash.length; index += 2) {
    const value = (hash[index] << 8) + hash[index + 1];
    vector.push((value % 2000) / 2000);
  }
  return vector.slice(0, 128);
}
