"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { MemoryCard } from "./memory-card";
import { useMemories, useMemoryStore } from "@/store/memory-store";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Brain, Filter, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function MemoryTimeline() {
  const memories = useMemories();
  const { setMemoryDetails } = useUIStore((state) => ({
    setMemoryDetails: state.setMemoryDetails,
  }));
  const { selectedMemoryId, setSelectedMemory } = useMemoryStore((state) => ({
    selectedMemoryId: state.selectedMemoryId,
    setSelectedMemory: state.setSelectedMemory,
  }));
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    );
  }, [memories]);

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-brand/30 bg-brand/10 p-2 text-brand">
            <Brain className="size-4" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Live Memory Stream
            </h2>
            <p className="text-xs text-muted-foreground">
              Every upload, conversation, and reflection connected in real-time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2 rounded-full">
            <Filter className="size-4" />
            Filters
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-full">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="relative space-y-4 before:absolute before:bottom-0 before:left-[28px] before:top-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
        {sortedMemories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative pl-14"
          >
            <span
              className={cn(
                "absolute left-6 top-8 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/40 bg-brand/20 shadow-brand/40",
                memory.id === selectedMemoryId && "scale-125 bg-brand",
              )}
            />
            <MemoryCard
              memory={memory}
              highlight={memory.id === selectedMemoryId}
              onSelect={(selected) => {
                setSelectedMemory(selected.id);
                setMemoryDetails(true, selected.id);
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
