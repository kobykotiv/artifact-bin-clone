import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, Maximize2, Minimize2, AlertTriangle, Play, Square } from 'lucide-react';
import { type ArtifactData } from '@/lib/services/db';

interface LivePreviewProps {
  artifact: ArtifactData;
  isVisible?: boolean;
  className?: string;
}

export function LivePreview({ artifact, isVisible = true, className }: LivePreviewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Generate preview content based on artifact type
  useEffect(() => {
    if (!isVisible) return;

    try {
      setError(null);
      const content = generatePreviewContent(artifact);
      setPreviewContent(content);
      setIsRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
      setIsRunning(false);
    }
  }, [artifact.content, artifact.language, isVisible, autoRefresh]);

  const generatePreviewContent = (artifact: ArtifactData): string => {
    const { language, content } = artifact;

    // Enhanced security: CSP headers for iframe
    const cspHeader = "default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob: *;";

    switch (language) {
      case 'html':
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">
  <title>Live Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
    .preview-error { color: #dc2626; background: #fee2e2; padding: 0.5rem; border-radius: 0.25rem; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

      case 'javascript':
      case 'typescript':
        // For React components or JS code
        if (content.includes('React') || content.includes('export default')) {
          return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">
  <title>React Component Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
    .preview-container { min-height: 200px; }
  </style>
</head>
<body>
  <div id="root" class="preview-container"></div>
  <script type="text/babel">
    try {
      ${content}
      
      // Try to render if it's a React component
      if (typeof Component !== 'undefined') {
        ReactDOM.render(React.createElement(Component), document.getElementById('root'));
      } else {
        console.log('Code executed successfully');
      }
    } catch (error) {
      document.getElementById('root').innerHTML = 
        '<div class="preview-error">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
        } else {
          // Regular JavaScript
          return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">
  <title>JavaScript Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
    #output { border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.25rem; min-height: 100px; }
    .log { margin: 0.25rem 0; padding: 0.25rem; background: #f9fafb; border-radius: 0.125rem; }
  </style>
</head>
<body>
  <h3>Console Output:</h3>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = function(...args) {
      output.innerHTML += '<div class="log">' + args.join(' ') + '</div>';
      originalLog.apply(console, args);
    };
    
    console.error = function(...args) {
      output.innerHTML += '<div class="log" style="color: #dc2626;">' + args.join(' ') + '</div>';
      originalError.apply(console, args);
    };
    
    try {
      ${content}
    } catch (error) {
      console.error('Runtime Error:', error.message);
    }
  </script>
</body>
</html>`;
        }

      case 'css':
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">
  <title>CSS Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
    ${content}
  </style>
</head>
<body>
  <h1>CSS Preview</h1>
  <p class="demo-text">This is a sample paragraph to demonstrate your CSS.</p>
  <div class="demo-box" style="width: 200px; height: 100px; background: #f3f4f6; border: 2px solid #d1d5db; padding: 1rem; margin: 1rem 0;">
    Demo content box
  </div>
  <button class="demo-button">Sample Button</button>
</body>
</html>`;

      case 'markdown':
        // Simple markdown to HTML conversion
        const htmlContent = content
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code>$1</code>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');

        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">
  <title>Markdown Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; line-height: 1.6; max-width: 800px; }
    h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
    code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25rem; }
    p { margin-bottom: 1em; }
  </style>
</head>
<body>
  <p>${htmlContent}</p>
</body>
</html>`;

      default:
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">
  <title>Code Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; }
    code { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <h3>Code Preview (${language}):</h3>
  <pre><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
</body>
</html>`;
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) {
          const blob = new Blob([previewContent], { type: 'text/html' });
          iframeRef.current.src = URL.createObjectURL(blob);
        }
      }, 100);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      handleRefresh();
    }
  };

  if (!isVisible) return null;

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Live Preview</CardTitle>
            <Badge variant={isRunning ? 'default' : 'secondary'} className="text-xs">
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
            {error && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Error
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Label htmlFor="auto-refresh">Auto</Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                size="sm"
              />
            </div>
            <Button size="sm" variant="ghost" onClick={toggleRunning}>
              {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={!isRunning}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-4 text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Preview Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={isRunning ? previewContent : '<html><body><p>Preview stopped</p></body></html>'}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className={`w-full border-0 bg-white ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-96'}`}
            title="Live Preview"
          />
        )}
      </CardContent>
    </Card>
  );
}
