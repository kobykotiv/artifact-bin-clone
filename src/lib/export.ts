import JSZip from 'jszip';
import { type ArtifactData, dbService } from '@/lib/services/db';
import pdfMake from 'pdfmake/build/pdfmake';
import { type TDocumentDefinitions } from 'pdfmake/interfaces';
import htmlToPdfmake from 'html-to-pdfmake';

// We need to load the default fonts
pdfMake.fonts = {
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
  }
};

/**
 * Exports an artifact to a PDF file
 */
export const exportArtifactToPDF = async (artifact: ArtifactData, contentWindow?: Window | null): Promise<void> => {
  try {
    let content: any[];

    if (contentWindow) {
      // If a content window is provided (from an iframe), use its content
      const html = contentWindow.document.body.innerHTML;
      content = [
        { text: artifact.title || 'Untitled Artifact', style: 'header' },
        { text: `Type: ${artifact.type} (${artifact.language})`, style: 'meta', margin: [0, 0, 0, 20] },
        htmlToPdfmake(html)
      ];
    } else {
      // Fallback to original code export if no preview window
      content = [
        { text: artifact.title || 'Untitled Artifact', style: 'header' },
        { text: `Created: ${new Date(artifact.createdAt).toLocaleString()}`, style: 'meta' },
        { text: `Updated: ${new Date(artifact.updatedAt).toLocaleString()}`, style: 'meta' },
        { text: `Language: ${artifact.language}`, style: 'meta', margin: [0, 0, 0, 20] },
        { text: 'Content:', style: 'subheader' },
        { text: artifact.content, style: 'code' }
      ];
    }

    const docDefinition: TDocumentDefinitions = {
      content,
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        meta: {
          fontSize: 12,
          color: '#666'
        },
        code: {
          font: 'Roboto',
          fontSize: 12,
          margin: [0, 5, 0, 15],
          preserveLeadingSpaces: true
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.download(`${artifact.title || 'artifact'}-${artifact.id.slice(0, 8)}.pdf`);
  } catch (error) {
    console.error('PDF Export failed:', error);
    throw error;
  }
};

/**
 * Exports all artifacts to a zip file and triggers download
 */
export const exportArtifacts = async (): Promise<void> => {
  try {
    // Get all artifacts from the database
    const artifacts = await dbService.getAllArtifacts();
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
      artifactsFolder.file(safeFilename, artifact.content);
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
 * Imports artifacts from a JSON file.
 * @param file The JSON file to import.
 */
export const importArtifacts = async (file: File): Promise<void> => {
  try {
    const artifactsJson = await file.text();
    const artifacts = JSON.parse(artifactsJson) as Partial<ArtifactData>[];

    for (const artifact of artifacts) {
      if (!artifact.userId) {
        // Assign to a default user or handle as an error
        console.warn('Artifact is missing userId, skipping:', artifact.title);
        continue;
      }
      // Ensure essential fields are present
      const normalizedArtifact: Omit<ArtifactData, 'id'> = {
        userId: artifact.userId,
        title: artifact.title || 'Untitled Imported Artifact',
        type: artifact.type || 'text',
        content: artifact.content || '',
        language: artifact.language || 'plaintext',
        createdAt: artifact.createdAt || new Date().toISOString(),
        updatedAt: artifact.updatedAt || new Date().toISOString(),
        folderId: artifact.folderId,
        metadata: artifact.metadata || {},
        avatarSeed: artifact.avatarSeed,
        code: artifact.code,
      };
      await dbService.createArtifact(normalizedArtifact);
    }
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};
