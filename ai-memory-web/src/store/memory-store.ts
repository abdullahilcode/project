"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  MemoryChatMessage,
  MemoryEdge,
  MemoryInsight,
  MemoryNode,
  MemoryStoreState,
} from "@/lib/types";

export interface MemoryStoreActions {
  hydrate: (payload: Partial<MemoryStoreState>) => void;
  upsertMemory: (memory: MemoryNode) => void;
  upsertMemories: (memories: MemoryNode[]) => void;
  removeMemory: (memoryId: string) => void;
  linkMemories: (edge: MemoryEdge) => void;
  unlinkMemories: (edgeId: string) => void;
  setInsights: (insights: MemoryInsight[]) => void;
  setSelectedMemory: (memoryId?: string) => void;
  appendChatMessage: (message: MemoryChatMessage) => void;
  patchChatMessage: (
    messageId: string,
    patch: Partial<MemoryChatMessage>,
  ) => void;
  resetChat: () => void;
  setSyncing: (isSyncing: boolean) => void;
}

const initialState: MemoryStoreState = {
  memories: {},
  edges: [],
  insights: [],
  chatHistory: [],
  selectedMemoryId: undefined,
  isSyncing: false,
  lastSyncedAt: undefined,
};

export const useMemoryStore = create<MemoryStoreState & MemoryStoreActions>()(
  devtools(
    (set) => ({
      ...initialState,
      hydrate: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
          memories: {
            ...state.memories,
            ...(payload.memories ?? {}),
          },
          edges: payload.edges ?? state.edges,
          insights: payload.insights ?? state.insights,
          chatHistory: payload.chatHistory ?? state.chatHistory,
          lastSyncedAt: new Date().toISOString(),
        })),
      upsertMemory: (memory) =>
        set((state) => ({
          memories: {
            ...state.memories,
            [memory.id]: memory,
          },
        })),
      upsertMemories: (memories) =>
        set((state) => {
          const mapped = { ...state.memories };
          for (const memory of memories) {
            mapped[memory.id] = memory;
          }
          return { memories: mapped };
        }),
        removeMemory: (memoryId) =>
          set((state) => {
            const { [memoryId]: _removed, ...rest } = state.memories;
            void _removed;
            return {
              memories: rest,
              edges: state.edges.filter(
                (edge) => edge.source !== memoryId && edge.target !== memoryId,
              ),
              chatHistory: state.chatHistory.map((message) => ({
                ...message,
                memoryReferences: message.memoryReferences?.filter(
                  (id) => id !== memoryId,
                ),
              })),
              selectedMemoryId:
                state.selectedMemoryId === memoryId
                  ? undefined
                  : state.selectedMemoryId,
            };
          }),
      linkMemories: (edge) =>
        set((state) => {
          const existing = state.edges.find((item) => item.id === edge.id);
          if (existing) {
            return {
              edges: state.edges.map((item) =>
                item.id === edge.id ? { ...item, ...edge } : item,
              ),
            };
          }
          return { edges: [...state.edges, edge] };
        }),
      unlinkMemories: (edgeId) =>
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== edgeId),
        })),
      setInsights: (insights) => set({ insights }),
      setSelectedMemory: (memoryId) => set({ selectedMemoryId: memoryId }),
      appendChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),
      patchChatMessage: (messageId, patch) =>
        set((state) => ({
          chatHistory: state.chatHistory.map((message) =>
            message.id === messageId ? { ...message, ...patch } : message,
          ),
        })),
      resetChat: () => set({ chatHistory: [] }),
      setSyncing: (isSyncing) =>
        set({
          isSyncing,
          lastSyncedAt: !isSyncing ? new Date().toISOString() : undefined,
        }),
    }),
    { name: "ai-memory-store" },
  ),
);

export const useMemories = () =>
  useMemoryStore((state) => Object.values(state.memories));

export const useMemoryById = (memoryId?: string) =>
  useMemoryStore((state) =>
    memoryId ? state.memories[memoryId] : undefined,
  );

export const useEdges = () => useMemoryStore((state) => state.edges);

export const useChatHistory = () =>
  useMemoryStore((state) => state.chatHistory);
