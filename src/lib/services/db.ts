import { type IUser, type UserData } from "@/lib/models/User";
import { type IPrompt, type PromptData } from "@/lib/models/Prompt";

// Define interfaces for new entities
export interface ArtifactData {
  id: string;
  userId: string;
  title: string;
  type: string;
  content: string;
  language?: string;
  folderId?: string;
  metadata?: any;
  avatarSeed?: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // <-- Add tags field
}

export interface FolderData {
  id: string;
  userId: string;
  parentId?: string; // For nested folders
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Simulated database with localStorage for persistence
class DBService {
  private users: Map<string, UserData> = new Map();
  private prompts: Map<string, PromptData> = new Map();
  // Add maps for new entities
  private artifacts: Map<string, ArtifactData> = new Map();
  private folders: Map<string, FolderData> = new Map();
  private projects: Map<string, ProjectData> = new Map();

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

  async getArtifactsByUser(userId: string): Promise<ArtifactData[]> {
    return Array.from(this.artifacts.values()).filter(a => a.userId === userId);
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
  async createProject(projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectData> {
    const project: ProjectData = {
      ...projectData,
      id: crypto.randomUUID(),
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

  // Persistence
  private async persist() {
    try {
      localStorage.setItem('db_users', JSON.stringify(Array.from(this.users.entries())));
      localStorage.setItem('db_prompts', JSON.stringify(Array.from(this.prompts.entries())));
      localStorage.setItem('db_artifacts', JSON.stringify(Array.from(this.artifacts.entries())));
      localStorage.setItem('db_folders', JSON.stringify(Array.from(this.folders.entries())));
      localStorage.setItem('db_projects', JSON.stringify(Array.from(this.projects.entries())));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  private async load() {
    try {
      const usersData = localStorage.getItem('db_users');
      if (usersData) {
        this.users = new Map(JSON.parse(usersData));
      }

      const promptsData = localStorage.getItem('db_prompts');
      if (promptsData) {
        this.prompts = new Map(JSON.parse(promptsData));
      }

      const artifactsData = localStorage.getItem('db_artifacts');
      if (artifactsData) {
        this.artifacts = new Map(JSON.parse(artifactsData));
      }

      const foldersData = localStorage.getItem('db_folders');
      if (foldersData) {
        this.folders = new Map(JSON.parse(foldersData));
      }

      const projectsData = localStorage.getItem('db_projects');
      if (projectsData) {
        this.projects = new Map(JSON.parse(projectsData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Initialize with empty maps if loading fails
      this.users = new Map();
      this.prompts = new Map();
      this.artifacts = new Map();
      this.folders = new Map();
      this.projects = new Map();
    }
  }
}

export const dbService = new DBService();
