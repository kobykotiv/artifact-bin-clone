// MyArtifactsSection.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderExplorer } from '@/components/FolderExplorer';
import { ArtifactList } from '@/components/ArtifactList';

export interface MyArtifactsSectionProps {
  artifacts: any[];
  folders: any[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  onSelectArtifact: (id: string) => void;
  onCreateArtifact: () => void;
}

export const MyArtifactsSection: React.FC<MyArtifactsSectionProps> = ({
  artifacts,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  onSelectArtifact,
  onCreateArtifact,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Folder Explorer Sidebar */}
      <div className="w-full md:w-1/4">
        <Card>
          <CardContent className="p-2">
            <FolderExplorer
              folders={folders}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
            />
          </CardContent>
        </Card>
      </div>
      {/* Artifacts List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">My Artifacts</h2>
          <Button size="sm" onClick={onCreateArtifact}>Create New</Button>
        </div>
        <ArtifactList
          artifacts={artifacts.filter(a => !selectedFolderId || a.folderId === selectedFolderId)}
          onSelect={onSelectArtifact}
        />
      </div>
    </div>
  );
};

export default MyArtifactsSection;
