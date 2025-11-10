"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      toastOptions={{
        style: {
          borderRadius: "0.75rem",
          background: "oklch(var(--background) / 0.92)",
          border: "1px solid oklch(var(--border))",
          backdropFilter: "blur(12px)",
        },
      }}
    />
  );
}
