"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, SendHorizonal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MemoryChatMessage } from "@/lib/types";
import { useChatHistory, useMemoryStore } from "@/store/memory-store";

async function sendChatMessage(message: string) {
  const response = await fetch("/api/memories/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate AI response.");
  }
  return (await response.json()) as {
    id: string;
    content: string;
    memoryReferences?: string[];
  };
}

export function MemoryChatPanel() {
  const chatHistory = useChatHistory();
  const { appendChatMessage, patchChatMessage } = useMemoryStore((state) => ({
    appendChatMessage: state.appendChatMessage,
    patchChatMessage: state.patchChatMessage,
  }));
  const [input, setInput] = useState("");

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (variables) => {
      const id = crypto.randomUUID();
      const optimistic: MemoryChatMessage = {
        id,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        streaming: true,
      };
      appendChatMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: variables,
        createdAt: new Date().toISOString(),
      });
      appendChatMessage(optimistic);
      return { id };
    },
    onSuccess: (data, _variables, context) => {
      if (!context?.id) return;
      patchChatMessage(context.id, {
        content: data.content,
        streaming: false,
        memoryReferences: data.memoryReferences,
      });
    },
    onError: (_error, _variables, context) => {
      if (!context?.id) return;
      patchChatMessage(context.id, {
        content:
          "⚠️ I couldn't reach the AI services right now. Please verify your OpenAI and Supabase keys.",
        streaming: false,
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    mutation.mutate(message);
  };

  return (
    <Card className="flex h-full flex-col rounded-3xl border border-border/70 bg-white/70 p-4 shadow-inner-neon dark:bg-zinc-950/50">
      <header className="flex items-center justify-between pb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Chat with your memories
          </p>
          <p className="text-xs text-muted-foreground">
            Ask follow-up questions. The AI cross-references embeddings and
            knowledge graph edges.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-dashed"
          onClick={() => mutation.mutate("Summarize the latest updates.")}
        >
          <Sparkles className="size-4 text-brand" />
          Instant insight
        </Button>
      </header>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 py-2">
          <AnimatePresence initial={false}>
            {chatHistory.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-white/60 p-3 text-sm shadow-sm dark:bg-zinc-900/60"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {message.role === "assistant" ? "AI" : "You"}
                </span>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {message.content || "…"}
                </p>
                {message.streaming && (
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Synthesizing memories…
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything — try “What did I plan for my 2024 startup idea?”"
          className="h-12 flex-1 rounded-full border border-border/70 bg-white/80 px-4 text-sm shadow-inner-neon focus-visible:ring-brand"
        />
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90"
          disabled={mutation.isPending && input.length === 0}
        >
          {mutation.isPending && input.length === 0 ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizonal className="size-5" />
          )}
        </Button>
      </form>
    </Card>
  );
}
