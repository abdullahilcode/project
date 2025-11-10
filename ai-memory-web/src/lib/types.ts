export type MemoryKind = "text" | "voice" | "image" | "link" | "document";

export interface MemoryNode {
  id: string;
  userId: string;
  title?: string | null;
  kind: MemoryKind;
  source?: "upload" | "recording" | "import" | "ai";
  summary?: string | null;
  rawText?: string | null;
  content?: string | null;
  transcript?: string | null;
  tags: string[];
  space?: string | null;
  sentiments?: Array<{ label: string; score: number }>;
  importance?: number;
  createdAt: string;
  updatedAt: string;
  embeddingStatus: "pending" | "ready" | "failed";
  vectorId?: string;
  embedding?: number[] | null;
  linkPreviews?: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
  }>;
  media?: {
    url?: string;
    thumbnailUrl?: string;
    durationMs?: number;
    mimeType?: string;
    sizeBytes?: number;
  };
  encryption?: {
    encrypted: boolean;
    scheme?: "aes-256-gcm";
    keyVersion?: string;
  };
}

export interface MemoryEdge {
  id: string;
  userId: string;
  fromId: string;
  toId: string;
  relationship: string;
  strength: number;
  createdAt: string;
}

export interface MemorySearchResult {
  memory: MemoryNode;
  score: number;
  highlights?: string[];
}

export interface MemoryInsight {
  id: string;
  title: string;
  body: string;
  type: "cluster" | "trend" | "anomaly" | "reflection";
  relatedMemoryIds: string[];
  createdAt: string;
}

export interface MemoryChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  memoryReferences?: string[];
  createdAt: string;
  streaming?: boolean;
}

export interface MemoryStoreState {
  memories: Record<string, MemoryNode>;
  edges: MemoryEdge[];
  insights: MemoryInsight[];
  chatHistory: MemoryChatMessage[];
  selectedMemoryId?: string;
  isSyncing: boolean;
  lastSyncedAt?: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface MemoryTag {
  memoryId: string;
  tagId: string;
}
