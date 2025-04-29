import React from "react";
import { type Artifact } from "@/lib/db";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import PixelatedAvatar from "@/components/PixelatedAvatar"; // Import PixelatedAvatar

interface ArtifactListProps {
  artifacts: Artifact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ArtifactList({ artifacts, selectedId, onSelect }: ArtifactListProps) {
  if (artifacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No artifacts yet</p>
        <p className="text-sm">Create a new artifact to get started</p>
      </div>
    );
  }

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
            <PixelatedAvatar seed={parseInt(artifact.avatarSeed)} size={32} /> {/* Use PixelatedAvatar */}
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
