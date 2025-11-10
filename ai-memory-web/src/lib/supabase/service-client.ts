import { createClient } from "@supabase/supabase-js";

import { clientEnv, serverEnv } from "@/lib/env";

let serviceClient:
  | ReturnType<typeof createClient>
  | null = null;

export function getSupabaseServiceClient() {
  if (serviceClient) {
    return serviceClient;
  }

  if (
    !clientEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnv.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn(
      "Supabase service client requested without required environment variables.",
    );
    return null;
  }

  serviceClient = createClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
    },
  );

  return serviceClient;
}
