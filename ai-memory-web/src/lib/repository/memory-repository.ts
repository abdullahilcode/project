import { randomUUID } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { DEMO_USER_ID, getDemoData } from "@/lib/demo-data";
import type { MemoryEdge, MemoryNode, MemorySearchResult } from "@/lib/types";

export const DEFAULT_DEMO_USER_ID = DEMO_USER_ID;

export interface MemoryRepository {
  listMemories(userId: string): Promise<MemoryNode[]>;
  getMemoryById(userId: string, id: string): Promise<MemoryNode | null>;
  createMemory(
    userId: string,
    memory: Omit<MemoryNode, "id" | "createdAt" | "updatedAt" | "userId">,
  ): Promise<MemoryNode>;
  upsertMemory(memory: MemoryNode): Promise<MemoryNode>;
  deleteMemory(userId: string, id: string): Promise<void>;
  listEdges(userId: string): Promise<MemoryEdge[]>;
  upsertEdge(edge: MemoryEdge): Promise<MemoryEdge>;
  deleteEdge(userId: string, id: string): Promise<void>;
  searchMemories(
    userId: string,
    query: string,
    topK?: number,
  ): Promise<MemorySearchResult[]>;
}

type MemoryStore = {
  memories: Map<string, MemoryNode>;
  edges: Map<string, MemoryEdge>;
};

const inMemoryStore: MemoryStore = {
  memories: new Map(),
  edges: new Map(),
};

class InMemoryRepository implements MemoryRepository {
  async listMemories(userId: string) {
    return Array.from(inMemoryStore.memories.values())
      .filter((memory) => memory.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getMemoryById(userId: string, id: string) {
    const memory = inMemoryStore.memories.get(id);
    return memory?.userId === userId ? memory : null;
  }

  async createMemory(
    userId: string,
    memory: Omit<MemoryNode, "id" | "createdAt" | "updatedAt" | "userId">,
  ) {
    const now = new Date().toISOString();
    const created: MemoryNode = {
      ...memory,
      id: randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
      importance: memory.importance ?? 0.5,
      tags: memory.tags ?? [],
      embeddingStatus: memory.embeddingStatus ?? "pending",
    };
    inMemoryStore.memories.set(created.id, created);
    return created;
  }

  async upsertMemory(memory: MemoryNode) {
    inMemoryStore.memories.set(memory.id, memory);
    return memory;
  }

  async deleteMemory(userId: string, id: string) {
    const existing = inMemoryStore.memories.get(id);
    if (!existing || existing.userId !== userId) {
      return;
    }
    inMemoryStore.memories.delete(id);
    for (const edge of Array.from(inMemoryStore.edges.values())) {
      if (edge.userId !== userId) continue;
      if (edge.fromId === id || edge.toId === id) {
        inMemoryStore.edges.delete(edge.id);
      }
    }
  }

  async listEdges(userId: string) {
    return Array.from(inMemoryStore.edges.values()).filter(
      (edge) => edge.userId === userId,
    );
  }

  async upsertEdge(edge: MemoryEdge) {
    inMemoryStore.edges.set(edge.id, edge);
    return edge;
  }

  async deleteEdge(userId: string, id: string) {
    const existing = inMemoryStore.edges.get(id);
    if (!existing || existing.userId !== userId) return;
    inMemoryStore.edges.delete(id);
  }

  async searchMemories(userId: string, query: string, topK = 10) {
    const all = await this.listMemories(userId);
    const normalizedQuery = query.toLowerCase();
    const results = all
      .map((memory) => {
        const haystack = [
          memory.title ?? "",
          memory.summary ?? "",
          memory.content ?? "",
          memory.rawText ?? "",
          memory.tags.join(" "),
          memory.transcript ?? "",
        ]
          .join(" ")
          .toLowerCase();
        const score =
          haystack.includes(normalizedQuery) || normalizedQuery.length === 0
            ? 1
            : this.simpleSimilarity(normalizedQuery, haystack);
        return { memory, score };
      })
      .filter(({ score }) => score > 0.08)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return results;
  }

  private simpleSimilarity(query: string, haystack: string) {
    let matches = 0;
    const tokens = new Set(query.split(/\s+/g));
    for (const token of tokens) {
      if (haystack.includes(token)) {
        matches += 1;
      }
    }
    return matches / Math.max(tokens.size, 1);
  }
}

let repository: MemoryRepository | null = null;
let seeded = false;

function seedInMemoryRepository() {
  if (seeded) return;
  const demo = getDemoData();
  demo.memories.forEach((memory) => {
    inMemoryStore.memories.set(memory.id, memory);
  });
  demo.edges.forEach((edge) => {
    inMemoryStore.edges.set(edge.id, edge);
  });
  seeded = true;
}

export function getMemoryRepository(): MemoryRepository {
  if (repository) {
    return repository;
  }

  if (!serverEnv.DATABASE_URL) {
    seedInMemoryRepository();
    repository = new InMemoryRepository();
    return repository;
  }

  // TODO: Implement Prisma/Supabase-backed repository when database is configured.
  seedInMemoryRepository();
  repository = new InMemoryRepository();
  return repository;
}
