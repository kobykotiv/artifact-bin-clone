import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Check, GitCommit, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { versioningService, type ArtifactVersion } from '@/lib/versioning';
import { toast } from 'sonner';

interface VersionHistoryProps {
  artifactId: string | null;
  onRevert: (content: string) => void;
}

export function VersionHistory({ 
  artifactId, 
  onRevert
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ArtifactVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (artifactId) {
      const fetchVersions = async () => {
        const fetchedVersions = await versioningService.getVersions(artifactId);
        setVersions(fetchedVersions);
        // The first version in the list is the current one
        if (fetchedVersions.length > 0) {
          setSelectedVersionId(fetchedVersions[0].id);
        }
      };
      fetchVersions();
    } else {
      setVersions([]);
      setSelectedVersionId(null);
    }
  }, [artifactId]);

  const handleRevert = async () => {
    if (!artifactId || !selectedVersionId) return;

    const versionToRevert = await versioningService.getVersion(artifactId, selectedVersionId);
    if (versionToRevert) {
      onRevert(versionToRevert.content);
      toast.success(`Reverted to version from ${new Date(versionToRevert.createdAt).toLocaleString()}`);
    } else {
      toast.error("Could not find the selected version to revert.");
    }
  };

  if (!artifactId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>Select an artifact to view version history</p>
        </div>
      </div>
    );
  }
  
  if (versions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>No version history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Version History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRevert}
          disabled={!selectedVersionId || selectedVersionId === versions[0]?.id}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Revert to Selected
        </Button>
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="space-y-1.5">
          {versions.map((version, index) => (
            <Button
              key={version.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto py-2",
                selectedVersionId === version.id && "bg-muted"
              )}
              onClick={() => setSelectedVersionId(version.id)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2 mt-0.5">
                  {index === 0 ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-tight">
                    {version.commitMessage || `Update at ${new Date(version.createdAt).toLocaleTimeString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                  {index === 0 && <span className="text-xs font-semibold text-green-600">(Current)</span>}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
