import { getOpenAIClient } from "@/lib/ai/openai-client";
import { getMemoryRepository } from "@/lib/repository/memory-repository";
import { serverEnv } from "@/lib/env";

type ResponseContent = {
  content?: Array<{ text?: string }>;
};

export async function chatWithMemories(message: string, userId: string) {
  const repository = getMemoryRepository();
  const searchResults = await repository.searchMemories(userId, message, 4);
  const openai = getOpenAIClient();

  const context = searchResults
    .map(
      ({ memory, score }) =>
        `Title: ${memory.title}\nScore: ${score.toFixed(2)}\nSummary: ${memory.summary}\nContent: ${memory.content}\nTags: ${memory.tags.join(", ")}\n`,
    )
    .join("\n---\n");

  if (openai) {
    try {
      const response = await openai.responses.create({
        model: serverEnv.OPENAI_CHAT_MODEL,
        input: [
          {
            role: "system",
            content:
              "You are an AI memory companion. Use the provided memories to answer the user accurately. Always cite the titles of memories you reference.",
          },
          {
            role: "user",
            content: `Memories:\n${context}\n\nQuestion: ${message}`,
          },
        ],
        max_output_tokens: 400,
      });
      const outputs = response.output as ResponseContent[] | undefined;
      const text =
        response.output_text ??
        outputs?.[0]?.content?.[0]?.text ??
        "I'm processing your memories.";
      return {
        content: text.trim(),
        memoryReferences: searchResults.map(({ memory }) => memory.id),
      };
    } catch (error) {
      console.error("OpenAI chat failed", error);
    }
  }

  const fallback = searchResults
    .map(({ memory }) => `• ${memory.title}: ${memory.summary}`)
    .join("\n");

  return {
    content:
      fallback ||
      "I couldn't find related memories yet, but new uploads will appear here.",
    memoryReferences: searchResults.map(({ memory }) => memory.id),
  };
}
