import { randomUUID } from "node:crypto";

import type { MemoryEdge, MemoryNode } from "@/lib/types";

const seededMemories: MemoryNode[] = [
  {
    id: randomUUID(),
    title: "2024 Startup Vision Brainstorm",
    kind: "text",
    source: "import",
    summary:
      "Outlined the mission for a mindful productivity platform blending design psychology with AI memory augmentation.",
    content:
      "I mapped the product vision for an intelligent workspace that remembers decisions and surfaces insights during creative flow. Key pillars: adaptive memory retrieval, visual relationship mapping, and ambient nudges. Primary personas are design leads balancing research and shipping velocity.",
    tags: ["startup", "product", "design", "psychology", "vision"],
    transcript: undefined,
    sentiments: [
      { label: "excited", score: 0.72 },
      { label: "focused", score: 0.64 },
    ],
    importance: 0.88,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 88).toISOString(),
    embeddingStatus: "ready",
    vectorId: undefined,
    linkPreviews: undefined,
    media: undefined,
    encryption: { encrypted: false, scheme: "aes-256-gcm", keyVersion: "demo" },
  },
  {
    id: randomUUID(),
    title: "Design + Psychology Intersection Notes",
    kind: "document",
    source: "upload",
    summary:
      "Annotated readings on behavior design and cognitive load theory, emphasizing pattern recognition for creative teams.",
    content:
      "Key takeaway: designers internalize information faster through narrative-linked memories. Systems that mirror neural pathways aid recall. We should map multi-sensory anchors to project artifacts to reduce decision fatigue.",
    tags: ["design", "psychology", "cognitive science", "research"],
    transcript: undefined,
    sentiments: [{ label: "curious", score: 0.58 }],
    importance: 0.73,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(),
    embeddingStatus: "ready",
    vectorId: undefined,
    linkPreviews: undefined,
    media: {
      url: "/demo-assets/design-psychology.pdf",
      mimeType: "application/pdf",
    },
    encryption: { encrypted: false, scheme: "aes-256-gcm", keyVersion: "demo" },
  },
  {
    id: randomUUID(),
    title: "Voice Reflection: Creative Flow Ritual",
    kind: "voice",
    source: "recording",
    summary:
      "Captured an evening voice log describing the routine that triggers deep work, focusing on ambient audio and memory prompts.",
    content:
      "Transcript: 'When I start the session, I play low-frequency binaural beats and review the memory graph cluster around customer interviews. It helps me lock into the why before sketching interfaces.'",
    tags: ["voice", "ritual", "productivity"],
    transcript:
      "When I start the session, I play low-frequency binaural beats and review the memory graph cluster around customer interviews. It helps me lock into the why before sketching interfaces.",
    sentiments: [
      { label: "reflective", score: 0.66 },
      { label: "motivated", score: 0.55 },
    ],
    importance: 0.61,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    embeddingStatus: "ready",
    vectorId: undefined,
    linkPreviews: undefined,
    media: {
      url: "/demo-assets/voice-reflection.mp3",
      durationMs: 128_000,
      mimeType: "audio/mpeg",
    },
    encryption: { encrypted: true, scheme: "aes-256-gcm", keyVersion: "demo" },
  },
  {
    id: randomUUID(),
    title: "Link: Spatial Computing Market Brief",
    kind: "link",
    source: "import",
    summary:
      "Key market signals for spatial computing, highlighting potential partners for immersive memory browsing experiences.",
    content:
      "Saved link: https://futureinterfaces.xyz/spatial-computing-brief. Highlights partnerships with headset manufacturers and frameworks for mixed reality cognition overlays.",
    tags: ["market", "strategy", "spatial computing", "xr"],
    transcript: undefined,
    sentiments: [{ label: "analytical", score: 0.49 }],
    importance: 0.52,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    embeddingStatus: "ready",
    vectorId: undefined,
    linkPreviews: [
      {
        url: "https://futureinterfaces.xyz/spatial-computing-brief",
        title: "Spatial Computing: 2025 Market Brief",
        description:
          "An in-depth look at the emerging spatial computing landscape and strategic opportunities for immersive tooling.",
        image:
          "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=800&q=80",
      },
    ],
    media: undefined,
    encryption: { encrypted: false, scheme: "aes-256-gcm", keyVersion: "demo" },
  },
  {
    id: randomUUID(),
    title: "Design Review: Memory Graph Prototype",
    kind: "image",
    source: "upload",
    summary:
      "Captured Figma board screenshots from the neural graph prototype, with annotations on force-directed layout tuning.",
    content:
      "Image includes multi-layer nodes representing thought clusters. Notes about variable edge tension based on relationship strength and semantic similarity.",
    tags: ["design", "prototype", "graph", "figma"],
    transcript: undefined,
    sentiments: [{ label: "optimistic", score: 0.51 }],
    importance: 0.69,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    embeddingStatus: "pending",
    vectorId: undefined,
    linkPreviews: undefined,
    media: {
      url: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=640&q=60",
      mimeType: "image/jpeg",
    },
    encryption: { encrypted: false, scheme: "aes-256-gcm", keyVersion: "demo" },
  },
];

const seededEdges: MemoryEdge[] = [
  {
    id: randomUUID(),
    source: seededMemories[0].id,
    target: seededMemories[1].id,
    relationship: "builds-upon",
    weight: 0.82,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(),
  },
  {
    id: randomUUID(),
    source: seededMemories[0].id,
    target: seededMemories[2].id,
    relationship: "inspires",
    weight: 0.74,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32).toISOString(),
  },
  {
    id: randomUUID(),
    source: seededMemories[1].id,
    target: seededMemories[3].id,
    relationship: "references",
    weight: 0.68,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: randomUUID(),
    source: seededMemories[4].id,
    target: seededMemories[0].id,
    relationship: "visualizes",
    weight: 0.76,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

export function getDemoData() {
  return {
    memories: seededMemories,
    edges: seededEdges,
  };
}
