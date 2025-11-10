import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";

export function getSupabaseServerClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = cookies() as unknown as {
    get(name: string): { value?: string } | undefined;
    set?: (name: string, value: string, options: Record<string, unknown>) => void;
  };
  const isMutable = typeof cookieStore.set === "function";

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          if (!isMutable || typeof cookieStore.set !== "function") return;
          (cookieStore.set as (name: string, value: string, options?: Record<string, unknown>) => void)(
            name,
            value,
            options,
          );
        },
        remove(name: string, options: Record<string, unknown>) {
          if (!isMutable || typeof cookieStore.set !== "function") return;
          (cookieStore.set as (name: string, value: string, options?: Record<string, unknown>) => void)(
            name,
            "",
            { maxAge: 0, ...options },
          );
        },
      },
    },
  );
}
