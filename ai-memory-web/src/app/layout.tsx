import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerSession } from "@/lib/auth/supabase-server";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-memory-web.vercel.app"),
  title: {
    template: "%s — AI Memory Web",
    default: "AI Memory Web — Your Personal Neural Cloud",
  },
  description:
    "AI Memory Web is your AI-powered personal memory cloud that captures, organizes, and connects everything you think, say, or create.",
  keywords: [
    "AI memory",
    "knowledge graph",
    "second brain",
    "Supabase",
    "LangChain",
    "pgvector",
    "personal knowledge management",
  ],
  openGraph: {
    title: "AI Memory Web",
    description:
      "Capture every thought, idea, and inspiration. Visualize your mind as a living neural web and chat with your memories in real-time.",
    url: "https://ai-memory-web.vercel.app",
    siteName: "AI Memory Web",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Memory Web — Your Personal Neural Cloud",
    description:
      "Upload anything, let AI weave the connections, and explore your mind as a living, searchable memory graph.",
  },
  authors: [{ name: "AI Memory Web" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session } = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider>
          <Providers initialSession={session}>{children}</Providers>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
