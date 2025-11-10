import { getOpenAIClient } from "@/lib/ai/openai-client";
import { serverEnv } from "@/lib/env";

type ResponseContent = {
  content?: Array<{ text?: string }>;
};

interface SummarizeInput {
  title: string;
  content: string;
  kind: string;
}

interface SummarizeOutput {
  summary: string;
  tags: string[];
}

const FALLBACK_TAGS = ["ideas", "reflection", "productivity", "strategy", "learning"];

export async function summarizeMemory({
  title,
  content,
  kind,
}: SummarizeInput): Promise<SummarizeOutput> {
  const openai = getOpenAIClient();

  if (openai) {
    try {
      const response = await openai.responses.create({
        model: serverEnv.OPENAI_SUMMARY_MODEL,
        input: [
          {
            role: "system",
            content:
              "You are an AI memory curator. Summarize the memory in 2 sentences and propose 5 short tags.",
          },
          {
            role: "user",
            content: `Title: ${title}\nType: ${kind}\nContent:\n${content}`,
          },
        ],
        max_output_tokens: 200,
      });
      const outputs = response.output as ResponseContent[] | undefined;
      const text =
        response.output_text ?? outputs?.[0]?.content?.[0]?.text ?? "";
      const [firstLine, secondLine] = text.split("\n").filter(Boolean);
      const summary = firstLine?.trim() ?? text.trim();
        const tagsLine = secondLine?.includes("#")
          ? secondLine
          : outputs?.[0]?.content?.[1]?.text ?? "";
        const tags = tagsLine
          ? Array.from(
              new Set<string>(
                tagsLine
                  .toLowerCase()
                  .replace(/[^#\w,\s]/g, "")
                  .split(/[#,\s]+/)
                  .filter((token: string) => token.length > 0)
                  .slice(0, 5),
              ),
            ).map((tag) => tag.trim())
          : FALLBACK_TAGS.slice(0, 3);
      return {
        summary,
        tags,
      };
    } catch (error) {
      console.error("OpenAI summarization failed", error);
    }
  }

  const fallbackSummary = content
    .split(".")
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(". ");

  const fallbackTags = Array.from(
    new Set(
      content
        .toLowerCase()
        .match(/\b[a-z]{4,}\b/g)
        ?.slice(0, 5) ?? FALLBACK_TAGS.slice(0, 3),
    ),
  );

  return {
    summary: fallbackSummary || title,
    tags: fallbackTags,
  };
}
