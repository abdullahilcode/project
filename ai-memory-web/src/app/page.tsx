import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { MemoryDetailsDrawer } from "@/features/memory/components/memory-details-drawer";
import { MemoryGraph } from "@/features/memory/components/memory-graph";
import { MemoryHydrator } from "@/features/memory/components/memory-hydrator";
import { MemoryTimeline } from "@/features/memory/components/memory-timeline";
import { MemoryChatPanel } from "@/features/memory/components/memory-chat-panel";
import { InsightsPanel } from "@/features/memory/components/insights-panel";
import { UploadMemoryDialog } from "@/features/memory/components/upload-memory-dialog";
import { VoiceRecorderSheet } from "@/features/memory/components/voice-recorder-sheet";
import { getServerSession } from "@/lib/auth/supabase-server";
import {
  DEFAULT_DEMO_USER_ID,
  getMemoryRepository,
} from "@/lib/repository/memory-repository";
import type { MemoryInsight, MemoryNode } from "@/lib/types";

function generateInsights(memories: MemoryNode[]): MemoryInsight[] {
  if (memories.length === 0) {
    return [];
  }

  const latest = memories[0];
  const designRelated = memories.filter((memory) =>
    memory.tags.some((tag) => ["design", "psychology"].includes(tag)),
  );

  return [
    {
      id: "insight-cluster-design",
      title: "Design ↔ Psychology Cluster Strengthening",
      body: "Your recent uploads continue reinforcing the bridge between design rituals and behavior psychology. Consider drafting a playbook that links these insights to onboarding flows.",
      type: "cluster",
      relatedMemoryIds: designRelated.map((memory) => memory.id),
      createdAt: new Date().toISOString(),
    },
    {
      id: "insight-trend-voice",
      title: "Voice reflections shaping product vision",
      body: "Voice logs now capture 32% of new memories this month. Whisper transcription quality remains high—opportunity to automate journaling prompts ahead of deep work sessions.",
      type: "trend",
      relatedMemoryIds: memories
        .filter((memory) => memory.kind === "voice")
        .map((memory) => memory.id),
      createdAt: new Date().toISOString(),
    },
    {
      id: "insight-reflection-latest",
      title: "Next Nudge",
      body: `Ask the AI: “Draft action steps extending ${latest.title} into a public roadmap.” This keeps the momentum from your latest capture.`,
      type: "reflection",
      relatedMemoryIds: [latest.id],
      createdAt: new Date().toISOString(),
    },
  ];
}

export default async function Home() {
  const { session } = await getServerSession();
  const userId = session?.user?.id ?? DEFAULT_DEMO_USER_ID;

  const repository = getMemoryRepository();
  const [memories, edges] = await Promise.all([
    repository.listMemories(userId),
    repository.listEdges(userId),
  ]);
  const insights = generateInsights(memories);

  return (
    <div className="relative flex min-h-screen">
      <MemoryHydrator memories={memories} edges={edges} insights={insights} />
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <AppHeader />
        <section className="flex flex-1 flex-col gap-6 p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <MemoryTimeline />
            <div className="flex flex-col gap-4">
              <MemoryGraph />
              <InsightsPanel />
            </div>
          </div>
          <MemoryChatPanel />
        </section>
      </main>

      <UploadMemoryDialog />
      <VoiceRecorderSheet />
      <MemoryDetailsDrawer />
    </div>
  );
}
