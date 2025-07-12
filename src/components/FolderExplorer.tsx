import React, { useState, useMemo } from 'react';
import { dbService, type FolderData, type ArtifactData } from '@/lib/services/db';
import { ChevronRight, ChevronDown, Folder as FolderIcon, FileCode, Plus, MoreHorizontal, Edit, Trash2, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from './ui/input';
import { toast } from 'sonner';

interface FolderExplorerProps {
  activeArtifactId: string | null;
  onSelectArtifact: (artifactId: string) => void;
  // The user ID is needed to fetch the correct folders
  userId: string;
}

interface FolderWithArtifacts extends FolderData {
  artifacts: ArtifactData[];
  children: FolderWithArtifacts[];
}

export function FolderExplorer({
  activeArtifactId,
  onSelectArtifact,
  userId,
}: FolderExplorerProps) {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Fetch initial data
  React.useEffect(() => {
    const fetchData = async () => {
      const userFolders = await dbService.getFoldersByUser(userId);
      const userArtifacts = await dbService.getAllArtifacts(); // In a real app, filter by user
      setFolders(userFolders);
      setArtifacts(userArtifacts.filter(a => a.userId === userId));
    };
    fetchData();
  }, [userId]);

  const folderTree = useMemo(() => {
    const folderMap = new Map<string, FolderWithArtifacts>();
    const rootFolders: FolderWithArtifacts[] = [];

    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [], artifacts: [] });
    });

    artifacts.forEach(artifact => {
      if (artifact.folderId && folderMap.has(artifact.folderId)) {
        folderMap.get(artifact.folderId)?.artifacts.push(artifact);
      }
    });

    folders.forEach(folder => {
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)?.children.push(folderMap.get(folder.id)!);
      } else {
        rootFolders.push(folderMap.get(folder.id)!);
      }
    });

    return rootFolders;
  }, [folders, artifacts]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateFolder = async (parentId: string | null = null) => {
    const newFolder = await dbService.createFolder({
      name: 'New Folder',
      userId,
      parentId: parentId || undefined,
    });
    setFolders(prev => [...prev, newFolder]);
    setEditingFolderId(newFolder.id);
    setEditingFolderName('New Folder');
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) {
      toast.error("Folder name can't be empty.");
      return;
    }
    const updated = await dbService.updateFolder(folderId, { name: editingFolderName });
    if (updated) {
      setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleDeleteFolder = async (folderId: string) => {
    await dbService.deleteFolder(folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    // Artifacts within the folder are now un-parented, you might want to refetch or update state
  };

  const renderFolder = (folder: FolderWithArtifacts) => (
    <div key={folder.id} className="select-none">
      <div
        className="flex items-center py-1 px-1.5 rounded hover:bg-muted/50 group"
      >
        <span className="mr-1 cursor-pointer" onClick={() => toggleFolder(folder.id)}>
          {expandedFolders[folder.id] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
        <FolderIcon className="h-4 w-4 mr-1.5 text-yellow-500" />
        {editingFolderId === folder.id ? (
          <Input
            type="text"
            value={editingFolderName}
            onChange={(e) => setEditingFolderName(e.target.value)}
            onBlur={() => handleRenameFolder(folder.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder(folder.id)}
            className="h-6"
            autoFocus
          />
        ) : (
          <span>{folder.name}</span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleCreateFolder(folder.id)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New Subfolder</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setEditingFolderId(folder.id);
              setEditingFolderName(folder.name);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expandedFolders[folder.id] && (
        <div className="ml-5 mt-1 space-y-1">
          {folder.children.map(renderFolder)}
          {folder.artifacts.map(artifact => (
            <div
              key={artifact.id}
              className={cn(
                "flex items-center py-1 px-1.5 rounded cursor-pointer hover:bg-muted/50",
                artifact.id === activeArtifactId && "bg-muted"
              )}
              onClick={() => onSelectArtifact(artifact.id)}
            >
              <FileCode className="h-4 w-4 mr-1.5 text-amber-500" />
              <span>{artifact.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-2 space-y-1 text-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Explorer</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCreateFolder(null)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {folderTree.map(renderFolder)}
    </div>
  );
}
