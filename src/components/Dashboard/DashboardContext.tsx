import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService, type ArtifactData, type FolderData } from '@/lib/services/db';
import { authService, type AuthState } from '@/lib/services/auth';
import { toast } from 'sonner';
import { getFileTypeFromLanguage } from '@/lib/utils/fileTypes';
import { type LayoutState } from './types';

interface DashboardContextType {
  artifacts: ArtifactData[];
  selectedArtifactId: string | null;
  currentArtifact: ArtifactData | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setSelectedArtifactId: (id: string | null) => void;
  createArtifact: (type: string, template?: any) => Promise<void>;
  saveArtifact: (artifact: ArtifactData) => Promise<void>;
  deleteArtifact: (id: string) => Promise<void>;
  forkArtifact: (artifact: ArtifactData) => Promise<void>;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  folders: FolderData[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  shareFolder: (folderId: string, emails: string[]) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  layout: LayoutState;
  setLayout: (state: Partial<LayoutState>) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("artifacts");
  const [authState, setAuthState] = useState(authService.getAuthState());
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [layout, setLayoutState] = useState<LayoutState>({
    showExplorer: true,
    showPromptPanel: false,
    showGitPanel: false,
    showQuickActions: false,
    showSaaS: false,
    showStats: true, // Added showStats
    activeTab: 'artifacts',
    tabVisibility: {
      artifacts: true,
      folders: false,
      pseudocode: false
    }
  });

  const setLayout = useCallback((newState: Partial<LayoutState>) => {
    setLayoutState(prev => ({ ...prev, ...newState }));
  }, []);

  // Fetch artifacts when auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  // Load artifacts and folders when user changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      fetchArtifacts();
      fetchFolders();
    }
  }, [authState.user?.id]);

  // Fetch user artifacts
  const fetchArtifacts = useCallback(async () => {
    if (!authState.user?.id) return;
    
    setLoading(true);
    try {
      const userArtifacts = await dbService.getArtifactsByUser(authState.user.id);
      setArtifacts(userArtifacts);
    } catch (error) {
      console.error("Failed to fetch artifacts:", error);
      toast.error("Failed to load artifacts");
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  // Fetch user folders
  const fetchFolders = useCallback(async () => {
    if (!authState.user?.id) return;
    
    try {
      const userFolders = await dbService.getFoldersByUser(authState.user.id);
      setFolders(userFolders);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      toast.error("Failed to load folders");
    }
  }, [authState.user?.id]);

  // Update current artifact when selection changes
  useEffect(() => {
    if (selectedArtifactId) {
      const artifact = artifacts.find(a => a.id === selectedArtifactId);
      setCurrentArtifact(artifact || null);
      
      // Determine correct tab based on artifact type
      if (artifact) {
        determineActiveTab(artifact);
      }
    } else {
      setCurrentArtifact(null);
    }
  }, [selectedArtifactId, artifacts]);

  // Determine the appropriate tab for an artifact
  const determineActiveTab = (artifact: ArtifactData) => {
    if (artifact.language === 'project-spec') {
      try {
        const content = JSON.parse(artifact.content || '{}');
        if (content.marketingPlanData) setActiveTab('marketing');
        else if (content.fundraisingPlanData) setActiveTab('funding');
        else if (content.budgetPlanData) setActiveTab('budget');
        else if (content.sharesPlanData) setActiveTab('shares');
        else if (content.startupPlanData) setActiveTab('startup');
        else if (content.objectivesPlanData) setActiveTab('objectives');
        else if (content.type === 'sprint') setActiveTab('sprint');
        else setActiveTab('project');
      } catch (e) {
        setActiveTab('artifacts');
      }
    } else {
      setActiveTab('artifacts');
    }
  };

  // Create new artifact
  const createArtifact = useCallback(async (type: string, template?: any) => {
    if (!authState.user?.id) {
      toast.error("You need to be logged in to create artifacts");
      return;
    }

    try {
      const newArtifact: Partial<ArtifactData> = {
        userId: authState.user.id,
        title: `New ${type}`,
        language: type === 'code' ? 'javascript' : 'project-spec',
        fileType: type === 'code' ? 'js' : 'json',
        content: type === 'code' ? '' : JSON.stringify(template || {}, null, 2),
        tags: [type],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };

      const created = await dbService.createArtifact(newArtifact);
      setArtifacts(prev => [created, ...prev]);
      setSelectedArtifactId(created.id);
      toast.success(`Created new ${type}`);
    } catch (error) {
      console.error("Failed to create artifact:", error);
      toast.error("Failed to create artifact");
    }
  }, [authState.user?.id]);

  // Save artifact changes
  const saveArtifact = useCallback(async (updatedArtifact: ArtifactData) => {
    try {
      // Ensure fileType matches language
      if (updatedArtifact.language !== 'project-spec') {
        updatedArtifact.fileType = getFileTypeFromLanguage(updatedArtifact.language);
      } else {
        updatedArtifact.fileType = 'json';
      }
      
      const saved = await dbService.saveArtifact(updatedArtifact);
      
      // Update artifacts list
      setArtifacts(prev => 
        prev.map(a => a.id === saved.id ? saved : a)
      );
      
      toast.success("Artifact saved successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save artifact:", error);
      toast.error("Failed to save artifact");
    }
  }, []);

  // Delete artifact
  const deleteArtifact = useCallback(async (id: string) => {
    try {
      await dbService.deleteArtifact(id);
      setArtifacts(prev => prev.filter(a => a.id !== id));
      
      if (selectedArtifactId === id) {
        setSelectedArtifactId(null);
      }
      
      toast.success("Artifact deleted");
    } catch (error) {
      console.error("Failed to delete artifact:", error);
      toast.error("Failed to delete artifact");
    }
  }, [selectedArtifactId]);

  // Fork an artifact
  const forkArtifact = useCallback(async (artifact: ArtifactData) => {
    if (!authState.user?.id) return;
    
    try {
      const fork: Partial<ArtifactData> = {
        userId: authState.user.id,
        title: `Fork of ${artifact.title}`,
        language: artifact.language,
        fileType: artifact.fileType,
        content: artifact.content,
        tags: [...artifact.tags, 'fork'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };
      
      const created = await dbService.createArtifact(fork);
      setArtifacts(prev => [created, ...prev]);
      setSelectedArtifactId(created.id);
      toast.success("Created fork successfully");
    } catch (error) {
      console.error("Failed to fork artifact:", error);
      toast.error("Failed to fork artifact");
    }
  }, [authState.user?.id]);

  // Create new folder
  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!authState.user?.id) return;
    
    try {
      const newFolder = await dbService.createFolder({
        userId: authState.user.id,
        name,
        parentId,
        isShared: false,
        sharedWith: [],
      });
      
      setFolders(prev => [...prev, newFolder]);
      toast.success("Folder created");
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    }
  }, [authState.user?.id]);

  // Share folder
  const shareFolder = useCallback(async (folderId: string, emails: string[]) => {
    try {
      // This would need to look up users by email first
      // Simplified version:
      const userIds = await Promise.all(emails.map(email => 
        dbService.getUserByEmail(email).then(user => user?.id || '')
      ));
      const validUserIds = userIds.filter(Boolean);
      
      if (validUserIds.length === 0) {
        toast.error("No valid users found");
        return;
      }
      
      const updatedFolder = await dbService.shareFolder(folderId, validUserIds);
      if (updatedFolder) {
        setFolders(prev => prev.map(f => f.id === folderId ? updatedFolder : f));
        toast.success(`Folder shared with ${validUserIds.length} users`);
      }
    } catch (error) {
      console.error("Failed to share folder:", error);
      toast.error("Failed to share folder");
    }
  }, []);

  // Delete folder
  const deleteFolder = useCallback(async (id: string) => {
    try {
      const success = await dbService.deleteFolder(id);
      if (success) {
        setFolders(prev => prev.filter(f => f.id !== id));
        
        // Move artifacts from this folder back to unfiled
        setArtifacts(prev => prev.map(a => 
          a.folderId === id ? {...a, folderId: undefined} : a
        ));
        
        if (selectedFolderId === id) {
          setSelectedFolderId(null);
        }
        
        toast.success("Folder deleted");
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Failed to delete folder");
    }
  }, [selectedFolderId]);

  const value = {
    artifacts,
    selectedArtifactId,
    currentArtifact,
    isEditing,
    setIsEditing,
    setSelectedArtifactId,
    createArtifact,
    saveArtifact,
    deleteArtifact,
    forkArtifact,
    loading,
    activeTab,
    setActiveTab,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    createFolder,
    shareFolder,
    deleteFolder,
    layout,
    setLayout
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
