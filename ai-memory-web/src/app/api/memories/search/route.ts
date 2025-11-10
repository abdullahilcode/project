import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/lib/auth/supabase-server";
import {
  DEFAULT_DEMO_USER_ID,
  getMemoryRepository,
} from "@/lib/repository/memory-repository";

const searchSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(20).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = searchSchema.parse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
    });

    const { session } = await getServerSession();
    const userId = session?.user?.id ?? DEFAULT_DEMO_USER_ID;

    const repository = getMemoryRepository();
    const results = await repository.searchMemories(
      userId,
      parsed.q ?? "",
      parsed.limit,
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
