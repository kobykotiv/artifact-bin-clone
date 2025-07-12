import React, { useEffect, useRef, useState } from 'react';
// Use ArtifactData type from db service for consistency
import { type ArtifactData } from '@/lib/services/db';
import { AlertCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportArtifactToPDF } from '@/lib/export'; // Assuming this utility exists and works with ArtifactData

// Define a constant for the project generator language type
const PROJECT_SPEC_LANG = 'project-spec'; // Updated identifier

interface ArtifactPreviewProps {
  artifact: ArtifactData; // Use ArtifactData type
  isVisible: boolean;
}

export function ArtifactPreview({ artifact, isVisible }: ArtifactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePreviewHTML = (artifact: ArtifactData): string => {
    if (artifact.type === 'html' || artifact.language === 'html') {
      // For multi-file web artifacts, we need to combine them
      // This assumes a convention where `content` is HTML, and you might have
      // associated `css` and `javascript` properties.
      // This part needs to be adapted based on how you actually store related files.
      // For now, let's assume a simple structure on the artifact object.
      const css = (artifact.metadata as any)?.css || '';
      const js = (artifact.metadata as any)?.javascript || '';
      
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${artifact.content}
            <script>${js}</script>
          </body>
        </html>
      `;
    }

    const baseStyle = `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 1rem; line-height: 1.6; color: #333; background-color: #f9f9f9; } h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; } h1 { font-size: 1.8em; } h2 { font-size: 1.4em; } h3 { font-size: 1.2em; } code { background: #e1e1e1; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; } pre { background: #e8e8e8; padding: 1rem; border-radius: 4px; overflow-x: auto; border: 1px solid #ddd; } p { margin-bottom: 1em; } strong { font-weight: 600; } em { font-style: italic; } ul, ol { margin-left: 1.5em; margin-bottom: 1em; } li { margin-bottom: 0.5em; } blockquote { border-left: 3px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; color: #555; }`;
    const csp = `default-src 'none'; style-src 'unsafe-inline' https://unpkg.com; img-src data: https:; script-src 'unsafe-inline' https://unpkg.com; font-src data: https:; connect-src https:; frame-src 'self';`;

    interface ProjectData {
        id?: string; // Add id if it's part of the spec
        name?: string;
        description?: string;
        features?: string[];
        pseudocode?: string;
        problem?: string;
        customers?: string;
        customerLocation?: string;
        applicationType?: string;
        dataModel?: string;
        userRole?: string;
        // Add other fields from ProjectGenerator's state if needed for preview
        contributors?: string[];
        forks?: number;
        stars?: number;
    }

    if (artifact.language === PROJECT_SPEC_LANG) {
        let projectData: ProjectData = { name: artifact.title, description: 'Could not parse project data.' };
        try {
            projectData = JSON.parse(artifact.content || '{}') as ProjectData;
        } catch (e) {
             console.error("Error parsing project data for preview:", e);
        }
        const featuresList = Array.isArray(projectData.features) ? projectData.features.map(f => `<li>${escapeHtml(f)}</li>`).join('') : '<li>None</li>';
        const pseudocodePreview = projectData.pseudocode ? `<pre><code>${escapeHtml(projectData.pseudocode)}</code></pre>` : '<p><em>No pseudocode generated yet.</em></p>';

        const projectName = projectData.name || artifact.title || 'Untitled Project';

        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle}</style><title>Project: ${escapeHtml(projectName)}</title></head><body>
            <h1>Project Idea: ${escapeHtml(projectName)}</h1>
            ${projectData.description ? `<p><strong>Description:</strong> ${escapeHtml(projectData.description)}</p>` : ''}
            ${projectData.problem ? `<h2>Problem Statement</h2><p>${escapeHtml(projectData.problem)}</p>` : ''}
            ${projectData.customers ? `<h2>Target Customers</h2><p>${escapeHtml(projectData.customers)}</p>` : ''}
            ${projectData.customerLocation ? `<h3>Location</h3><p>${escapeHtml(projectData.customerLocation)}</p>` : ''}

            <h2>Technical Details</h2>
            <p><strong>Application Type:</strong> ${escapeHtml(projectData.applicationType || 'N/A')}</p>
            <p><strong>Data Model:</strong> ${escapeHtml(projectData.dataModel || 'N/A')}</p>
            <p><strong>Primary User Role:</strong> ${escapeHtml(projectData.userRole || 'N/A')}</p>

            <h2>Features</h2>
            <ul>${featuresList}</ul>

            <h2>Pseudocode</h2>
            ${pseudocodePreview}
            
            </body></html>`;
    }

    // Fallback for other types like markdown, text, etc.
    // This simple preview just wraps the content in a <pre> tag.
    return `<!DOCTYPE html><html><head><style>${baseStyle}</style><title>Preview: ${escapeHtml(artifact.title)}</title></head><body><pre>${escapeHtml(artifact.content)}</pre></body></html>`;
  };

  const handleExport = () => {
    if (iframeRef.current?.contentWindow) {
      exportArtifactToPDF(artifact, iframeRef.current.contentWindow);
    }
  };

  const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <AlertCircle className="inline-block mr-2" />
        Error rendering preview: {error}
      </div>
    );
  }
  
  const srcDoc = generatePreviewHTML(artifact);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 p-2 border-b flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileDown className="h-4 w-4 mr-2" />
          Export to PDF
        </Button>
      </div>
      <div className="flex-grow relative">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts" // allow-scripts is needed for JS execution in preview
          className="w-full h-full border-0"
          title="Artifact Preview"
        />
      </div>
    </div>
  );
}
