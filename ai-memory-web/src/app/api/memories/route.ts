import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { embedText } from "@/lib/ai/embeddings";
import { summarizeMemory } from "@/lib/ai/summarize";
import { getServerSession } from "@/lib/auth/supabase-server";
import {
  DEFAULT_DEMO_USER_ID,
  getMemoryRepository,
} from "@/lib/repository/memory-repository";
import type { MemoryKind } from "@/lib/types";

const createMemorySchema = z.object({
  title: z.string().min(2),
  kind: z.enum(["text", "voice", "image", "link", "document"]),
  content: z.string().min(6),
  tags: z.string().optional(),
  importance: z.number().min(0).max(1).default(0.5),
});

export async function GET() {
  const { session } = await getServerSession();
  const userId = session?.user?.id ?? DEFAULT_DEMO_USER_ID;

  const repository = getMemoryRepository();
  const [memories, edges] = await Promise.all([
    repository.listMemories(userId),
    repository.listEdges(userId),
  ]);
  return NextResponse.json({ memories, edges });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createMemorySchema.parse(payload);
    const { summary, tags: aiTags } = await summarizeMemory({
      title: parsed.title,
      content: parsed.content,
      kind: parsed.kind,
    });

    const tagList = Array.from(
      new Set([
        ...(parsed.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) ?? []),
        ...aiTags,
      ]),
    ).slice(0, 8);

    await embedText(`${parsed.title}\n${parsed.content}`);

    const { session } = await getServerSession();
    const userId = session?.user?.id ?? DEFAULT_DEMO_USER_ID;

    const repository = getMemoryRepository();
    const created = await repository.createMemory(userId, {
      title: parsed.title,
      kind: parsed.kind as MemoryKind,
      source: "upload",
      summary,
      content: parsed.content,
      transcript: undefined,
      tags: tagList,
      sentiments: [
        {
          label: "curious",
          score: 0.52,
        },
      ],
      importance: parsed.importance,
      embeddingStatus: "ready",
      vectorId: randomUUID(),
      linkPreviews: undefined,
      media: undefined,
      encryption: {
        encrypted: true,
        scheme: "aes-256-gcm",
        keyVersion: "demo",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to create memory" },
      { status: 500 },
    );
  }
}
