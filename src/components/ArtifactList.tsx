import React from "react";
import { type Artifact } from "@/lib/db";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import PixelatedAvatar from "@/components/PixelatedAvatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, ChevronRight } from "lucide-react";

interface ArtifactListProps {
  artifacts: Artifact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  displayMode?: 'grid' | 'list';
}

export function ArtifactList({ artifacts, selectedId, onSelect, displayMode = 'list' }: ArtifactListProps) {
  if (artifacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No artifacts yet</p>
        <p className="text-sm">Create a new artifact to get started</p>
      </div>
    );
  }

  if (displayMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 p-1">
        {artifacts.map((artifact) => (
          <Card 
            key={artifact.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedId === artifact.id && "border-primary shadow-sm"
            )}
            onClick={() => onSelect(artifact.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <PixelatedAvatar seed={parseInt(artifact.avatarSeed)} size={40} />
                </div>
                <div className="flex-grow overflow-hidden">
                  <h3 className="font-medium text-sm truncate">{artifact.title || "Untitled"}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {artifact.language === 'project-spec' ? 'Project Specification' : artifact.language}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {artifact.language === 'project-spec' ? (
                      <FileText className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Code className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>
                      {new Date(artifact.updatedAt).toLocaleDateString(undefined, { 
                        year: '2-digit', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-2 flex flex-wrap gap-1 border-t bg-muted/50">
              {artifact.tags && artifact.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
              {artifact.tags && artifact.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{artifact.tags.length - 3}
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Original list view
  return (
    <ScrollArea className="h-full pr-3">
      <div className="space-y-1">
        {artifacts.map((artifact) => (
          <button
            key={artifact.id}
            onClick={() => onSelect(artifact.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
              "flex items-center gap-3",
              selectedId === artifact.id && "bg-accent text-accent-foreground"
            )}
          >
            <PixelatedAvatar seed={parseInt(artifact.avatarSeed)} size={32} />
            <div className="flex-1 overflow-hidden">
              <span className="block truncate font-medium text-sm">
                {artifact.title || "Untitled"}
              </span>
              <span className="text-xs text-muted-foreground block truncate">
                {artifact.language} - {new Date(artifact.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
