import React, { useState, useMemo } from 'react';
import { dbService } from '@/lib/services/db';
import { ChevronRight, ChevronDown, Folder as FolderIcon, FileCode, MoreHorizontal, Edit, Trash2, FolderPlus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from './ui/input';
import { toast } from 'sonner';
import { subscribeToNotifications } from '@/lib/notifications';
import { exportToMarkdown } from '@/lib/utils/export';

type Tag = string;

interface FolderData {
  id: string;
  name: string;
  userId: string;
  parentId?: string;
  tags?: Tag[];
}

interface ArtifactData {
  id: string;
  title: string;
  userId: string;
  folderId?: string;
  tags?: Tag[];
}

interface FolderExplorerProps {
  userId: string;
}

interface FolderWithArtifacts extends FolderData {
  artifacts: ArtifactData[];
  children: FolderWithArtifacts[];
  id: string;
  name: string;
  parentId?: string;
}

export function FolderExplorer({
  userId,
}: FolderExplorerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<{[id: string]: boolean}>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<{id: string, type: 'folder'|'artifact'}|null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'artifact'>('all');
  const [tagFilter, setTagFilter] = useState<Tag | null>(null);
  // Add favorites state
  const [favorites, setFavorites] = useState<{[id: string]: boolean}>({});
  const toggleFavorite = (id: string) => setFavorites(prev => ({...prev, [id]: !prev[id]}));

  // Preview state (scaffold)
  const [previewItem, setPreviewItem] = useState<{id: string, type: 'folder'|'artifact'}|null>(null);

  // Version history modal state (scaffold)
  const [showVersionHistory, setShowVersionHistory] = useState<{id: string, type: 'artifact'}|null>(null);

  // Customizable folder icon/color state (scaffold)
  const [folderIcons, setFolderIcons] = useState<{[id: string]: string}>({});
  const [folderColors, setFolderColors] = useState<{[id: string]: string}>({});

  const handleSetFolderIcon = (folderId: string, icon: string) => {
    setFolderIcons(prev => ({...prev, [folderId]: icon}));
    toast.success('Folder icon updated (Not yet implemented)');
  };
  const handleSetFolderColor = (folderId: string, color: string) => {
    setFolderColors(prev => ({...prev, [folderId]: color}));
    toast.success('Folder color updated (Not yet implemented)');
  };

  // Offline mode state (scaffold)
  const [isOffline, setIsOffline] = useState(false);
  React.useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

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

  // Notifications: subscribe on mount
  React.useEffect(() => {
    const handleNotif = (notif: any) => {
      toast.info(notif.message || 'You have a new notification');
    };
    subscribeToNotifications(userId, handleNotif);
    // No unsubscribe in stub
  }, [userId]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        handleCreateFolder();
      } else if (e.ctrlKey && e.key === 'r') {
        if (editingFolderId) handleRenameFolder(editingFolderId);
      } else if (e.ctrlKey && e.key === 'd') {
        const selected = Object.keys(selectedItems).filter(id => selectedItems[id]);
        if (selected.length) selected.forEach(id => handleDeleteFolder(id));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingFolderId, selectedItems]);

  // Helper: sort function for folders and artifacts
  const sortItems = <T extends { name?: string; title?: string; createdAt?: string }>(items: T[]): T[] => {
    let sorted = [...items];
    sorted.sort((a, b) => {
      const aName = (a.name || (a as any).title || '').toLowerCase();
      const bName = (b.name || (b as any).title || '').toLowerCase();
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
      } else if (sortBy === 'date') {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      return 0;
    });
    return sorted;
  };

  // Search filter logic
  const filteredFolders = useMemo(() => {
    let result = folders;
    if (searchQuery.trim()) {
      result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (tagFilter) {
      result = result.filter(f => f.tags?.includes(tagFilter));
    }
    if (filterType === 'folder') {
      // already folders
    }
    return sortItems(result);
  }, [folders, searchQuery, tagFilter, filterType, sortBy, sortOrder]);
  const filteredArtifacts = useMemo(() => {
    let result = artifacts;
    if (searchQuery.trim()) {
      result = result.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (tagFilter) {
      result = result.filter(a => a.tags?.includes(tagFilter));
    }
    if (filterType === 'artifact') {
      // already artifacts
    }
    return sortItems(result);
  }, [artifacts, searchQuery, tagFilter, filterType, sortBy, sortOrder]);

  const folderTree = useMemo(() => {
    const folderMap = new Map<string, FolderWithArtifacts>();
    const rootFolders: FolderWithArtifacts[] = [];
    (filteredFolders).forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [], artifacts: [] });
    });
    (filteredArtifacts).forEach(artifact => {
      if (artifact.folderId && folderMap.has(artifact.folderId)) {
        folderMap.get(artifact.folderId)?.artifacts.push(artifact);
      }
    });
    (filteredFolders).forEach(folder => {
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)?.children.push(folderMap.get(folder.id)!);
      } else {
        rootFolders.push(folderMap.get(folder.id)!);
      }
    });
    return rootFolders;
  }, [filteredFolders, filteredArtifacts]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateFolder = async (parentId: string | null = null) => {
    const newFolder = await dbService.createFolder({
      name: 'New Folder',
      userId,
      parentFolderId: parentId || undefined,
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
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Also remove from expanded state
    setExpandedFolders((prev) => {
      const newExpanded = { ...prev };
      delete newExpanded[folderId];
      return newExpanded;
    });
  };

  // Drag-and-drop handlers (scaffold)
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => setDraggedId(null);
  const handleDrop = (targetId: string, type: 'folder'|'artifact') => {
    // TODO: Move dragged item to new parent (update DB)
    setDraggedId(null);
    toast.success('Moved! (Not yet implemented)');
  };

  // Bulk selection
  const toggleSelect = (id: string) => setSelectedItems(prev => ({...prev, [id]: !prev[id]}));
  const clearSelection = () => setSelectedItems({});
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  // Bulk actions (scaffold)
  const handleBulkDelete = () => {
    // TODO: Delete all selected
    toast.success('Bulk delete (Not yet implemented)');
    clearSelection();
  };
  const handleBulkMove = () => {
    // TODO: Move all selected
    toast.success('Bulk move (Not yet implemented)');
    clearSelection();
  };

  // Sharing (scaffold)
  const handleShare = (id: string, type: 'folder'|'artifact') => setShowShareModal({id, type});
  const handleAddTag = (id: string, type: 'folder'|'artifact', tag: Tag) => {
    // TODO: Update DB and state
    toast.success('Tag added (Not yet implemented)');
  };
  const handleRemoveTag = (id: string, type: 'folder'|'artifact', tag: Tag) => {
    // TODO: Update DB and state
    toast.success('Tag removed (Not yet implemented)');
  };

  // Export functionality (scaffold)
  const handleExport = async () => {
    const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    const selectedArtifacts = artifacts.filter(a => selectedIds.includes(a.id));
    if (selectedArtifacts.length) {
      const md = await exportToMarkdown(selectedArtifacts);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'artifacts.md';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported selected artifacts!');
    } else {
      toast.error('No artifacts selected for export.');
    }
  };

  // Import functionality (scaffold)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        // TODO: Validate and add to state/db
        toast.success('Imported artifacts (Not yet implemented)');
      } catch {
        toast.error('Invalid import file.');
      }
    };
    reader.readAsText(file);
  };

  const renderFolder = (folder: FolderWithArtifacts) => (
    <div key={folder.id} className="select-none"
      draggable
      onDragStart={() => handleDragStart(folder.id)}
      onDragEnd={handleDragEnd}
      onDrop={e => { e.preventDefault(); handleDrop(folder.id, 'folder'); }}
      onDragOver={e => e.preventDefault()}
      onMouseEnter={() => setPreviewItem({id: folder.id, type: 'folder'})}
      onMouseLeave={() => setPreviewItem(null)}
    >
      <div className="flex items-center py-1 px-1.5 rounded hover:bg-muted/50 group">
        {/* Folder icon and color customization */}
        <span className="mr-1 cursor-pointer" onClick={() => toggleFolder(folder.id)}>
          {expandedFolders[folder.id] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
        <span style={{ color: folderColors[folder.id] || '#facc15' }}>
          {folderIcons[folder.id] ? (
            <span className="mr-1.5">{folderIcons[folder.id]}</span>
          ) : (
            <FolderIcon className="h-4 w-4 mr-1.5" />
          )}
        </span>
        {/* Icon/color picker (scaffold) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" title="Customize Folder">
              🎨
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSetFolderIcon(folder.id, '📁')}>📁 Default</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetFolderIcon(folder.id, '🗂️')}>🗂️ Tabbed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetFolderIcon(folder.id, '📦')}>📦 Box</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetFolderColor(folder.id, '#facc15')}>Yellow</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetFolderColor(folder.id, '#60a5fa')}>Blue</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetFolderColor(folder.id, '#34d399')}>Green</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Favorite button */}
        <button onClick={() => toggleFavorite(folder.id)} className="ml-1 text-yellow-400 hover:text-yellow-300" title="Favorite">
          {favorites[folder.id] ? '★' : '☆'}
        </button>
        {/* Customizable icon/color (scaffold) */}
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
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => handleShare(folder.id, 'folder')} title="Share"><Share2 className="h-4 w-4" /></Button>
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
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Preview/metadata on hover */}
      {previewItem?.id === folder.id && previewItem.type === 'folder' && (
        <div className="block text-xs text-muted-foreground pl-8 bg-gray-800 rounded p-2 mt-1">
          <div>Folder: {folder.name}</div>
          <div>Artifacts: {folder.artifacts.length}</div>
          <div>Subfolders: {folder.children.length}</div>
          {/* TODO: Add more metadata as needed */}
        </div>
      )}
      {expandedFolders[folder.id] && (
        <div className="pl-4">
          {folder.children.map(renderFolder)}
          {folder.artifacts.map(renderArtifact)}
        </div>
      )}
    </div>
  );

  const renderArtifact = (artifact: ArtifactData) => (
    <div key={artifact.id} className="flex items-center py-1 px-1.5 rounded cursor-pointer hover:bg-muted/50"
      draggable
      onDragStart={() => handleDragStart(artifact.id)}
      onDragEnd={handleDragEnd}
      onDrop={e => { e.preventDefault(); handleDrop(artifact.id, 'artifact'); }}
      onDragOver={e => e.preventDefault()}
      onMouseEnter={() => setPreviewItem({id: artifact.id, type: 'artifact'})}
      onMouseLeave={() => setPreviewItem(null)}
    >
      <input type="checkbox" checked={!!selectedItems[artifact.id]} onChange={() => toggleSelect(artifact.id)} className="mr-1" />
      <FileCode className="h-4 w-4 mr-1.5 text-amber-500" />
      {/* Favorite button */}
      <button onClick={() => toggleFavorite(artifact.id)} className="ml-1 text-yellow-400 hover:text-yellow-300" title="Favorite">
        {favorites[artifact.id] ? '★' : '☆'}
      </button>
      <span>{artifact.title}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => handleShare(artifact.id, 'artifact')} title="Share"><Share2 className="h-4 w-4" /></Button>
      {/* Version history button */}
      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => setShowVersionHistory({id: artifact.id, type: 'artifact'})} title="Version History">⏳</Button>
      {/* Tagging, favorite, pin, preview, etc. (scaffold) */}
      <div className="ml-auto flex gap-1">
        {(artifact.tags || []).map(tag => (
          <span key={tag} className="text-xs rounded-full bg-blue-500 text-white px-2 py-0.5">
            {tag}
            <button onClick={() => handleRemoveTag(artifact.id, 'artifact', tag)} className="ml-1 text-white/70 hover:text-white">
              &times;
            </button>
          </span>
        ))}
        <button onClick={() => handleAddTag(artifact.id, 'artifact', 'new-tag')} className="text-blue-400 hover:underline">
          + Add Tag
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Animated sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transition-[width] duration-300 ease-in-out shadow-lg p-4
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: 'width' }}
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            {!isCollapsed && <h2 className="text-lg font-bold">Explorer</h2>}
            {!isCollapsed && (
              <Button variant="ghost" size="sm" onClick={() => handleCreateFolder()}>
                <FolderPlus className="w-4 h-4" />
              </Button>
            )}
          </div>
          {/* Search bar */}
          {!isCollapsed && (
            <div className="mb-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search folders or artifacts..."
                className="w-full h-8"
                aria-label="Search folders or artifacts"
              />
            </div>
          )}
          {/* Sorting and filtering controls */}
          {!isCollapsed && (
            <div className="mb-2 flex gap-2 items-center">
              <label>Sort by:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-gray-800 text-white rounded px-2 py-1">
                <option value="name">Name</option>
                <option value="date">Date</option>
              </select>
              <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="ml-1 px-2 py-1 rounded bg-gray-700">{sortOrder === 'asc' ? '↑' : '↓'}</button>
              <label className="ml-4">Type:</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="bg-gray-800 text-white rounded px-2 py-1">
                <option value="all">All</option>
                <option value="folder">Folders</option>
                <option value="artifact">Artifacts</option>
              </select>
              <label className="ml-4">Tag:</label>
              <select value={tagFilter || ''} onChange={e => setTagFilter(e.target.value || null)} className="bg-gray-800 text-white rounded px-2 py-1">
                <option value="">All</option>
                {/* TODO: Populate with unique tags from folders/artifacts */}
              </select>
            </div>
          )}
          {/* Bulk actions toolbar */}
          {!isCollapsed && selectedCount > 0 && (
            <div className="mb-2 flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
              <Button size="sm" onClick={handleBulkMove}>Move</Button>
              <Button size="sm" onClick={clearSelection}>Clear</Button>
            </div>
          )}
          {/* Export/Import buttons */}
          {!isCollapsed && (
            <div className="mb-2 flex gap-2">
              <Button size="sm" onClick={handleExport}>Export</Button>
              <label className="inline-block">
                <span className="sr-only">Import</span>
                <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                <Button size="sm" asChild>Import</Button>
              </label>
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-y-auto">
              {folderTree.map(renderFolder)}
              {filteredArtifacts
                .filter(a => !a.folderId)
                .map(renderArtifact)}
            </div>
          )}
        </div>
      </div>
      {/* Share modal (scaffold) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black rounded shadow-lg p-6 min-w-[320px]">
            <h3 className="font-bold mb-2">Share {showShareModal.type === 'folder' ? 'Folder' : 'Artifact'}</h3>
            <div className="mb-2">(Sharing UI not yet implemented)</div>
            <Button onClick={() => setShowShareModal(null)}>Close</Button>
          </div>
        </div>
      )}
      {/* Preview panel (scaffold) */}
      {previewItem && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white text-black shadow-lg z-50 p-4">
          <h3 className="font-bold mb-2">Preview {previewItem.type === 'folder' ? 'Folder' : 'Artifact'}</h3>
          {/* TODO: Show preview details based on previewItem */}
          <div>(Preview details not yet implemented)</div>
          <Button onClick={() => setPreviewItem(null)} className="mt-2">Close</Button>
        </div>
      )}
      {/* Version history modal (scaffold) */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black rounded shadow-lg p-6 min-w-[320px]">
            <h3 className="font-bold mb-2">Version History</h3>
            <div className="mb-2">(Version history UI not yet implemented)</div>
            <Button onClick={() => setShowVersionHistory(null)}>Close</Button>
          </div>
        </div>
      )}
      {/* Show offline banner if offline */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-1 z-50">Offline mode: changes will sync when back online.</div>
      )}
      {!isCollapsed && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />}
    </>
  );
}
