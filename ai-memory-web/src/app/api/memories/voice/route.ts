import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { summarizeMemory } from "@/lib/ai/summarize";
import { getServerSession } from "@/lib/auth/supabase-server";
import {
  DEFAULT_DEMO_USER_ID,
  getMemoryRepository,
} from "@/lib/repository/memory-repository";

const voiceSchema = z.object({
  transcript: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const transcript = formData.get("transcript")?.toString() ?? "";

    const parsed = voiceSchema.parse({ transcript });

    const title = "Voice reflection";
    const description =
      parsed.transcript ||
      "Voice note captured without transcript. Add context to enrich the memory.";

    const { summary, tags } = await summarizeMemory({
      title,
      content: description,
      kind: "voice",
    });

    const { session } = await getServerSession();
    const userId = session?.user?.id ?? DEFAULT_DEMO_USER_ID;

    const repository = getMemoryRepository();
    const created = await repository.createMemory(userId, {
      title,
      kind: "voice",
      source: "recording",
      summary,
      content: description,
      transcript: parsed.transcript,
      tags,
      sentiments: [
        { label: "reflective", score: 0.64 },
        { label: "focused", score: 0.51 },
      ],
      importance: 0.6,
      embeddingStatus: "pending",
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
      { error: "Unable to process voice memory" },
      { status: 500 },
    );
  }
}
