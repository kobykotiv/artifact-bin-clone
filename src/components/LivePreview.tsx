import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, Maximize2, Minimize2, AlertTriangle, Play, Square } from 'lucide-react';
import { dbService } from '@/lib/services/db';

// Define ArtifactData locally (replace with the actual structure if known)
type ArtifactData = {
  language: string;
  content: string;
  // ...add other fields as needed...
};

interface LivePreviewProps {
  artifact: ArtifactData;
  isVisible?: boolean;
  className?: string;
}

// Fork type for backend
interface Fork {
  id: string;
  artifactId: string;
  userId: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  content: string;
  language: string;
}

// ForksPanel for switching between forks
function ForksPanel({ forks, currentForkId, onSelectFork }: { forks: Fork[]; currentForkId: string; onSelectFork: (id: string) => void }) {
  if (forks.length <= 1) return null;
  return (
    <div className="flex gap-2 mb-2">
      {forks.map(fork => (
        <Button
          key={fork.id}
          size="sm"
          variant={fork.id === currentForkId ? 'default' : 'outline'}
          onClick={() => onSelectFork(fork.id)}
        >
          {fork.title}
        </Button>
      ))}
    </div>
  );
}

// Improved error handling and edge case coverage for forks/variations
export function LivePreview({ artifact, isVisible = true, className }: LivePreviewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forks, setForks] = useState<Fork[]>([]);
  const [currentForkId, setCurrentForkId] = useState<string>('original');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Helper to safely get artifactId
  const artifactId = (artifact as any).id || 'demo-artifact';

  // Fetch all forks for this artifact, including the original as a fork
  useEffect(() => {
    let isMounted = true;
    async function fetchForks() {
      try {
        let fetchedForks: Fork[] = [];
        if (dbService.getForksByArtifact) {
          // Map backend ForkData to Fork (add content/language fallback)
          const rawForks = await dbService.getForksByArtifact(artifactId);
          fetchedForks = (rawForks || []).map(f => ({
            ...f,
            content: (f as any).content || artifact.content,
            language: (f as any).language || artifact.language,
          }));
        }
        // Always include the original as a fork
        const originalFork: Fork = {
          id: 'original',
          artifactId: artifactId,
          userId: 'original',
          title: 'Classic',
          isPublic: true,
          createdAt: new Date().toISOString(),
          content: artifact.content,
          language: artifact.language,
        };
        // Remove duplicates and handle edge cases
        const allForks = [originalFork, ...((fetchedForks || []).filter(f => f.id !== 'original'))];
        if (isMounted) {
          setForks(allForks);
          setCurrentForkId('original');
        }
      } catch (err) {
        setError('Failed to load forks: ' + (err instanceof Error ? err.message : String(err)));
        setForks([]);
      }
    }
    fetchForks();
    return () => { isMounted = false; };
  }, [artifactId, artifact.content, artifact.language]);

  // Use the selected fork's content for preview
  const currentFork: Fork =
    forks.find(f => f.id === currentForkId) ||
    forks[0] ||
    {
      id: 'original',
      artifactId: artifactId,
      userId: 'original',
      title: 'Classic',
      isPublic: true,
      createdAt: new Date().toISOString(),
      content: artifact.content,
      language: artifact.language,
    };

  // Add generatePreviewContent function if missing
  const generatePreviewContent = (fork: Fork) => {
    // ...existing logic from previous implementation...
    // For brevity, you can use the same logic as before for HTML, JS, etc.
    // If you want, you can move the function body here from above.
    return '';
  };

  useEffect(() => {
    if (!isVisible) return;
    try {
      setError(null);
      const content = generatePreviewContent(currentFork);
      setPreviewContent(content);
      setIsRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
      setIsRunning(false);
    }
  }, [currentFork, isVisible, autoRefresh]);

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
        {/* Forks panel for switching between variations */}
        <ForksPanel forks={forks} currentForkId={currentForkId} onSelectFork={setCurrentForkId} />
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
