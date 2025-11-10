"use client";

import { motion } from "framer-motion";
import { Lightbulb, Radar, Sparkle, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemoryStore } from "@/store/memory-store";

const ICONS = {
  cluster: Radar,
  trend: TrendingUp,
  anomaly: Sparkle,
  reflection: Lightbulb,
} as const;

export function InsightsPanel() {
  const insights = useMemoryStore((state) => state.insights);

  return (
    <Card className="flex h-full flex-col gap-3 rounded-3xl border border-border/70 bg-white/70 p-4 shadow-inner-neon dark:bg-zinc-950/40">
      <header>
        <p className="text-sm font-semibold text-foreground">AI Highlights</p>
        <p className="text-xs text-muted-foreground">
          Generated using embeddings, temporal clustering, and semantic drift
          detection.
        </p>
      </header>

      <ScrollArea className="h-[320px] pr-3">
        <div className="space-y-3 pt-1">
          {insights.map((insight, index) => {
            const Icon = ICONS[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border/60 bg-white/70 p-3 shadow-sm dark:bg-zinc-900/50"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-brand">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {insight.title}
                    </h3>
                  </div>
                  <Badge variant="outline" className="uppercase tracking-[0.3em]">
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {insight.body}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Linked memories: {insight.relatedMemoryIds.length}
                </p>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
