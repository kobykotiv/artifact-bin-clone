// ArtifactDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dbService } from '@/lib/services/db';
import { Card, CardContent } from '@/components/ui/card';

export function ArtifactDetailsPage({ uuid }: { uuid: string }) {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtifact() {
      setLoading(true);
      setError(null);
      try {
        const data = await dbService.getArtifactById(uuid);
        setArtifact(data);
      } catch (e) {
        setError('Artifact not found');
      } finally {
        setLoading(false);
      }
    }
    fetchArtifact();
  }, [uuid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!artifact) return <div>Not found</div>;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardContent>
        <h2 className="text-2xl font-bold mb-2">{artifact.title}</h2>
        <div className="mb-2 text-muted-foreground">{artifact.language}</div>
        <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">{artifact.content}</pre>
        {/* Add more artifact details here as needed */}
      </CardContent>
    </Card>
  );
}
