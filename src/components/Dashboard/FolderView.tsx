import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FolderOpen, Plus, Share2, Edit, Trash } from 'lucide-react';
import { type FolderData, type ArtifactData } from '@/lib/services/db';
import { ArtifactList } from '@/components/ArtifactList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderViewProps {
  folders: FolderData[];
  artifacts: ArtifactData[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onShareFolder: (folderId: string, emails: string[]) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onSelectArtifact: (id: string) => void;
  selectedArtifactId: string | null;
  onMoveArtifacts: (artifactIds: string[], targetFolderId: string) => void;
}

export function FolderView({
  folders,
  artifacts,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onShareFolder,
  onDeleteFolder,
  onSelectArtifact,
  selectedArtifactId,
  onMoveArtifacts
}: FolderViewProps) {
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Root level folders
  const rootFolders = folders.filter(folder => !folder.parentId);
  
  // Child folders of the selected folder
  const childFolders = selectedFolderId 
    ? folders.filter(folder => folder.parentId === selectedFolderId)
    : [];
    
  // Artifacts in the selected folder
  const folderArtifacts = selectedFolderId
    ? artifacts.filter(artifact => artifact.folderId === selectedFolderId)
    : artifacts.filter(artifact => !artifact.folderId); // Unfiled artifacts

  // Selected folder
  const selectedFolder = selectedFolderId
    ? folders.find(folder => folder.id === selectedFolderId)
    : null;
    
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    await onCreateFolder(newFolderName, selectedFolderId);
    setNewFolderName('');
    setIsNewFolderDialogOpen(false);
  };
  
  const handleShareFolder = async () => {
    if (!selectedFolderId || !shareEmails.trim()) return;
    
    const emails = shareEmails.split(',').map(email => email.trim());
    await onShareFolder(selectedFolderId, emails);
    setShareEmails('');
    setIsShareDialogOpen(false);
  };

  // Handle drag start for artifact
  const handleDragStart = (e: React.DragEvent, artifactId: string) => {
    e.dataTransfer.setData('artifactId', artifactId);
    setIsDragging(true);
    
    // Select the dragged artifact if not already selected
    if (!selectedArtifacts.includes(artifactId)) {
      setSelectedArtifacts([artifactId]);
    }
  };
  
  // Handle dropping on folder
  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Move selected artifacts to the target folder
    onMoveArtifacts(selectedArtifacts, targetFolderId);
    setSelectedArtifacts([]);
  };
  
  // Allow dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Handle sharing multiple artifacts at once
  const handleShareSelected = () => {
    // Show share dialog similar to the existing one
    setIsShareDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Folder Navigation */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Folders</CardTitle>
            <Button size="sm" onClick={() => setIsNewFolderDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                <button
                  onClick={() => onSelectFolder(null)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center ${!selectedFolderId ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  All Artifacts
                </button>
                
                {rootFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => onSelectFolder(folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center ${selectedFolderId === folder.id ? 'bg-accent text-accent-foreground' : ''}`}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {folder.name}
                    {folder.isShared && (
                      <Share2 className="h-3 w-3 ml-2 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Content Area */}
      <div className="md:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {selectedFolder ? selectedFolder.name : 'All Artifacts'}
            </CardTitle>
            
            {selectedFolder && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this folder?')) {
                      onDeleteFolder(selectedFolder.id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {/* Child folders */}
            {childFolders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Subfolders</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {childFolders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => onSelectFolder(folder.id)}
                      className="flex items-center p-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      onDrop={(e) => handleDrop(e, folder.id)}
                      onDragOver={handleDragOver}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Artifacts */}
            <div>
              <h3 className="text-sm font-medium mb-2">Artifacts</h3>
              <ArtifactList 
                artifacts={folderArtifacts}
                selectedId={selectedArtifactId}
                onSelect={onSelectArtifact}
                displayMode="grid"
                onDragStart={handleDragStart}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="mt-4"
          />
          <DialogFooter className="mt-4">
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Enter email addresses separated by commas
          </p>
          <Input
            value={shareEmails}
            onChange={(e) => setShareEmails(e.target.value)}
            placeholder="email@example.com, another@example.com"
            className="mt-4"
          />
          <DialogFooter className="mt-4">
            <Button onClick={handleShareFolder}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
