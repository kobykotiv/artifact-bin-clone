import { type ArtifactData } from '@/lib/services/db';
import { jsPDF } from 'jspdf';
import { getCodeExample } from './codeExamples';

export async function exportToMarkdown(artifacts: ArtifactData[]): Promise<string> {
  const content = artifacts.map(artifact => {
    let markdown = `# ${artifact.title}\n\n`;
    
    // Add metadata
    markdown += `- Type: ${artifact.language}\n`;
    markdown += `- Created: ${new Date(artifact.createdAt).toLocaleDateString()}\n`;
    markdown += `- Tags: ${artifact.tags.join(', ')}\n\n`;
    
    // Add content based on type
    if (artifact.language === 'project-spec') {
      try {
        const data = JSON.parse(artifact.content || '{}');
        markdown += `## Content\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n`;
      } catch {
        markdown += artifact.content;
      }
    } else {
      markdown += `\`\`\`${artifact.language}\n${artifact.content}\n\`\`\`\n`;
    }
    
    markdown += '\n---\n\n';
    return markdown;
  }).join('\n');
  
  return content;
}

export async function exportToPDF(artifacts: ArtifactData[]): Promise<Uint8Array> {
  // Convert to PDF format in memory
  const content = await exportToMarkdown(artifacts);
  // For now, return a simple Uint8Array of the markdown
  // You can add proper PDF conversion later
  return new TextEncoder().encode(content);
}
