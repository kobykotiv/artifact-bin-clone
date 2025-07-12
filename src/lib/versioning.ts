import { dbService, type ArtifactData } from '@/lib/services/db';

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  content: string;
  createdAt: string;
  commitMessage?: string;
}

class VersioningService {
  private versions: Map<string, ArtifactVersion[]> = new Map();

  constructor() {
    this.load();
  }

  async createVersion(artifactId: string, content: string, commitMessage?: string): Promise<ArtifactVersion> {
    const newVersion: ArtifactVersion = {
      id: crypto.randomUUID(),
      artifactId,
      content,
      commitMessage,
      createdAt: new Date().toISOString(),
    };

    const artifactVersions = this.versions.get(artifactId) || [];
    // Keep the most recent versions at the top
    artifactVersions.unshift(newVersion);
    this.versions.set(artifactId, artifactVersions);

    await this.persist();
    return newVersion;
  }

  async getVersions(artifactId: string): Promise<ArtifactVersion[]> {
    return this.versions.get(artifactId) || [];
  }

  async getVersion(artifactId: string, versionId: string): Promise<ArtifactVersion | null> {
    const versions = this.versions.get(artifactId) || [];
    return versions.find(v => v.id === versionId) || null;
  }

  private async persist() {
    localStorage.setItem('db_versions', JSON.stringify(Array.from(this.versions.entries())));
  }

  private async load() {
    try {
      const versionsData = localStorage.getItem('db_versions');
      if (versionsData) {
        this.versions = new Map(JSON.parse(versionsData));
      }
    } catch (error) {
      console.error("Failed to load version data from localStorage", error);
      this.versions = new Map();
    }
  }
}

export const versioningService = new VersioningService();

/**
 * A wrapper function to update an artifact and automatically create a new version.
 * This should be used instead of dbService.updateArtifact directly when versioning is desired.
 */
export async function updateArtifactAndCreateVersion(
  id: string,
  updates: Partial<ArtifactData>,
  commitMessage?: string
): Promise<ArtifactData | null> {
  const updatedArtifact = await dbService.updateArtifact(id, updates);
  if (updatedArtifact) {
    // Create a version only if the content has changed.
    const currentVersion = (await versioningService.getVersions(id))[0];
    if (!currentVersion || currentVersion.content !== updatedArtifact.content) {
      await versioningService.createVersion(id, updatedArtifact.content, commitMessage);
    }
  }
  return updatedArtifact;
}
