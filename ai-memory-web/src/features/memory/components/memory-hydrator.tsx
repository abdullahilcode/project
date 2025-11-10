"use client";

import { useEffect } from "react";

import type { MemoryEdge, MemoryInsight, MemoryNode } from "@/lib/types";
import { useMemoryStore } from "@/store/memory-store";

interface MemoryHydratorProps {
  memories: MemoryNode[];
  edges: MemoryEdge[];
  insights: MemoryInsight[];
}

export function MemoryHydrator({
  memories,
  edges,
  insights,
}: MemoryHydratorProps) {
  const hydrate = useMemoryStore((state) => state.hydrate);

  useEffect(() => {
    hydrate({
      memories: memories.reduce<Record<string, MemoryNode>>((acc, memory) => {
        acc[memory.id] = memory;
        return acc;
      }, {}),
      edges,
      insights,
      isSyncing: false,
      lastSyncedAt: new Date().toISOString(),
    });
  }, [memories, edges, insights, hydrate]);

  return null;
}
