import { randomUUID } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { getDemoData } from "@/lib/demo-data";
import type { MemoryEdge, MemoryNode, MemorySearchResult } from "@/lib/types";

export interface MemoryRepository {
  listMemories(): Promise<MemoryNode[]>;
  getMemoryById(id: string): Promise<MemoryNode | null>;
  createMemory(memory: Omit<MemoryNode, "id" | "createdAt" | "updatedAt">): Promise<MemoryNode>;
  upsertMemory(memory: MemoryNode): Promise<MemoryNode>;
  deleteMemory(id: string): Promise<void>;
  listEdges(): Promise<MemoryEdge[]>;
  upsertEdge(edge: MemoryEdge): Promise<MemoryEdge>;
  deleteEdge(id: string): Promise<void>;
  searchMemories(query: string, topK?: number): Promise<MemorySearchResult[]>;
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
  async listMemories() {
    return Array.from(inMemoryStore.memories.values()).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    );
  }

  async getMemoryById(id: string) {
    return inMemoryStore.memories.get(id) ?? null;
  }

  async createMemory(
    memory: Omit<MemoryNode, "id" | "createdAt" | "updatedAt">,
  ) {
    const now = new Date().toISOString();
    const created: MemoryNode = {
      ...memory,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    inMemoryStore.memories.set(created.id, created);
    return created;
  }

  async upsertMemory(memory: MemoryNode) {
    inMemoryStore.memories.set(memory.id, memory);
    return memory;
  }

  async deleteMemory(id: string) {
    inMemoryStore.memories.delete(id);
    for (const edge of inMemoryStore.edges.values()) {
      if (edge.source === id || edge.target === id) {
        inMemoryStore.edges.delete(edge.id);
      }
    }
  }

  async listEdges() {
    return Array.from(inMemoryStore.edges.values());
  }

  async upsertEdge(edge: MemoryEdge) {
    inMemoryStore.edges.set(edge.id, edge);
    return edge;
  }

  async deleteEdge(id: string) {
    inMemoryStore.edges.delete(id);
  }

  async searchMemories(query: string, topK = 10) {
    const all = await this.listMemories();
    const normalizedQuery = query.toLowerCase();
    const results = all
      .map((memory) => {
        const haystack = [
          memory.title,
          memory.summary,
          memory.content,
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

export function getMemoryRepository(): MemoryRepository {
  if (repository) {
    return repository;
  }

  if (!serverEnv.DATABASE_URL) {
    repository = new InMemoryRepository();
    if (!seeded) {
      const demo = getDemoData();
      demo.memories.forEach((memory) => {
        void repository?.upsertMemory(memory);
      });
      demo.edges.forEach((edge) => {
        void repository?.upsertEdge(edge);
      });
      seeded = true;
    }
    return repository;
  }

  // TODO: Implement Prisma/Supabase-backed repository when database is configured.
  repository = new InMemoryRepository();
  return repository;
}
