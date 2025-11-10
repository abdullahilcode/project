"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MicVocal, Plus, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemoryStore } from "@/store/memory-store";
import { useUIStore } from "@/store/ui-store";

export function AppHeader() {
  const { setUploadDialog, setVoiceRecorder } = useUIStore((state) => ({
    setUploadDialog: state.setUploadDialog,
    setVoiceRecorder: state.setVoiceRecorder,
  }));
  const { isSyncing, lastSyncedAt, setSelectedMemory } = useMemoryStore(
    (state) => ({
      isSyncing: state.isSyncing,
      lastSyncedAt: state.lastSyncedAt,
      setSelectedMemory: state.setSelectedMemory,
    }),
  );

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchMutation = useMutation({
    mutationFn: async (value: string) => {
      const response = await fetch(
        `/api/memories/search?q=${encodeURIComponent(value)}&limit=5`,
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      return data.results as Array<{
        score: number;
        memory: { id: string; title: string; summary: string };
      }>;
    },
    onSuccess: (results, value) => {
      if (results.length === 0) {
        toast("No memories found", {
          description: `No matches for “${value}”. Capture it as a new memory!`,
        });
        return;
      }
      const top = results[0];
      setSelectedMemory(top.memory.id);
      toast.success("Memory surfaced", {
        description: top.memory.title,
      });
    },
    onError: () => {
      toast.error("Search unavailable", {
        description: "Check your API routes or Supabase connectivity.",
      });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate(query.trim());
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 px-6 backdrop-blur-3xl dark:from-zinc-950/60 dark:via-zinc-950/40 dark:to-zinc-950/30">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.4em] text-brand"
          >
            Personal Neural Cloud
          </motion.div>
          <Badge variant="secondary" className="font-mono text-xs">
            {isSyncing ? "Syncing..." : `Synced · ${lastSyncedAt ?? "now"}`}
          </Badge>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-2xl font-semibold text-foreground lg:text-3xl"
        >
          Remember everything. Explore connections. Think with AI.
        </motion.h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/60 px-3 py-2 shadow-inner-neon dark:bg-zinc-900/60 md:flex">
          <Search className="size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search memories, tags, feelings..."
            className="h-8 w-56 border-0 bg-transparent text-sm focus-visible:ring-0"
          />
          <Badge
            variant="outline"
            className="rounded-full border-border bg-white/80 text-[10px] uppercase tracking-[0.2em]"
          >
            ⌘ K
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-1 text-xs shadow-inner-neon hover:bg-white/90"
            onClick={handleSearch}
            disabled={searchMutation.isPending}
          >
            {searchMutation.isPending ? (
              <span className="animate-pulse text-muted-foreground">Searching…</span>
            ) : (
              <>
                <Sparkles className="size-4 text-brand" />
                Recall
              </>
            )}
          </Button>
        </div>

        <Button
          size="sm"
          className="hidden gap-2 rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition hover:bg-brand/90 md:flex"
          onClick={() => setUploadDialog(true)}
        >
          <Plus className="size-4" />
          Upload Memory
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 rounded-full border-dashed border-border/70 bg-white/60 shadow-inner-neon hover:bg-white/80 dark:bg-zinc-900/50 lg:flex"
          onClick={() => setVoiceRecorder(true)}
        >
          <MicVocal className="size-4 text-brand" />
          Capture Voice
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-border/70 bg-white/60 text-brand shadow-inner-neon hover:bg-brand/10"
        >
          <Sparkles className="size-4" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
