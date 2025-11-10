"use client";

import {
  BrainCircuit,
  ChartScatter,
  History,
  Settings2,
  Share2,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    id: "timeline",
    label: "Memory Stream",
    description: "Live capture of everything you save",
    icon: History,
  },
  {
    id: "graph",
    label: "Neural Graph",
    description: "Visual map of your connected thoughts",
    icon: BrainCircuit,
  },
  {
    id: "insights",
    label: "AI Insights",
    description: "Clustering, trends, and reflections",
    icon: ChartScatter,
  },
  {
    id: "settings",
    label: "Control Center",
    description: "Encryption, integrations, automations",
    icon: Settings2,
  },
];

export function AppSidebar() {
  const { activePanel, setActivePanel } = useUIStore((state) => ({
    activePanel: state.activePanel,
    setActivePanel: state.setActivePanel,
  }));

  return (
    <aside className="relative hidden min-h-screen w-[320px] flex-col border-r border-border/70 bg-gradient-to-b from-white/80 via-white/60 to-white/40 px-5 py-6 backdrop-blur-3xl shadow-inner-neon dark:from-zinc-900/40 dark:via-zinc-900/20 dark:to-zinc-900/10 lg:flex">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/70 via-brand/50 to-indigo-500 shadow-lg shadow-brand/30">
            <BrainCircuit className="size-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
              AI MEMORY
            </span>
            <span className="text-lg font-semibold text-foreground">
              Neural Web
            </span>
          </div>
        </Link>
        <Badge
          variant="outline"
          className="border-brand/40 bg-brand/10 text-xs uppercase tracking-wide text-brand"
        >
          Beta
        </Badge>
      </div>

      <nav className="flex flex-1 flex-col gap-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activePanel === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id as typeof activePanel)}
              className={cn(
                "group flex w-full flex-col rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-200",
                isActive
                  ? "border-brand/60 bg-brand/10 shadow-lg shadow-brand/20"
                  : "hover:border-border hover:bg-white/40 dark:hover:bg-zinc-900/40",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border text-foreground transition-colors",
                    isActive
                      ? "border-brand/60 bg-brand/20 text-brand-foreground"
                      : "border-border bg-white/60 text-muted-foreground dark:bg-zinc-900/60",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold tracking-wide",
                      isActive ? "text-brand" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 rounded-3xl border border-border/70 bg-white/60 p-5 text-sm shadow-inner-neon dark:bg-zinc-900/40">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Live Sync
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Supabase</p>
            <p className="text-xs text-muted-foreground">
              Postgres · Realtime Graph
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-emerald-500/20 text-xs font-semibold text-emerald-400"
          >
            Connected
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Share2 className="size-4" />
          Invite collaborator
        </Button>
      </div>
    </aside>
  );
}
