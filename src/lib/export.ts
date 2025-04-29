import JSZip from 'jszip';
import { Artifact, getAllArtifacts, saveArtifact } from './db';

/**
 * Exports all artifacts to a zip file and triggers download
 */
export const exportArtifacts = async (): Promise<void> => {
  try {
    // Get all artifacts from the database
    const artifacts = await getAllArtifacts();
    if (artifacts.length === 0) {
      throw new Error('No artifacts to export');
    }

    const zip = new JSZip();
    
    // Add metadata file with version info
    const metadata = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      count: artifacts.length
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));
    
    // Add all artifacts as a single JSON file for easy import
    zip.file('artifacts.json', JSON.stringify(artifacts, null, 2));
    
    // Also add individual files for each artifact in a subfolder for browsability
    const artifactsFolder = zip.folder('snippets');
    if (!artifactsFolder) {
      throw new Error('Failed to create snippets folder');
    }
    
    artifacts.forEach(artifact => {
      const filename = `${artifact.title || 'untitled'}-${artifact.id.slice(0, 8)}.${artifact.language}`;
      const safeFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
      artifactsFolder.file(safeFilename, artifact.code);
    });
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create a download link and trigger download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artifact-bin-export-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

/**
 * Imports artifacts from a zip file
 */
export const importArtifacts = async (file: File): Promise<{ imported: number; total: number }> => {
  try {
    // Load the zip file
    const zipContent = await JSZip.loadAsync(file);
    
    // First, try to find and read artifacts.json
    const artifactsFile = zipContent.file('artifacts.json');
    if (!artifactsFile) {
      throw new Error('Invalid export file: Missing artifacts.json');
    }
    
    // Parse the artifacts
    const artifactsJson = await artifactsFile.async('text');
    const artifacts = JSON.parse(artifactsJson) as Partial<Artifact>[]; // Use Partial<Artifact>
    
    if (!Array.isArray(artifacts)) {
      throw new Error('Invalid artifacts format');
    }
    
    // Import each artifact
    let successCount = 0;
    for (const partialArtifact of artifacts) {
      // Validate minimum required fields
      if (!partialArtifact.id || typeof partialArtifact.code !== 'string') {
        console.warn('Skipping invalid artifact data:', partialArtifact.id);
        continue;
      }
      
      // Ensure all required fields have valid values, generate avatarSeed if missing
      const normalizedArtifact: Artifact = {
        id: partialArtifact.id,
        title: partialArtifact.title || 'Imported Artifact',
        language: partialArtifact.language || 'plain',
        code: partialArtifact.code,
        createdAt: partialArtifact.createdAt || new Date().toISOString(),
        updatedAt: partialArtifact.updatedAt || new Date().toISOString(),
        avatarSeed: partialArtifact.avatarSeed || crypto.randomUUID(), // Generate seed if missing
      };
      
      await saveArtifact(normalizedArtifact);
      successCount++;
    }
    
    return {
      imported: successCount,
      total: artifacts.length
    };
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};
