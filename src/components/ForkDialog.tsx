import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { dbService } from '@/lib/services/db';

interface Fork {
  id: string;
  artifactId: string;
  userId: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
}

interface ForkDialogProps {
  artifactId: string;
  onClose: () => void;
}

export function ForkDialog({ artifactId, onClose }: ForkDialogProps) {
  const [forks, setForks] = useState<Fork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching public forks for the artifact
    async function fetchForks() {
      setLoading(true);
      // Replace with real dbService call
      const allForks = await dbService.getForksByArtifact(artifactId);
      setForks(allForks.filter(f => f.isPublic));
      setLoading(false);
    }
    fetchForks();
  }, [artifactId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-black rounded shadow-lg p-6 min-w-[320px] max-w-lg w-full">
        <h3 className="font-bold mb-2">Public Forks</h3>
        {loading ? (
          <div>Loading...</div>
        ) : forks.length === 0 ? (
          <div>No public forks found for this artifact.</div>
        ) : (
          <ul className="mb-4 max-h-64 overflow-y-auto">
            {forks.map(fork => (
              <li key={fork.id} className="mb-2 p-2 border rounded">
                <div className="font-semibold">{fork.title}</div>
                <div className="text-xs text-gray-500">By {fork.userId} • {new Date(fork.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
