// src/lib/models/Prompt.ts

export interface IPrompt {
  id: string;
  userId: string;
  title: string;
  description?: string;
  promptText: string;
  systemPrompt?: string;
  context?: string;
  tags: string[];
  category: string;
  metadata?: any;
  performance?: {
    successRate: number;
    averageTokens: number;
    totalUses: number;
    lastUsed: string;
    averageResponseTime: number;
    errorRate: number;
  };
  version: number;
  isPublic: boolean;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias for compatibility with dbService
export type PromptData = IPrompt;
