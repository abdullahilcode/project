import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { clientEnv } from "@/lib/env";

type GenericDatabase = Record<string, never>;
type SupabaseServerClient = SupabaseClient<GenericDatabase, string>;

function getMutableCookieStore() {
  const cookieStore = cookies() as unknown as {
    get(name: string): { value?: string } | undefined;
    set?: (
      name: string,
      value: string,
      options?: Record<string, unknown>,
    ) => void;
  };
  return cookieStore;
}

export function createSupabaseServerClient(): SupabaseServerClient | null {
  if (
    !clientEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const cookieStore = getMutableCookieStore();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          if (typeof cookieStore.set !== "function") return;
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          if (typeof cookieStore.set !== "function") return;
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );
}

export async function getServerSession(): Promise<{
  supabase: SupabaseServerClient | null;
  session: Session | null;
  user: User | null;
}> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, session: null, user: null };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    session,
    user: session?.user ?? null,
  };
}

export async function requireUser(): Promise<{
  supabase: SupabaseServerClient;
  user: User;
}> {
  const { supabase, user } = await getServerSession();
  if (!supabase || !user) {
    throw new Error("User session required");
  }
  return { supabase, user };
}
