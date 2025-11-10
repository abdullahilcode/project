import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export function getSupabaseServerClient() {
  return createSupabaseServerClient();
}
