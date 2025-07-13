import { type UserData } from "@/lib/models/User";
import { type PromptData } from "@/lib/models/Prompt";
import { type ReviewData } from "@/lib/models/Review";
import { type ArtifactData } from "@/lib/models/Artifact";
import { type FolderData } from "@/lib/models/Folder";
import { type ProjectData } from "@/lib/models/Project";
export type { ArtifactData };

// --- FORK OPERATIONS ---
interface ForkData {
  id: string;
  artifactId: string;
  userId: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
}

// Simulated database with localStorage for persistence
class DBService {
  private users: Map<string, UserData> = new Map();
  private prompts: Map<string, PromptData> = new Map();
  // Add maps for new entities
  private artifacts: Map<string, ArtifactData> = new Map();
  private folders: Map<string, FolderData> = new Map();
  private projects: Map<string, ProjectData> = new Map();
  private reviews: Map<string, ReviewData> = new Map();
  private forks: Map<string, ForkData[]> = new Map(); // artifactId -> ForkData[]

  constructor() {
    this.load(); // Load data on initialization
  }

  // User Operations
  async createUser(userData: UserData): Promise<UserData> {
    const user = {
      ...userData,
      id: userData.id || crypto.randomUUID(),
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(user.id, user);
    await this.persist();
    return user;
  }

  async getUser(id: string): Promise<UserData | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async updateUser(id: string, updates: Partial<UserData>): Promise<UserData | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    // Prevent changing ID or createdAt
    const { id: _, createdAt: __, ...safeUpdates } = updates;

    const updatedUser: UserData = {
      ...user,
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    await this.persist();
    return updatedUser;
  }

  // Prompt Operations
  async createPrompt(promptData: Partial<PromptData>): Promise<PromptData> {
    if (!promptData.userId) {
      throw new Error('User ID is required');
    }

    const prompt: PromptData = {
      id: crypto.randomUUID(),
      title: promptData.title || '',
      description: promptData.description || '',
      promptText: promptData.promptText || '',
      systemPrompt: promptData.systemPrompt,
      context: promptData.context,
      tags: promptData.tags || [],
      category: promptData.category || 'Other',
      metadata: promptData.metadata || {
        llm: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1
      },
      performance: {
        successRate: 0,
        averageTokens: 0,
        totalUses: 0,
        lastUsed: new Date().toISOString(),
        averageResponseTime: 0,
        errorRate: 0
      },
      version: 1,
      userId: promptData.userId,
      isPublic: promptData.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.prompts.set(prompt.id, prompt);
    await this.persist();
    return prompt;
  }

  async getPrompt(id: string): Promise<PromptData | null> {
    return this.prompts.get(id) || null;
  }

  async getAllPrompts(): Promise<PromptData[]> {
    return Array.from(this.prompts.values());
  }

  async updatePrompt(id: string, updates: Partial<PromptData>): Promise<PromptData | null> {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      return null;
    }

    const updatedPrompt = { ...prompt, ...updates, updatedAt: new Date().toISOString() };
    this.prompts.set(id, updatedPrompt);
    await this.persist();
    return updatedPrompt;
  }

  async deletePrompt(id: string): Promise<boolean> {
    const deleted = this.prompts.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  // Review Operations
  async createReview(reviewData: Omit<ReviewData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReviewData> {
    const now = new Date().toISOString();
    const review: ReviewData = {
      id: crypto.randomUUID(),
      ...reviewData,
      createdAt: now,
      updatedAt: now,
    };
    this.reviews.set(review.id, review);
    await this.persist();
    return review;
  }

  async getReviewsForArtifact(artifactId: string): Promise<ReviewData[]> {
    return Array.from(this.reviews.values()).filter(review => review.artifactId === artifactId);
  }

  async updateReview(id: string, updates: Partial<Omit<ReviewData, 'id' | 'createdAt' | 'artifactId' | 'userId'>>): Promise<ReviewData | null> {
    const review = this.reviews.get(id);
    if (!review) {
      return null;
    }
    const updatedReview = { ...review, ...updates, updatedAt: new Date().toISOString() };
    this.reviews.set(id, updatedReview);
    await this.persist();
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    const deleted = this.reviews.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  // Artifact Operations
  async createArtifact(artifactData: Partial<ArtifactData>): Promise<ArtifactData> {
    if (!artifactData.userId) {
      throw new Error('User ID is required');
    }

    const now = new Date().toISOString();
    const artifact: ArtifactData = {
      id: crypto.randomUUID(),
      title: artifactData.title || 'Untitled Artifact',
      type: artifactData.type || 'text',
      content: artifactData.content || '',
      language: artifactData.language || 'plaintext',
      userId: artifactData.userId,
      folderId: artifactData.folderId,
      metadata: artifactData.metadata || {},
      createdAt: now,
      updatedAt: now,
      ...artifactData,
    };

    this.artifacts.set(artifact.id, artifact);
    await this.persist();
    return artifact;
  }

  async getArtifact(id: string): Promise<ArtifactData | null> {
    return this.artifacts.get(id) || null;
  }

  async getAllArtifacts(): Promise<ArtifactData[]> {
    return Array.from(this.artifacts.values());
  }

  async updateArtifact(id: string, updates: Partial<ArtifactData>): Promise<ArtifactData | null> {
    const artifact = this.artifacts.get(id);
    if (!artifact) {
      return null;
    }

    const updatedArtifact = {
      ...artifact,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.artifacts.set(id, updatedArtifact);
    await this.persist();
    return updatedArtifact;
  }

  async deleteArtifact(id: string): Promise<boolean> {
    const deleted = this.artifacts.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  // Folder Operations
  async createFolder(folderData: Partial<FolderData>): Promise<FolderData> {
    if (!folderData.userId) {
      throw new Error('User ID is required');
    }
    const now = new Date().toISOString();
    const folder: FolderData = {
      id: crypto.randomUUID(),
      userId: folderData.userId,
      name: folderData.name || 'New Folder',
      parentId: folderData.parentId,
      createdAt: now,
      updatedAt: now,
    };

    this.folders.set(folder.id, folder);
    await this.persist();
    return folder;
  }

  async getFolder(id: string): Promise<FolderData | null> {
    return this.folders.get(id) || null;
  }

  async getFoldersByUser(userId: string): Promise<FolderData[]> {
    return Array.from(this.folders.values()).filter(f => f.userId === userId);
  }

  async updateFolder(id: string, updates: Partial<FolderData>): Promise<FolderData | null> {
    const folder = this.folders.get(id);
    if (!folder) return null;
    const updatedFolder = { ...folder, ...updates, updatedAt: new Date().toISOString() };
    this.folders.set(id, updatedFolder);
    await this.persist();
    return updatedFolder;
  }

  async deleteFolder(id: string): Promise<boolean> {
    // Also handle moving artifacts from the deleted folder
    const artifactsInFolder = Array.from(this.artifacts.values()).filter(a => a.folderId === id);
    for (const artifact of artifactsInFolder) {
      artifact.folderId = undefined;
      this.artifacts.set(artifact.id, artifact);
    }

    const deleted = this.folders.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  // Project Operations
  async createProject(projectData: Partial<ProjectData>): Promise<ProjectData> {
    if (!projectData.userId) {
      throw new Error("User ID is required for creating a project.");
    }
    const project: ProjectData = {
      id: crypto.randomUUID(),
      userId: projectData.userId,
      name: projectData.name || "Untitled Project",
      description: projectData.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.set(project.id, project);
    await this.persist();
    return project;
  }

  async getProject(id: string): Promise<ProjectData | null> {
    return this.projects.get(id) || null;
  }

  async getProjectsByUser(userId: string): Promise<ProjectData[]> {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  async updateProject(id: string, updates: Partial<ProjectData>): Promise<ProjectData | null> {
    const project = this.projects.get(id);
    if (!project) return null;
    const updatedProject = { ...project, ...updates, updatedAt: new Date().toISOString() };
    this.projects.set(id, updatedProject);
    await this.persist();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = this.projects.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  // Fork Operations
  async createFork(fork: Omit<ForkData, 'id' | 'createdAt'>): Promise<ForkData> {
    const newFork: ForkData = {
      ...fork,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const arr = this.forks.get(fork.artifactId) || [];
    arr.push(newFork);
    this.forks.set(fork.artifactId, arr);
    await this.persist();
    return newFork;
  }

  async getForksByArtifact(artifactId: string): Promise<ForkData[]> {
    return (this.forks.get(artifactId) || []);
  }

  async getPublicForksByArtifact(artifactId: string): Promise<ForkData[]> {
    return (this.forks.get(artifactId) || []).filter(f => f.isPublic);
  }

  // Persistence
  private async persist() {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        prompts: Array.from(this.prompts.entries()),
        artifacts: Array.from(this.artifacts.entries()),
        folders: Array.from(this.folders.entries()),
        projects: Array.from(this.projects.entries()),
        reviews: Array.from(this.reviews.entries()),
        forks: Array.from(this.forks.entries()),
      };
      localStorage.setItem('db', JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  private async load() {
    try {
      const data = localStorage.getItem('db');
      if (data) {
        const parsedData = JSON.parse(data);
        this.users = new Map(parsedData.users || []);
        this.prompts = new Map(parsedData.prompts || []);
        this.artifacts = new Map(parsedData.artifacts || []);
        this.folders = new Map(parsedData.folders || []);
        this.projects = new Map(parsedData.projects || []);
        this.reviews = new Map(parsedData.reviews || []);
        this.forks = new Map(parsedData.forks || []);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    }
  }
}

export const dbService = new DBService();
