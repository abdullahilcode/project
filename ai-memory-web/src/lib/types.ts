export type MemoryKind = "text" | "voice" | "image" | "link" | "document";

export interface MemoryNode {
  id: string;
  userId: string;
  title: string;
  kind: MemoryKind;
  source?: "upload" | "recording" | "import" | "ai";
  summary: string;
  content: string;
  transcript?: string;
  tags: string[];
  sentiments?: Array<{ label: string; score: number }>;
  importance: number;
  createdAt: string;
  updatedAt: string;
  embeddingStatus: "pending" | "ready" | "failed";
  vectorId?: string;
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
  source: string;
  target: string;
  relationship: string;
  weight: number;
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
