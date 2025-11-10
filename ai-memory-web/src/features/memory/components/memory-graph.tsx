"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { Card } from "@/components/ui/card";
import { useEdges, useMemories, useMemoryStore } from "@/store/memory-store";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit } from "lucide-react";

const nodeStyles = {
  borderRadius: 18,
  padding: 16,
  border: "1px solid rgba(99, 102, 241, 0.25)",
  background: "rgba(15, 17, 29, 0.65)",
  color: "#f4f4f5",
  backdropFilter: "blur(16px)",
  fontSize: 12,
  width: 220,
};

export function MemoryGraph() {
  const memories = useMemories();
  const edges = useEdges();
  const { setSelectedMemory } = useMemoryStore((state) => ({
    setSelectedMemory: state.setSelectedMemory,
  }));

  const graphNodes = useMemo<Node[]>(
    () =>
      memories.map((memory, index) => ({
        id: memory.id,
        data: {
          label: (
            <div className="flex flex-col gap-1 text-[11px]">
              <span className="text-xs font-semibold">{memory.title}</span>
              <div className="flex flex-wrap gap-1">
                {memory.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ),
        },
        position: {
          x: Math.cos(index) * 200 + 300,
          y: Math.sin(index) * 120 + 200,
        },
        style: nodeStyles,
      })),
    [memories],
  );

  const graphEdges = useMemo<Edge[]>(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
        label: edge.relationship,
        style: {
          strokeWidth: 2,
        },
        labelStyle: {
          fill: "#a5b4fc",
          fontSize: 10,
          fontWeight: 500,
        },
      })),
    [edges],
  );

  return (
    <Card className="flex h-[420px] flex-col rounded-3xl border border-border/70 bg-black/40 p-4 shadow-xl shadow-brand/20">
      <header className="mb-3 flex items-center justify-between text-sm text-white">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/30 bg-white/10 p-2">
            <BrainCircuit className="size-4" />
          </span>
          <div>
            <p className="font-semibold">Neural Knowledge Graph</p>
            <p className="text-xs text-white/60">
              Force-directed layout with semantic edge weights
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-white/10 text-white">
          React Flow + pgvector
        </Badge>
      </header>

      <ReactFlow
        nodes={graphNodes}
        edges={graphEdges}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        onNodeClick={(_, node) => setSelectedMemory(node.id)}
        className="rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-950/60 via-slate-950/50 to-black/80"
      >
        <Background color="rgba(148, 163, 184, 0.25)" />
        <Controls position="top-right" />
        <MiniMap
          nodeStrokeColor="#818cf8"
          nodeColor="#312e81"
          maskColor="rgba(15, 23, 42, 0.6)"
        />
      </ReactFlow>
    </Card>
  );
}
