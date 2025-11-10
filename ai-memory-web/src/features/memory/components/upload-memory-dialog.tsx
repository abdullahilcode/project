"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { FileUp, Loader2, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMemoryStore } from "@/store/memory-store";
import { useUIStore } from "@/store/ui-store";

const memorySchema = z.object({
  title: z.string().min(2),
  kind: z.enum(["text", "voice", "image", "link", "document"]),
  content: z.string().min(6),
  tags: z.string().optional(),
  importance: z.number().min(0).max(1),
});

type MemoryFormValues = z.infer<typeof memorySchema>;

async function createMemory(values: MemoryFormValues) {
  const response = await fetch("/api/memories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    throw new Error("Failed to create memory.");
  }
  return await response.json();
}

export function UploadMemoryDialog() {
  const { showUploadDialog, setUploadDialog } = useUIStore((state) => ({
    showUploadDialog: state.showUploadDialog,
    setUploadDialog: state.setUploadDialog,
  }));
  const upsertMemory = useMemoryStore((state) => state.upsertMemory);
  const [activeKind, setActiveKind] =
    useState<MemoryFormValues["kind"]>("text");
  const [importance, setImportance] = useState(0.5);

  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: "",
      kind: "text",
      content: "",
      tags: "",
      importance: 0.5,
    },
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!showUploadDialog) {
        form.reset();
        setActiveKind("text");
        setImportance(0.5);
      } else {
        setActiveKind(form.getValues("kind"));
        setImportance(form.getValues("importance"));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [showUploadDialog, form]);

  const mutation = useMutation({
    mutationFn: createMemory,
    onSuccess: (data) => {
      upsertMemory(data);
      toast.success("Memory captured", {
        description: "AI will summarize and index this moment in the graph.",
      });
      setUploadDialog(false);
    },
    onError: () => {
      toast.error("Could not capture memory", {
        description: "Check your Supabase and OpenAI credentials.",
      });
    },
  });

  return (
    <Dialog open={showUploadDialog} onOpenChange={setUploadDialog}>
      <DialogContent className="max-w-2xl rounded-3xl border border-border/60 bg-white/80 backdrop-blur-3xl dark:bg-zinc-950/70">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-foreground">
            Capture a new memory
          </DialogTitle>
          <DialogDescription>
            Upload text, documents, voice notes, or links. AI will annotate,
            summarize, and connect it to your neural web.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-5"
        >
          <Tabs
            value={activeKind}
            onValueChange={(value) => {
              const next = value as MemoryFormValues["kind"];
              setActiveKind(next);
              form.setValue("kind", next);
            }}
          >
            <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-white/70 p-1">
              {["text", "document", "voice", "image", "link"].map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="rounded-xl text-xs capitalize data-[state=active]:bg-brand data-[state=active]:text-brand-foreground"
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Title
              </label>
              <Input
                {...form.register("title")}
                placeholder="Give this memory a name..."
                className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-inner-neon focus-visible:ring-brand"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Content
              </label>
              <Textarea
                rows={6}
                {...form.register("content")}
                placeholder="Drop in raw thoughts, meeting notes, transcripts, or contextual details."
                className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-inner-neon focus-visible:ring-brand"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Tags
              </label>
              <Input
                {...form.register("tags")}
                placeholder="design, psychology, strategy"
                className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-inner-neon focus-visible:ring-brand"
              />
            </div>
          </div>

          <AnimatePresence>
            {activeKind === "document" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="flex items-center justify-between rounded-2xl border border-dashed border-border/60 bg-white/70 px-4 py-3 dark:bg-zinc-900/60"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Upload supporting file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supabase storage with AES-256 encryption before upload.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  <FileUp className="size-4" />
                  Choose file
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/70 px-4 py-3 shadow-inner-neon dark:bg-zinc-900/60">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Importance score
              </span>
              <span className="text-sm font-semibold text-foreground">
                {(importance * 100).toFixed(0)}% priority
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={importance}
              onChange={(event) => {
                const next = Number.parseFloat(event.target.value);
                setImportance(next);
                form.setValue("importance", next);
              }}
              className="w-40 accent-brand"
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-dashed border-brand/60 bg-brand/10 text-xs uppercase tracking-[0.3em] text-brand"
            >
              AES-256 encryption enabled
            </Badge>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Sync memory
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
