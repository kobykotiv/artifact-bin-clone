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
        const data = JSON.parse(artifact.content);
        markdown += `## Content\n\n`;
        markdown += `${JSON.stringify(data, null, 2)}\n\n`;
      } catch (e) {
        markdown += artifact.content;
      }
    } else {
      markdown += `## Your Code\n\n`;
      markdown += `\`\`\`${artifact.language}\n${artifact.content}\n\`\`\`\n\n`;
      
      // Add example if available
      const example = getCodeExample(artifact.language);
      if (example) {
        markdown += `## Example Todo App in ${artifact.language}\n\n`;
        markdown += `\`\`\`${artifact.language}\n${example}\n\`\`\`\n`;
      }
    }
    
    markdown += '\n---\n\n';
    return markdown;
  }).join('\n');
  
  return content;
}

export async function exportToPDF(artifacts: ArtifactData[]): Promise<Uint8Array> {
  const doc = new jsPDF();
  let y = 20;
  
  artifacts.forEach((artifact, index) => {
    if (index > 0) {
      doc.addPage();
      y = 20;
    }
    
    // Add title
    doc.setFontSize(24);
    doc.text(artifact.title, 20, y);
    y += 15;
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Type: ${artifact.language}`, 20, y);
    y += 8;
    doc.text(`Created: ${new Date(artifact.createdAt).toLocaleDateString()}`, 20, y);
    y += 8;
    doc.text(`Tags: ${artifact.tags.join(', ')}`, 20, y);
    y += 15;
    
    // Add content
    doc.setFontSize(11);
    const content = artifact.language === 'project-spec' 
      ? JSON.stringify(JSON.parse(artifact.content), null, 2)
      : artifact.content;
      
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, 20, y);
  });
  
  return doc.output('arraybuffer');
}
