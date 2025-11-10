"use client";

import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMemoryById } from "@/store/memory-store";
import { useUIStore } from "@/store/ui-store";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export function MemoryDetailsDrawer() {
  const { showMemoryDetails, setMemoryDetails, lastViewedMemoryId } =
    useUIStore((state) => ({
      showMemoryDetails: state.showMemoryDetails,
      setMemoryDetails: state.setMemoryDetails,
      lastViewedMemoryId: state.lastViewedMemoryId,
    }));

  const memory = useMemoryById(lastViewedMemoryId);
  const createdAt =
    memory?.createdAt &&
    format(new Date(memory.createdAt), "EEEE, MMMM do yyyy — hh:mm aaaa");

  return (
    <Sheet
      open={showMemoryDetails}
      onOpenChange={(open) => setMemoryDetails(open, lastViewedMemoryId)}
    >
      <SheetContent
        side="right"
        className="w-[420px] space-y-5 bg-white/90 p-0 pt-4 dark:bg-zinc-950/80"
      >
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-4 text-brand" />
            Memory details
          </SheetTitle>
          <SheetDescription>
            Inspect AI summaries, transcripts, and connection graph metadata.
          </SheetDescription>
        </SheetHeader>
        <Separator className="bg-border/60" />
        <ScrollArea className="h-full px-6 pb-6">
          {!memory ? (
            <p className="text-sm text-muted-foreground">
              Select a memory to see the full context.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="uppercase tracking-[0.3em]"
                  >
                    {memory.kind}
                  </Badge>
                  {memory.source && (
                    <Badge variant="outline">{memory.source}</Badge>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {memory.title ?? "Untitled memory"}
                </h2>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {createdAt}
                </p>
              </div>

              {memory.media?.url && (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <Image
                    src={memory.media.url}
                    alt={memory.title ?? "Memory media"}
                    width={800}
                    height={600}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3 rounded-3xl border border-border/60 bg-white/70 p-4 shadow-inner-neon dark:bg-zinc-900/60">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  AI Summary
                </h3>
                <p className="text-sm leading-6 text-foreground">
                  {memory.summary ??
                    memory.content ??
                    memory.rawText ??
                    "No summary available yet."}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Full content
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                  {memory.content ??
                    memory.rawText ??
                    "No content captured yet."}
                </p>
              </div>

              {memory.transcript && (
                <div className="space-y-2 rounded-3xl border border-brand/30 bg-brand/10 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                    Transcript
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-brand-foreground/90">
                    {memory.transcript}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Tags & Sentiment
                </h3>
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full border-border/70 bg-white/70 text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {memory.sentiments?.map((sentiment) => (
                    <Badge
                      key={sentiment.label}
                      variant="secondary"
                      className="rounded-full bg-emerald-500/10 text-emerald-400"
                    >
                      {sentiment.label}: {(sentiment.score * 100).toFixed(0)}%
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
