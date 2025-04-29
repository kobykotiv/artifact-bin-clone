import React, { useEffect, useRef, useState } from 'react';
import { type Artifact } from '@/lib/db';
import { AlertCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportArtifactToPDF } from '@/lib/export';
// Removed Card import as it's not used here

// Define a constant for the project generator language type
const PROJECT_GENERATOR_LANG = 'project-generator';

interface ArtifactPreviewProps {
  artifact: Artifact;
  isVisible: boolean;
}

export function ArtifactPreview({ artifact, isVisible }: ArtifactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [artifactUrl, setArtifactUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    // Only generate URL if the tab is visible
    if (isVisible) {
      try {
        const htmlContent = generatePreviewHTML(artifact);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        url = URL.createObjectURL(blob);
        setArtifactUrl(url);
        setError(null); // Clear previous errors on successful generation
      } catch (err) {
        console.error("Error generating preview URL:", err);
        setError(err instanceof Error ? err.message : 'An error occurred generating the preview URL');
        setArtifactUrl(null);
      }
    } else {
      // If tab is not visible, clear the URL to potentially save resources
      setArtifactUrl(null);
    }

    // Cleanup function to revoke the URL when the component unmounts or dependencies change
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [artifact, isVisible]); // Re-run effect if artifact or visibility changes

  const generatePreviewHTML = (artifact: Artifact): string => {
    const baseStyle = `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 1rem; line-height: 1.6; color: #333; background-color: #f9f9f9; } h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; } h1 { font-size: 1.8em; } h2 { font-size: 1.4em; } h3 { font-size: 1.2em; } code { background: #e1e1e1; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; } pre { background: #e8e8e8; padding: 1rem; border-radius: 4px; overflow-x: auto; border: 1px solid #ddd; } p { margin-bottom: 1em; } strong { font-weight: 600; } em { font-style: italic; } ul, ol { margin-left: 1.5em; margin-bottom: 1em; } li { margin-bottom: 0.5em; } blockquote { border-left: 3px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; color: #555; }`;
    // More permissive CSP for previewing various content, adjust as needed for security
    const csp = `default-src 'none'; style-src 'unsafe-inline' https://unpkg.com; img-src data: https:; script-src 'unsafe-inline' https://unpkg.com; font-src data: https:; connect-src https:; frame-src 'self';`; // Added frame-src 'self' for potential nested previews if needed

    // Define interface for project generator data
    interface ProjectData {
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
    }
    
    // Handle Project Generator type specifically
    if (artifact.language === PROJECT_GENERATOR_LANG) {
        let projectData: ProjectData = { name: artifact.title, description: 'Could not parse project data.' };
        try {
            projectData = JSON.parse(artifact.code || '{}') as ProjectData;
        } catch (e) {
             console.error("Error parsing project data for preview:", e);
        }
        const featuresList = Array.isArray(projectData.features) ? projectData.features.map(f => `<li>${escapeHtml(f)}</li>`).join('') : '<li>None</li>';
        const pseudocodePreview = projectData.pseudocode ? `<pre><code>${escapeHtml(projectData.pseudocode)}</code></pre>` : '<p><em>No pseudocode generated yet.</em></p>';

        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle}</style><title>Project: ${escapeHtml(projectData.name || artifact.title)}</title></head><body>
            <h1>Project Idea: ${escapeHtml(projectData.name || artifact.title)}</h1>
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

            <h2>Pseudocode Preview</h2>
            ${pseudocodePreview}
            </body></html>`;
    }


    if (!artifact.language) {
      // Plaintext preview if no language selected
      return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle} code {white-space: pre; font-family: monospace;}</style></head><body><pre><code>${escapeHtml(artifact.code)}</code></pre></body></html>`;
    }

    switch (artifact.language) {
      case 'html':
        // Allow potentially unsafe HTML, but sandboxed
        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle}</style></head><body>${artifact.code}</body></html>`;
      case 'css':
        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle} ${artifact.code}</style></head><body><h1>CSS Preview</h1><p>This is a paragraph with <a href="#">a link</a>.</p><button>Button</button><div class="box" style="border:1px solid #ccc; padding: 10px; margin-top: 10px;">A div with class "box"</div><a href="https://github.com/your-repo" style="position: fixed; bottom: 10px; right: 10px; background: #000; color: #fff; padding: 5px 10px; text-decoration: none; border-radius: 5px;">Fork me on GitHub</a></body></html>`;
      case 'javascript':
        // Allow JS execution, sandboxed
        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle}</style></head><body><h3>JavaScript Output:</h3><div id="output" style="border:1px solid #ddd; padding:1rem; min-height: 50px; margin-top:1rem; white-space: pre-wrap;"></div><script>
        // Capture console.log, console.error, console.warn
        const output = document.getElementById('output');
        const originalConsole = { log: console.log, error: console.error, warn: console.warn };
        const capture = (type, args) => {
          const line = document.createElement('div');
          line.textContent = \`[\${type.toUpperCase()}] \${Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}\`;
          if (type === 'error') line.style.color = 'red';
          if (type === 'warn') line.style.color = 'orange';
          output.appendChild(line);
        };
        console.log = (...args) => { capture('log', args); originalConsole.log(...args); };
        console.error = (...args) => { capture('error', args); originalConsole.error(...args); };
        console.warn = (...args) => { capture('warn', args); originalConsole.warn(...args); };
        window.onerror = (message, source, lineno, colno, error) => {
          console.error(\`Uncaught Error: \${message} (\${lineno}:\${colno})\`);
          return true; // Prevent default browser error handling
        };
        try {
          ${artifact.code};
        } catch (e) {
          console.error(e);
        }
        </script></body></html>`;
      case 'jsx':
      case 'tsx':
        // Attempt to render React component
        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle}</style></head><body><div id="root">Loading React Component...</div><script src="https://unpkg.com/react@18/umd/react.development.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script><script>
        try {
          // Basic Babel standalone setup (consider a more robust solution for complex JSX/TSX)
          // This is a simplified approach and might not handle all syntax
          const transformedCode = artifact.code; // Placeholder: Needs actual transformation (e.g., Babel standalone or server-side)

          // Assuming the artifact code defines a component named 'App'
          // This part needs refinement based on how JSX/TSX is actually handled/transformed
          // For now, it might fail if the code isn't plain JS defining React elements

          // Example: If artifact.code is like \`return <h1>Hello</h1>;\`
          function App() {
             // This eval is risky and limited. A proper build step or Babel standalone is better.
             // return eval(transformedCode); // Highly simplified and potentially insecure/broken
             // Placeholder rendering:
             return React.createElement('div', null, 'Previewing React code (requires transformation)');
          }

          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
        } catch (e) {
          console.error('React Render Error:', e);
          document.getElementById('root').innerHTML = '<div style="color: red; border: 1px solid red; padding: 1rem;">Error rendering React component: ' + e.message + '<br><br>Note: Live JSX/TSX rendering in preview is complex and may require code transformation.</div>';
        }
        </script></body></html>`;
      case 'markdown':
        // Use a more robust Markdown conversion if possible, or stick to basic regex
        const mdHtml = artifact.code
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>') // Corrected capture group
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code>$1</code>')
          .replace(/```([\s\S]*?)```/g, (match, p1) => `<pre><code>${escapeHtml(p1)}</code></pre>`) // Escape code inside blocks
          .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">') // Basic image support
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>') // Basic link support
          .split('\n')
          .map(line => {
              if (line.match(/^(<h1>|<h2>|<h3>|<pre>|<ul>|<ol>|<li>|<blockquote>)/)) return line; // Keep block elements
              return line.trim() === '' ? '' : `<p>${line}</p>`; // Wrap others in <p>
          })
          .join(''); // Join lines back
        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle}</style></head><body>${mdHtml}</body></html>`;
      default:
        // Default to plaintext preview for unknown languages
        return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${baseStyle} code {white-space: pre; font-family: monospace;}</style></head><body><pre><code>${escapeHtml(artifact.code)}</code></pre></body></html>`;
    }
  };

  // Utility function to escape HTML characters
  const escapeHtml = (text: string): string => {
    if (!text) return '';
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Determine sandbox attributes based on language
  let sandboxAttrs = "allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"; // Allow scripts by default for JS/React
  // Restrict further if not a scriptable language (adjust as needed)
  if (!['javascript', 'jsx', 'tsx', 'html'].includes(artifact.language || '')) {
      sandboxAttrs = "allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin"; // No scripts for CSS, Markdown, plaintext etc.
  }
  // For HTML, consider if scripts inside the HTML should run. If not, remove 'allow-scripts'.
  // if (artifact.language === 'html') { sandboxAttrs = "allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin"; }


  return (
    <div className="h-full flex flex-col relative bg-gray-100">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => exportArtifactToPDF(artifact)}
        >
          <FileDown className="h-4 w-4 mr-1" />
          Export PDF
        </Button>
      </div>
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-destructive/10 text-destructive p-2 rounded-md text-xs flex items-center gap-1 z-10 border border-destructive/30">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Preview Error: {error}</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={artifactUrl} // Force re-render when URL changes
        title={`Preview of ${artifact.title}`}
        className="w-full h-full border-0 bg-white" // Keep white background for content area
        sandbox={sandboxAttrs}
        src={artifactUrl || "about:blank"} // Use Blob URL or about:blank
        // Remove srcDoc as we are using src with Blob URL now
      />
    </div>
  );
}
