import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { chatWithMemories } from "@/lib/ai/chat";

const chatSchema = z.object({
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { message } = chatSchema.parse(payload);
    const result = await chatWithMemories(message);
    return NextResponse.json({
      id: randomUUID(),
      ...result,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to chat with memories" },
      { status: 500 },
    );
  }
}
