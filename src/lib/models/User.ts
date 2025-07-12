// src/lib/models/User.ts

export interface IUser {
  id: string;
  email: string;
  passwordHash?: string; // Optional for guest/OAuth users
  role: 'user' | 'admin' | 'guest';
  avatarSeed?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  isAnonymous?: boolean;
  // Add more fields as needed
  skills?: string[];
  interests?: string[];
  preferredLLMs?: string[];
  promptEngineering?: {
    totalPrompts: number;
    successfulPrompts: number;
    challengesWon: number;
    reputation: number;
  };
  contributions?: {
    totalContributions: number;
    artifacts: number;
    codeReviews: number;
    documentation: number;
    promptEngineering: number;
  };
  knowledgeGraph?: {
    nodes: any[];
    edges: any[];
  };
}

// Alias for compatibility with dbService
export type UserData = IUser;
