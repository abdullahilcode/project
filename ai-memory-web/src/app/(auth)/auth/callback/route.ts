import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const errorDescription = url.searchParams.get("error_description");

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("authError", "missing_supabase_configuration");
    return NextResponse.redirect(errorUrl);
  }

  if (errorDescription) {
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("authError", errorDescription);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectTarget =
    next.startsWith("http://") || next.startsWith("https://")
      ? next
      : new URL(next, url.origin).toString();

  return NextResponse.redirect(redirectTarget);
}
