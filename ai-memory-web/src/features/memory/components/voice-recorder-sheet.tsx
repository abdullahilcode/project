"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AudioWaveform,
  Loader2,
  MicVocal,
  Pause,
  Play,
  Save,
  X,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store/ui-store";
import { useMemoryStore } from "@/store/memory-store";

async function uploadVoiceMemory(payload: FormData) {
  const response = await fetch("/api/memories/voice", {
    method: "POST",
    body: payload,
  });
  if (!response.ok) {
    throw new Error("Failed to capture voice memory.");
  }
  return await response.json();
}

export function VoiceRecorderSheet() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const { showVoiceRecorder, setVoiceRecorder } = useUIStore((state) => ({
    showVoiceRecorder: state.showVoiceRecorder,
    setVoiceRecorder: state.setVoiceRecorder,
  }));
  const { upsertMemory } = useMemoryStore((state) => ({
    upsertMemory: state.upsertMemory,
  }));

  const mutation = useMutation({
    mutationFn: uploadVoiceMemory,
    onSuccess: (data) => {
      upsertMemory(data);
      toast.success("Voice memory synced", {
        description: "Transcript and embeddings are being generated.",
      });
      setVoiceRecorder(false);
    },
    onError: () => {
      toast.error("Voice capture failed", {
        description: "Check Whisper API credentials or microphone permissions.",
      });
    },
  });

  const cleanup = useCallback(() => {
    mediaRecorder.current?.stop();
    mediaRecorder.current = null;
    audioChunks.current = [];
    setRecording(false);
  }, []);

useEffect(() => {
  if (showVoiceRecorder) return;
  const id = requestAnimationFrame(() => {
    cleanup();
    setAudioUrl(null);
    setTranscript("");
  });
  return () => cancelAnimationFrame(id);
}, [showVoiceRecorder, cleanup]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecording(false);
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error(error);
      toast.error("Microphone access denied", {
        description: "Please enable microphone access to capture voice notes.",
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
  }, []);

  const handleSave = useCallback(async () => {
    if (!audioUrl) {
      toast.error("No audio recorded yet.");
      return;
    }
    const response = await fetch(audioUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob, "memory.webm");
    formData.append("transcript", transcript);

    mutation.mutate(formData);
  }, [audioUrl, transcript, mutation]);

  return (
    <Sheet open={showVoiceRecorder} onOpenChange={setVoiceRecorder}>
      <SheetContent className="flex flex-col gap-6 bg-gradient-to-br from-zinc-950/80 via-zinc-950/60 to-black/70 text-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3 text-lg text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
              <MicVocal className="size-5" />
            </span>
            Capture voice reflection
          </SheetTitle>
          <SheetDescription className="text-sm text-white/60">
            Record a thought, meeting recap, or ambient insight. Whisper will
            transcribe and the AI will connect this to relevant memories.
          </SheetDescription>
        </SheetHeader>

          <Card className="relative flex flex-1 flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner-neon">
            <div className="flex flex-col items-center justify-center gap-4">
              <AudioWaveform className="h-24 w-full text-white/30" />
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium text-white">
                  {recording
                    ? "Listening… speak freely and we\u2019ll capture everything."
                    : "Press start to capture your voice."}
                </p>
                <p className="text-xs text-white/60">
                  We&apos;ll automatically remove background noise, run Whisper
                  transcription, tag insights, and compute embeddings.
                </p>
              </div>
            </div>

          <div className="flex items-center justify-center gap-3">
            {!recording ? (
              <Button
                size="lg"
                className="gap-2 rounded-full bg-brand px-6 text-brand-foreground shadow-lg shadow-brand/20"
                onClick={startRecording}
              >
                <Play className="size-4" />
                Start recording
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2 rounded-full bg-rose-500 px-6 text-white shadow-lg shadow-rose-500/30"
                onClick={stopRecording}
              >
                <Pause className="size-4" />
                Stop recording
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => {
                cleanup();
                setVoiceRecorder(false);
              }}
            >
              <X className="size-4" />
            </Button>
          </div>

          {audioUrl && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
              <audio controls src={audioUrl} className="w-full" />
              <Textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                rows={4}
                placeholder="Add optional context or manual transcript notes…"
                className="border-white/20 bg-white/5 text-sm focus-visible:ring-brand"
              />
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            className="rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => setVoiceRecorder(false)}
          >
            Cancel
          </Button>
          <Button
            className="gap-2 rounded-full bg-brand px-6 text-brand-foreground shadow-lg shadow-brand/30"
            disabled={!audioUrl || mutation.isPending}
            onClick={handleSave}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save to memories
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
