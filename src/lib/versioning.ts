import { ArtifactData } from '@/lib/services/db';

export interface VersionRecord {
  versionId: string;
  timestamp: string;
  changes: string;
  userId: string;
  artifactId: string;
  contentSnapshot: string;
}

/**
 * Semantic versioning helper for artifacts
 */
export function generateVersion(
  artifact: ArtifactData,
  changeType: 'major' | 'minor' | 'patch',
  currentVersion?: string
): string {
  // Parse current version or start at 0.1.0
  let [major, minor, patch] = (currentVersion || '0.1.0')
    .split('.')
    .map(v => parseInt(v, 10));

  // Increment based on change type
  if (changeType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (changeType === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Create a version record for an artifact change
 */
export function createVersionRecord(
  artifact: ArtifactData,
  userId: string,
  changeDescription: string
): VersionRecord {
  return {
    versionId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    changes: changeDescription,
    userId,
    artifactId: artifact.id,
    contentSnapshot: artifact.content
  };
}
