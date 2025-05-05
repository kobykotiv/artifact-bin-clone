import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Check, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Version {
  id: string;
  versionNumber: string;
  updatedAt: string;
  changeDescription: string;
  author: string;
}

interface VersionHistoryProps {
  artifactId: string | null;
  versions: Version[];
  currentVersion: string | null;
  onSelectVersion: (version: string) => void;
}

export function VersionHistory({ 
  artifactId, 
  versions, 
  currentVersion, 
  onSelectVersion 
}: VersionHistoryProps) {
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
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="space-y-1.5">
          {versions.map(version => (
            <Button
              key={version.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto py-2",
                currentVersion === version.id && "bg-muted"
              )}
              onClick={() => onSelectVersion(version.id)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2 mt-0.5">
                  {currentVersion === version.id ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-tight">v{version.versionNumber}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {new Date(version.updatedAt).toLocaleString()}
                  </p>
                  <p className="text-xs leading-tight">{version.changeDescription}</p>
                  <p className="text-xs text-muted-foreground leading-tight">By {version.author}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
