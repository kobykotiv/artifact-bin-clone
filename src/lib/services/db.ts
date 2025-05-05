import { type IUser, type UserData } from "@/lib/models/User";
import { type IPrompt, type PromptData } from "@/lib/models/Prompt";

// Define interfaces for new entities
export interface ArtifactData {
  language: string;
  title: any;
  id: string;
  userId: string;
  folderId?: string; // Optional: if artifacts can belong to folders
  projectId?: string; // Optional: if artifacts can belong to projects
  name: string;
  content: string; // Simulate S3 blob storage
  fileType: string; // e.g., 'js', 'ts', 'json'
  tags: string[];
  voteRatio?: number; // Optional
  createdAt: string;
  updatedAt: string;
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

  async updatePrompt(id: string, updates: Partial<PromptData>): Promise<PromptData | null> {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      return null;
    }

    const updatedPrompt = {
      ...prompt,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: prompt.version + 1
    };

    this.prompts.set(id, updatedPrompt);
    await this.persist();
    return updatedPrompt;
  }

  async deletePrompt(id: string): Promise<boolean> {
    const result = this.prompts.delete(id);
    await this.persist();
    return result;
  }

  async getPrompt(id: string): Promise<PromptData | null> {
    return this.prompts.get(id) || null;
  }

  async getPromptsByUser(userId: string): Promise<PromptData[]> {
    return Array.from(this.prompts.values()).filter(prompt => prompt.userId === userId);
  }

  async getPublicPrompts(): Promise<PromptData[]> {
    return Array.from(this.prompts.values()).filter(prompt => prompt.isPublic);
  }

  async forkPrompt(promptId: string, userId: string): Promise<PromptData | null> {
    const prompt = this.prompts.get(promptId);
    if (!prompt) {
      return null;
    }

    const forkedPrompt: PromptData = {
      ...prompt,
      id: crypto.randomUUID(),
      userId,
      parentId: promptId,
      version: 1,
      performance: {
        successRate: 0,
        averageTokens: 0,
        totalUses: 0,
        lastUsed: new Date().toISOString(),
        averageResponseTime: 0,
        errorRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.prompts.set(forkedPrompt.id, forkedPrompt);
    await this.persist();
    return forkedPrompt;
  }

  async searchPrompts(query: string): Promise<PromptData[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.prompts.values()).filter(prompt => 
      prompt.isPublic && (
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    );
  }

  async updatePromptMetrics(prompt: PromptData, metrics: Partial<PromptData['performance']>): Promise<PromptData | null> {
    const existingPrompt = this.prompts.get(prompt.id);
    if (!existingPrompt) {
      return null;
    }

    const updatedPrompt = {
      ...existingPrompt,
      performance: {
        ...existingPrompt.performance,
        ...metrics,
        lastUsed: new Date().toISOString()
      }
    };

    this.prompts.set(prompt.id, updatedPrompt);
    await this.persist();
    return updatedPrompt;
  }

  // Artifact Operations
  async createArtifact(artifactData: Omit<ArtifactData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArtifactData> {
    const artifact: ArtifactData = {
      ...artifactData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.artifacts.set(artifact.id, artifact);
    await this.persist();
    return artifact;
  }

  async getArtifact(id: string): Promise<ArtifactData | null> {
    return this.artifacts.get(id) || null;
  }

  async getArtifactsByUser(userId: string): Promise<ArtifactData[]> {
    return Array.from(this.artifacts.values()).filter(artifact => artifact.userId === userId);
  }

  async getArtifactsByFolder(folderId: string): Promise<ArtifactData[]> {
    return Array.from(this.artifacts.values()).filter(artifact => artifact.folderId === folderId);
  }

  async getArtifactsByProject(projectId: string): Promise<ArtifactData[]> {
    return Array.from(this.artifacts.values()).filter(artifact => artifact.projectId === projectId);
  }

  async updateArtifact(id: string, updates: Partial<ArtifactData>): Promise<ArtifactData | null> {
    const artifact = this.artifacts.get(id);
    if (!artifact) return null;
    const updatedArtifact = { ...artifact, ...updates, updatedAt: new Date().toISOString() };
    this.artifacts.set(id, updatedArtifact);
    await this.persist();
    return updatedArtifact;
  }

  async saveArtifact(artifactData: ArtifactData): Promise<ArtifactData> {
    const existing = this.artifacts.get(artifactData.id);
    if (existing) {
      // Update existing artifact
      return await this.updateArtifact(artifactData.id, artifactData) as ArtifactData; // Cast needed as update can return null
    } else {
      // Create new artifact
      return await this.createArtifact(artifactData);
    }
  }

  async deleteArtifact(id: string): Promise<boolean> {
    const result = this.artifacts.delete(id);
    await this.persist();
    return result;
  }

  // Folder Operations
  async createFolder(folderData: Omit<FolderData, 'id' | 'createdAt' | 'updatedAt'>): Promise<FolderData> {
    const folder: FolderData = {
      ...folderData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.folders.set(folder.id, folder);
    await this.persist();
    return folder;
  }

  async getFolder(id: string): Promise<FolderData | null> {
    return this.folders.get(id) || null;
  }

  async getFoldersByUser(userId: string): Promise<FolderData[]> {
    return Array.from(this.folders.values()).filter(folder => folder.userId === userId);
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
    // Consider deleting artifacts within the folder or reassigning them
    const result = this.folders.delete(id);
    await this.persist();
    return result;
  }

  async moveArtifactToFolder(artifactId: string, folderId: string): Promise<ArtifactData | null> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) return null;
    
    artifact.folderId = folderId;
    artifact.updatedAt = new Date().toISOString();
    this.artifacts.set(artifactId, artifact);
    await this.persist();
    return artifact;
  }

  async shareFolder(folderId: string, userIdsToShare: string[]): Promise<FolderData | null> {
    const folder = this.folders.get(folderId);
    if (!folder) return null;
    
    folder.isShared = true;
    folder.sharedWith = [...new Set([...folder.sharedWith, ...userIdsToShare])];
    folder.updatedAt = new Date().toISOString();
    this.folders.set(folderId, folder);
    await this.persist();
    return folder;
  }

  // Enhanced folder methods
  async getFolderWithContents(folderId: string): Promise<{folder: FolderData, artifacts: ArtifactData[]}> {
    const folder = await this.getFolder(folderId);
    if (!folder) return { folder: null, artifacts: [] };
    
    const artifacts = await this.getArtifactsByFolder(folderId);
    return { folder, artifacts };
  }

  async moveArtifactsToFolder(artifactIds: string[], folderId: string): Promise<boolean> {
    try {
      for (const id of artifactIds) {
        const artifact = this.artifacts.get(id);
        if (artifact) {
          artifact.folderId = folderId;
          artifact.updatedAt = new Date().toISOString();
          this.artifacts.set(id, artifact);
        }
      }
      await this.persist();
      return true;
    } catch (error) {
      console.error('Failed to move artifacts:', error);
      return false;
    }
  }

  async shareFolderWithUsers(folderId: string, userEmails: string[]): Promise<string[]> {
    const folder = this.folders.get(folderId);
    if (!folder) return [];
    
    const sharedWith: string[] = [];
    for (const email of userEmails) {
      const user = await this.getUserByEmail(email);
      if (user) {
        // Create a folder reference for the recipient
        const sharedFolder: FolderData = {
          id: crypto.randomUUID(),
          userId: user.id,
          name: `Shared: ${folder.name}`,
          parentId: null,
          isShared: true,
          sharedWith: [],
          originalFolderId: folderId, // Reference to original
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.folders.set(sharedFolder.id, sharedFolder);
        sharedWith.push(user.id);
      }
    }
    
    folder.sharedWith = [...new Set([...folder.sharedWith, ...sharedWith])];
    this.folders.set(folderId, folder);
    await this.persist();
    
    return sharedWith;
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
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
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
    // Consider deleting artifacts/folders within the project or reassigning them
    const result = this.projects.delete(id);
    await this.persist();
    return result;
  }

  // Persistence
  private async persist(): Promise<void> {
    try {
      localStorage.setItem('users', JSON.stringify(Array.from(this.users.entries())));
      localStorage.setItem('prompts', JSON.stringify(Array.from(this.prompts.entries())));
      // Persist new entities
      localStorage.setItem('artifacts', JSON.stringify(Array.from(this.artifacts.entries())));
      localStorage.setItem('folders', JSON.stringify(Array.from(this.folders.entries())));
      localStorage.setItem('projects', JSON.stringify(Array.from(this.projects.entries())));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  async load(): Promise<void> {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
      // Load new entities
      const artifacts = JSON.parse(localStorage.getItem('artifacts') || '[]');
      const folders = JSON.parse(localStorage.getItem('folders') || '[]');
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');

      this.users = new Map(users);
      this.prompts = new Map(prompts);
      // Initialize maps for new entities
      this.artifacts = new Map(artifacts);
      this.folders = new Map(folders);
      this.projects = new Map(projects);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Add these methods to your dbService
  async getFoldersByParent(userId: string, parentFolderId?: string): Promise<FolderData[]> {
    // Implementation to fetch folders with the given parentFolderId
    return Array.from(this.folders.values()).filter(folder => folder.userId === userId && folder.parentId === parentFolderId);
  }

  async createFolder(folderData: Partial<FolderData>): Promise<FolderData> {
    // Implementation to create a new folder
    const folder: FolderData = {
      ...folderData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.folders.set(folder.id, folder);
    await this.persist();
    return folder;
  }

  async shareFolderByEmail(folderId: string, email: string): Promise<void> {
    // Implementation to share a folder with a user by email
    const folder = this.folders.get(folderId);
    if (!folder) return;
    
    const user = await this.getUserByEmail(email);
    if (!user) return;
    
    folder.isShared = true;
    folder.sharedWith = [...new Set([...folder.sharedWith, user.id])];
    folder.updatedAt = new Date().toISOString();
    this.folders.set(folderId, folder);
    await this.persist();
  }
}

export const dbService = new DBService();
