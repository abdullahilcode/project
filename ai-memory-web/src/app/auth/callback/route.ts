import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function resolveNextPath(next: string | null, origin: string) {
  if (next && next.startsWith("/")) {
    return new URL(next, origin);
  }
  return new URL("/", origin);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const supabase = getSupabaseServerClient();

  await supabase.auth.exchangeCodeForSession(request.url);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL("/?auth=failed", url.origin));
  }

  const next = resolveNextPath(url.searchParams.get("next"), url.origin);

  return NextResponse.redirect(next);
}
