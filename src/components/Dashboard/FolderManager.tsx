import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Folder, File, Plus, Share2, MoreVertical, ChevronRight } from 'lucide-react';
import { type FolderData } from '@/lib/models/Folder';
import { dbService } from '@/lib/services/db';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FolderManagerProps {
  userId: string;
  onFolderSelect: (folderId: string | null) => void;
  onRefreshNeeded: () => void;
}

export function FolderManager({ userId, onFolderSelect, onRefreshNeeded }: FolderManagerProps) {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadFolders();
  }, [userId, currentPath]);
  
  const loadFolders = async () => {
    setLoading(true);
    try {
      // Get current parent folder ID from path
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
      
      const foldersList = await dbService.getFoldersByParent(userId, parentId);
      setFolders(foldersList);
    } catch (error) {
      console.error("Failed to load folders:", error);
      toast.error("Could not load folders");
    } finally {
      setLoading(false);
    }
  };
  
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }
    
    try {
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
      
      await dbService.createFolder({
        userId,
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined,
        isPublic: false,
        parentFolderId: parentId,
      });
      
      setNewFolderName('');
      setNewFolderDescription('');
      setIsCreateDialogOpen(false);
      loadFolders();
      toast.success("Folder created");
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Could not create folder");
    }
  };
  
  const shareFolder = async () => {
    if (!shareEmail.trim() || !selectedFolderId) return;
    
    try {
      await dbService.shareFolderByEmail(selectedFolderId, shareEmail.trim());
      toast.success(`Shared with ${shareEmail}`);
      setShareEmail('');
      setIsShareDialogOpen(false);
    } catch (error) {
      console.error("Failed to share folder:", error);
      toast.error("Could not share folder");
    }
  };
  
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentPath([...currentPath, folderId]);
    onFolderSelect(folderId);
  };
  
  const navigateUp = () => {
    if (currentPath.length === 0) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    setCurrentPath(newPath);
    onFolderSelect(newPath.length > 0 ? newPath[newPath.length - 1] : null);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Folders</CardTitle>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
        <CardDescription>Organize your artifacts</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        {/* Navigation breadcrumbs */}
        <div className="flex items-center mb-4 overflow-x-auto text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setCurrentPath([]);
              onFolderSelect(null);
            }}
            disabled={currentPath.length === 0}
          >
            Root
          </Button>
          
          {currentPath.length > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          )}
          
          {currentPath.map((folderId, index) => {
            const folder = folders.find(f => f.id === folderId) || {id: folderId, name: "..."};
            
            return (
              <React.Fragment key={folderId}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={index === currentPath.length - 1}
                >
                  {folder.name}
                </Button>
                
                {index < currentPath.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : folders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No folders found. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {folders.map(folder => (
              <Card key={folder.id} className="p-2 cursor-pointer hover:bg-accent/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div 
                    className="flex items-center flex-grow overflow-hidden"
                    onClick={() => navigateToFolder(folder.id, folder.name)}
                  >
                    <Folder className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setIsShareDialogOpen(true);
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" /> Share
                      </DropdownMenuItem>
                      {/* Add more actions here */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {folder.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{folder.description}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Create Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="My Folder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newFolderDescription}
                onChange={e => setNewFolderDescription(e.target.value)}
                placeholder="Folder description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={createFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Folder Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={shareFolder}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
