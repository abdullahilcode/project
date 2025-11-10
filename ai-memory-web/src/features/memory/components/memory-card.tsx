"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Link2,
  MicVocal,
  PenSquare,
  Sparkle,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MemoryNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const KIND_ICON: Record<MemoryNode["kind"], React.ComponentType<{ className?: string }>> = {
  text: PenSquare,
  document: BookOpen,
  voice: MicVocal,
  image: Sparkle,
  link: Link2,
};

interface MemoryCardProps {
  memory: MemoryNode;
  highlight?: boolean;
  onSelect?: (memory: MemoryNode) => void;
}

export function MemoryCard({ memory, highlight = false, onSelect }: MemoryCardProps) {
  const Icon = KIND_ICON[memory.kind] ?? Workflow;
  const createdAt = useMemo(
    () => format(new Date(memory.createdAt), "PPP · p"),
    [memory.createdAt],
  );

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect?.(memory)}
      className="w-full text-left focus-visible:outline-none"
    >
      <Card
        className={cn(
          "glass-panel relative w-full overflow-hidden rounded-3xl border border-border/70 bg-white/70 p-5 shadow-lg shadow-black/5 transition-all hover:border-brand/50 hover:shadow-brand/20 dark:bg-zinc-950/50",
          highlight && "border-brand/60 bg-brand/10",
        )}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/80 bg-white/60 text-brand shadow-inner-neon dark:bg-zinc-900/60">
            <Icon className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {memory.title}
              </h3>
              <Badge
                variant="outline"
                className="border-border bg-white/60 font-medium uppercase tracking-wide"
              >
                {memory.kind}
              </Badge>
              {memory.encryption?.encrypted && (
                <Badge
                  variant="secondary"
                  className="border border-emerald-500/40 bg-emerald-500/10 text-[10px] uppercase tracking-[0.3em] text-emerald-400"
                >
                  Encrypted
                </Badge>
              )}
            </div>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {memory.summary}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{createdAt}</span>
              <span>·</span>
              <span>{Math.round(memory.importance * 100)}% significance</span>
              {memory.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full bg-white/70 text-xs text-muted-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {memory.media?.thumbnailUrl && (
              <div className="relative overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src={memory.media.thumbnailUrl}
                  alt={memory.title}
                  width={640}
                  height={360}
                  className="h-40 w-full object-cover"
                />
              </div>
            )}

            {memory.linkPreviews?.[0] && (
              <div className="rounded-2xl border border-border/60 bg-white/60 p-3 dark:bg-zinc-900/60">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Related Link
                </p>
                <p className="text-sm font-medium text-foreground">
                  {memory.linkPreviews[0].title ?? memory.linkPreviews[0].url}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {memory.linkPreviews[0].description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Embedding status
            <Progress
              value={
                memory.embeddingStatus === "ready"
                  ? 100
                  : memory.embeddingStatus === "pending"
                    ? 45
                    : 0
              }
              className="h-2 flex-1 bg-white/50"
            />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border-dashed border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em]",
              memory.embeddingStatus === "ready"
                ? "text-emerald-400"
                : memory.embeddingStatus === "pending"
                  ? "text-amber-400"
                  : "text-rose-400",
            )}
          >
            {memory.embeddingStatus}
          </Badge>
        </div>
      </Card>
    </motion.button>
  );
}
