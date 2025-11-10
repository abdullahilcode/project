import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";

type MutableCookieStore = {
  get(name: string): { value?: string } | undefined;
  set?: (
    name: string,
    value: string,
    options?: Record<string, unknown>,
  ) => void;
};

export function getSupabaseServerClient() {
  const cookieStore = cookies() as unknown as MutableCookieStore;

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown> = {}) {
          if (typeof cookieStore.set === "function") {
            cookieStore.set(name, value, options);
          }
        },
        remove(name: string, options: Record<string, unknown> = {}) {
          if (typeof cookieStore.set === "function") {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          }
        },
      },
    },
  );
}

export async function getServerSession() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { supabase, session };
}
