"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { type ReactNode, useState } from "react";

import { AuthProvider } from "@/components/auth-provider";
import { AppToaster } from "@/components/ui/app-toaster";

interface ProvidersProps {
  children: ReactNode;
  initialSession: Session | null;
}

export function Providers({ children, initialSession }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AuthProvider initialSession={initialSession}>
      <QueryClientProvider client={queryClient}>
        {children}
        <AppToaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
