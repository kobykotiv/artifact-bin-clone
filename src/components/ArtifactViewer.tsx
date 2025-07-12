import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Edit2, Download } from 'lucide-react';
// import { type ArtifactData } from '@/lib/services/db';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import { ReviewForm } from './reviews/ReviewForm';
import { ReviewList } from './reviews/ReviewList';
import { dbService, type ReviewData } from '@/lib/services/db';
import { Separator } from './ui/separator';
import type { ArtifactData } from '@/lib/models/Artifact';

interface ArtifactViewerProps {
  artifact: ArtifactData;
  className?: string;
  onEdit?: () => void;
  onDownload?: () => void;
}

export function ArtifactViewer({ artifact, className, onEdit, onDownload }: ArtifactViewerProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);

  const fetchReviews = async () => {
    if (artifact.id) {
      const fetchedReviews = await dbService.getReviewsForArtifact(artifact.id);
      setReviews(fetchedReviews);
    }
  };

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
    fetchReviews();
  }, [artifact.id, artifact.content]);

  const getLanguageClass = () => {
    switch (artifact.fileType) {
      case 'ts': return 'language-typescript';
      case 'js': return 'language-javascript';
      case 'jsx': return 'language-jsx';
      case 'tsx': return 'language-tsx';
      case 'json': return 'language-json';
      case 'css': return 'language-css';
      case 'md': return 'language-markdown';
      default: return 'language-plaintext';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title || 'artifact'}.${artifact.fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{artifact.title || 'Untitled Artifact'}</CardTitle>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-20rem)] rounded-lg">
          <pre className={`p-4 rounded-lg bg-zinc-950 ${getLanguageClass()}`}>
            <code ref={codeRef} className={getLanguageClass()}>
              {artifact.content}
            </code>
          </pre>
        </ScrollArea>
        <Separator />
        <div className="p-4 space-y-6">
          <ReviewList reviews={reviews} />
          <ReviewForm
            artifactId={artifact.id}
            userId="current_user" // Replace with actual user ID from auth
            onReviewSubmit={fetchReviews}
          />
        </div>
      </CardContent>
    </Card>
  );
}
