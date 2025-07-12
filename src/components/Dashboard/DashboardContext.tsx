import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService, type ArtifactData, type FolderData } from '@/lib/services/db';
import { type UserData } from '@/lib/models/User';
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
  user: UserData; // Add user to context
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children, user }: { children: React.ReactNode, user: UserData }) {
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("artifacts");
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

  // Load artifacts and folders when user changes
  useEffect(() => {
    if (user) {
      fetchArtifacts();
      fetchFolders();
    }
  }, [user]);

  // Fetch user artifacts
  const fetchArtifacts = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userArtifacts = await dbService.getArtifactsByUser(user.id);
      setArtifacts(userArtifacts);
    } catch (error) {
      console.error("Failed to fetch artifacts:", error);
      toast.error("Failed to load artifacts");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch user folders
  const fetchFolders = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userFolders = await dbService.getFoldersByUser(user.id);
      setFolders(userFolders);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      toast.error("Failed to load folders");
    }
  }, [user?.id]);

  // Fetch selected artifact details
  useEffect(() => {
    const fetchSelectedArtifact = async () => {
      if (selectedArtifactId) {
        const artifact = await dbService.getArtifact(selectedArtifactId);
        setCurrentArtifact(artifact);
        setIsEditing(false); // Reset editing state on new selection
      } else {
        setCurrentArtifact(null);
      }
    };
    fetchSelectedArtifact();
  }, [selectedArtifactId]);

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
    if (!user) {
      toast.error("You must be logged in to create an artifact.");
      return;
    }
    
    const newArtifactData: Partial<ArtifactData> = {
      userId: user.id,
      type: type,
      title: template?.title || `New ${type}`,
      content: template?.content || '',
      language: template?.language || (type === 'code' ? 'javascript' : 'text'),
      fileType: getFileTypeFromLanguage(template?.language || (type === 'code' ? 'javascript' : 'text')),
      ...template?.metadata
    };

    try {
      const newArtifact = await dbService.createArtifact(newArtifactData);
      setArtifacts(prev => [newArtifact, ...prev]);
      setSelectedArtifactId(newArtifact.id);
      setIsEditing(true);
      toast.success("New artifact created!");
    } catch (error) {
      console.error("Failed to create artifact:", error);
      toast.error("Failed to create artifact");
    }
  }, [user]);

  // Save artifact changes
  const saveArtifact = useCallback(async (artifact: ArtifactData) => {
    try {
      const updatedArtifact = await dbService.updateArtifact(artifact.id, artifact);
      if (updatedArtifact) {
        setArtifacts(prev => prev.map(a => a.id === artifact.id ? updatedArtifact : a));
        setCurrentArtifact(updatedArtifact);
        setIsEditing(false);
        toast.success("Artifact saved!");
      }
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
      toast.success("Artifact deleted!");
    } catch (error) {
      console.error("Failed to delete artifact:", error);
      toast.error("Failed to delete artifact");
    }
  }, [selectedArtifactId]);

  // Fork an artifact
  const forkArtifact = useCallback(async (artifact: ArtifactData) => {
    if (!user) {
      toast.error("You must be logged in to fork an artifact.");
      return;
    }
    
    const forkData: Partial<ArtifactData> = {
      ...artifact,
      userId: user.id,
      title: `${artifact.title} (forked)`,
      metadata: { ...artifact.metadata, forkedFrom: artifact.id }
    };
    delete forkData.id; // Remove id to create a new one

    try {
      const forkedArtifact = await dbService.createArtifact(forkData);
      setArtifacts(prev => [forkedArtifact, ...prev]);
      setSelectedArtifactId(forkedArtifact.id);
      toast.success("Artifact forked successfully!");
    } catch (error) {
      console.error("Failed to fork artifact:", error);
      toast.error("Failed to fork artifact");
    }
  }, [user]);

  // Create new folder
  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!user) return;
    try {
      const newFolder = await dbService.createFolder({ name, parentId, userId: user.id });
      setFolders(prev => [...prev, newFolder]);
      toast.success("Folder created!");
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    }
  }, [user]);

  const shareFolder = useCallback(async (folderId: string, emails: string[]) => {
    // This is a placeholder for a real sharing implementation
    console.log(`Sharing folder ${folderId} with ${emails.join(', ')}`);
    toast.info("Sharing functionality not yet implemented.");
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      await dbService.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      // Also refetch artifacts as some may have been moved out of the deleted folder
      fetchArtifacts();
      toast.success("Folder deleted!");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Failed to delete folder");
    }
  }, [fetchArtifacts]);

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
    setLayout,
    user, // Provide user in context
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
