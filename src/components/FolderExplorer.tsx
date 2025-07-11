import React, { useState } from 'react';
import { type ArtifactData } from '@/lib/services/db';
import { ChevronRight, ChevronDown, FileCode, FileText, FolderOpen, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FolderExplorerProps {
  folders: Record<string, ArtifactData[]>;
  activeArtifactId: string | null;
  activeFolderId: string | null; 
  onSelectFolder: (folderId: string) => void;
  onSelectArtifact: (artifactId: string) => void;
}

export function FolderExplorer({
  folders,
  activeArtifactId,
  activeFolderId,
  onSelectFolder,
  onSelectArtifact
}: FolderExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "All": true,
    "Code Snippets": false,
    "Project Specs": false, 
    "Business Plans": false,
    "Sprint Plans": false
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
    onSelectFolder(folderId);
  };

  // Helper function to get appropriate icon for artifact
  const getArtifactIcon = (artifact: ArtifactData) => {
    if (artifact.language === 'project-spec') {
      return <FileText className="h-4 w-4 mr-1.5 text-blue-500" />;
    }
    return <FileCode className="h-4 w-4 mr-1.5 text-amber-500" />;
  };

  // Helper function to get language badge color
  const getLanguageBadgeColor = (language: string) => {
    const colors: Record<string, string> = {
      'javascript': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'typescript': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'html': 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      'css': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'project-spec': 'bg-green-500/20 text-green-700 dark:text-green-300'
    };
    
    return colors[language] || 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-2 space-y-1 text-sm">
      {Object.entries(folders).map(([folderName, artifacts]) => (
        <div key={folderName} className="select-none">
          <div 
            className={cn(
              "flex items-center py-1 px-1.5 rounded hover:bg-muted/50 cursor-pointer",
              folderName === activeFolderId && "bg-muted"
            )}
            onClick={() => toggleFolder(folderName)}
          >
            <span className="mr-1">
              {expandedFolders[folderName] ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
            
            {folderName === activeFolderId ? (
              <FolderOpen className="h-4 w-4 mr-1.5 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 mr-1.5 text-yellow-500" />
            )}
            
            <span>{folderName}</span>
            <Badge variant="outline" className="ml-auto">
              {artifacts.length}
            </Badge>
          </div>
          
          {expandedFolders[folderName] && (
            <div className="ml-5 mt-1 space-y-1">
              {artifacts.map(artifact => (
                <div 
                  key={artifact.id}
                  className={cn(
                    "flex items-center py-1 px-1.5 rounded cursor-pointer hover:bg-muted/50",
                    artifact.id === activeArtifactId && "bg-muted"
                  )}
                  onClick={() => onSelectArtifact(artifact.id)}
                >
                  {getArtifactIcon(artifact)}
                  <span className="truncate flex-grow">{artifact.title || 'Untitled'}</span>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "ml-2 text-xs",
                      getLanguageBadgeColor(artifact.language)
                    )}
                  >
                    {artifact.language}
                  </Badge>
                </div>
              ))}
              
              {artifacts.length === 0 && (
                <div className="py-1 px-2 text-muted-foreground italic text-xs">
                  No artifacts in this folder
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
