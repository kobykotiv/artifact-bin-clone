import { useState, useEffect, useMemo, useCallback } from 'react';
import { authService, type AuthState, type UserData } from '@/lib/services/auth'; // Ensure UserData is imported
import { dbService, type ArtifactData } from '@/lib/services/db';
import { UserProfile } from '@/components/UserProfile';
import { ArtifactList } from '@/components/ArtifactList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Plus, Network, Briefcase, ListTodo, Lightbulb, BarChart3, Layout, DollarSign, PieChart, Building, Target, ChevronRight, FolderTree, File, X, FileDown } from 'lucide-react'; // Added Target icon
import { ArtifactViewer } from '@/components/ArtifactViewer';
import { ArtifactEditor } from '@/components/ArtifactEditor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { getLanguageFromFileType, getFileTypeFromLanguage, supportedLanguages } from '@/lib/utils/fileTypes';
import ProjectGenerator from '@/components/ProjectGenerator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SprintPlanner } from '@/components/SprintPlanner';
import { DataPortability } from '@/components/DataPortability';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { BusinessPlanGenerator } from '@/components/BusinessPlanGenerator'; // Import the new component
import { FolderExplorer } from './FolderExplorer';
import { PromptSidebar } from './PromptSidebar';
import { TemplateModal } from '@/components/TemplateModal';
import { ExportModal } from '@/components/ExportModal';
import { exportToMarkdown, exportToPDF } from '@/lib/utils/export';

export function Dashboard() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [userArtifacts, setUserArtifacts] = useState<ArtifactData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Artifact state
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // UI state
  // New state for the explorer layout
  const [showExplorer, setShowExplorer] = useState(true);
  const [showPromptPanel, setShowPromptPanel] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('artifacts'); // Add missing activeTab state
  const [searchQuery, setSearchQuery] = useState<string>(''); // Add missing searchQuery state for search input
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Initialize responsive state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    // Set initial values
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide panels on mobile
  useEffect(() => {
    if (isMobile) {
      setShowExplorer(false);
      setShowPromptPanel(false);
    } else if (isTablet) {
      // On tablet, show explorer but hide prompt panel
      setShowExplorer(true);
      setShowPromptPanel(false);
    }
  }, [isMobile, isTablet]);

  // When selecting an artifact on mobile, hide the explorer
  useEffect(() => {
    if (isMobile && selectedArtifactId) {
      setShowExplorer(false);
    }
  }, [selectedArtifactId, isMobile]);

  // --- Data Fetching ---
  // ...existing code...
  const fetchUserArtifacts = useCallback(async (userId: string) => {
    try {
      const artifacts = await dbService.getArtifactsByUser(userId);
      setUserArtifacts(artifacts);
    } catch (error) {
      console.error("Failed to fetch user artifacts:", error);
      toast.error("Failed to load your artifacts.");
      setUserArtifacts([]); // Reset on error
    }
  }, []); // No dependencies, dbService is stable

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    setLoading(true);
    if (authState.isAuthenticated && authState.user) {
      fetchUserArtifacts(authState.user.id).finally(() => setLoading(false));
    } else {
      setUserArtifacts([]);
      setLoading(false);
    }
    return unsubscribe;
  }, [authState.isAuthenticated, authState.user?.id, fetchUserArtifacts]);


  // --- Dashboard Statistics ---
  // ...existing code...


  // --- Artifact Selection Logic ---
  useEffect(() => {
    if (selectedArtifactId) {
      const found = userArtifacts.find(a => a.id === selectedArtifactId);
      setCurrentArtifact(found || null);
      setIsEditing(false); // Always reset to view mode on selection change

      // Determine which tab to activate based on the selected artifact type
      if (found) {
          if (found.language === 'project-spec') {
              try {
                  const content = JSON.parse(found.content || '{}');
                  // Check for specific plan types within BusinessPlanGenerator
                  const planType = content.marketingPlanData ? 'marketing' :
                                   content.fundraisingPlanData ? 'funding' :
                                   content.budgetPlanData ? 'budget' :
                                   content.sharesPlanData ? 'shares' :
                                   content.startupPlanData ? 'startup' :
                                   content.objectivesPlanData ? 'objectives' : // Check for objectives
                                   content.type?.toLowerCase(); // Fallback to old 'type' field (for sprint)

                  if (planType === 'marketing') setActiveTab('marketing');
                  else if (planType === 'funding') setActiveTab('funding');
                  else if (planType === 'budget') setActiveTab('budget');
                  else if (planType === 'shares') setActiveTab('shares');
                  else if (planType === 'startup') setActiveTab('startup');
                  else if (planType === 'objectives') setActiveTab('objectives'); // Activate objectives tab
                  else if (planType === 'sprint') setActiveTab('sprint');
                  // If it's a project-spec but not a specific plan type, assume it's a generic project
                  else if (!planType && found.title.includes('Project Specification')) setActiveTab('project');
                  // If it's a project-spec and has business plan data, default to the business plan tab (e.g., marketing)
                  else if (content.marketingPlanData || content.fundraisingPlanData || content.budgetPlanData || content.sharesPlanData || content.startupPlanData || content.objectivesPlanData) setActiveTab('marketing'); // Default to marketing if it's a business plan
                  else setActiveTab('artifacts'); // Fallback for other project-spec types
              } catch (e) {
                  console.error("Error parsing artifact content for tab selection:", e);
                  setActiveTab('artifacts'); // Fallback
              }
          } else {
              setActiveTab('artifacts'); // Default for code artifacts
          }
      } else {
          setActiveTab('artifacts'); // Fallback if artifact not found
      }

    } else {
      setCurrentArtifact(null);
      setIsEditing(false);
      setActiveTab('artifacts'); // Default tab when nothing is selected
    }
  }, [selectedArtifactId, userArtifacts]);


  // --- Filtering Logic ---
  // ...existing code...


  // --- Handlers ---
  // ...existing code...
  const handleUserUpdate = useCallback((updatedUser: UserData) => {
    // ...existing code...
  }, [authState.user]);

  const handleSelectArtifact = useCallback((id: string) => {
    setSelectedArtifactId(id);
  }, []);

  // Function to create a specific planning artifact if needed - UPDATED
  const createPlanningArtifact = useCallback((planType: string): ArtifactData | null => {
    if (!authState.user) return null;

    let planTitle = `${planType} Plan`;
    let content: any = {}; // Use 'any' temporarily for flexibility
    let tags = ['plan', planType.toLowerCase()];
    let language = 'project-spec'; // All plans use this language
    let fileType = 'json'; // All plans are stored as JSON

    // Use new schemas for marketing and funding
    if (planType.toLowerCase() === 'marketing') {
      planTitle = 'Marketing Plan';
      content = {
        // No explicit type needed, structure implies it for BusinessPlanGenerator
        marketingPlanData: { audience: 'Gen Z creators', campaignType: 'awareness', channel: 'TikTok ads', budget: '$5,000', kpi: 'signups', timeline: 'Q2 2025' },
      };
      tags = ['plan', 'marketing'];
    } else if (planType.toLowerCase() === 'funding') {
      planTitle = 'Fundraising Plan';
      content = {
        fundraisingPlanData: { stage: 'Seed', amount: '$500K', useOfFunds: 'hiring engineers', sector: 'devtools', closeDate: 'Q3 2025', checklist: { pitchDeck: false, financials: false, marketAnalysis: false, teamBios: false } },
      };
       tags = ['plan', 'funding'];
    } else if (planType.toLowerCase() === 'budget') {
       planTitle = 'Budget Plan';
       content = {
         budgetPlanData: { revenueProjection: '$100K Year 1', costOfGoodsSold: '20%', operatingExpenses: '$50K Year 1', fundingNeeds: '$250K Seed' },
       };
        tags = ['plan', 'budget'];
    } else if (planType.toLowerCase() === 'shares') {
       planTitle = 'Shares Plan';
       content = {
         sharesPlanData: { totalShares: '10,000,000', founderShares: '60%', employeePool: '15%', investorShares: '25%' },
       };
        tags = ['plan', 'shares'];
    } else if (planType.toLowerCase() === 'startup') {
       planTitle = 'Startup Plan';
       content = {
         startupPlanData: { companyName: 'NewCo Inc.', legalStructure: 'Delaware C-Corp', incorporationState: 'Delaware', registeredAgent: 'Standard Agent Services', checklist: { einObtained: false, bankAccountOpened: false, domainRegistered: false, founderAgreements: false } },
       };
        tags = ['plan', 'startup'];
    } else if (planType.toLowerCase() === 'sprint') {
      planTitle = 'Sprint Plan';
      content = {
        type: 'sprint', // SprintPlanner might still use 'type'
        projectName: 'New Project',
        sprints: [], // Initialize sprints array
      };
       tags = ['plan', 'sprint'];
    } else if (planType.toLowerCase() === 'project') {
        // Keep existing project spec structure
        planTitle = 'Untitled Project Specification';
        tags = ['project-spec']; // Keep specific tag
        content = {
            // No explicit 'type' needed if handled by ProjectGenerator
            id: crypto.randomUUID(), // Add internal ID for project data
            name: planTitle,
            description: '', problem: '', customers: '', customerLocation: '',
            applicationType: '', dataModel: '', userRole: '',
            features: [], pseudocode: '', contributors: [authState.user.username || 'You'], forks: 0, stars: 0
        };
    } else if (planType.toLowerCase() === 'objectives') {
        planTitle = 'Objectives Plan';
        content = {
            objectivesPlanData: { goalVerb: 'increase', goalMetric: 'user engagement', goalTarget: 'by 25%', timeframe: 'in Q1', objectiveArea: 'product development', growthStrategy: 'content marketing', actionVerb: 'launch', actionTarget: 'new feature set', kpiMetric: 'daily active users' },
        };
         tags = ['plan', 'objectives'];
    }
     else {
      // Default structure for other types (or handle error)
      console.warn(`Unknown plan type: ${planType}`);
      return null; // Or create a generic structure
    }

    // Add common fields if not already present (like ID, name, createdAt)
    // These are now part of the main artifact, not inside content usually
    // if (!content.id) content.id = crypto.randomUUID(); // Internal ID for the plan data
    // if (!content.name) content.name = title;
    // if (!content.createdAt) content.createdAt = new Date().toISOString();

    const newArtifact: ArtifactData = {
      id: crypto.randomUUID(), // This is the artifact's ID in the DB
      userId: authState.user.id,
      title: planTitle,
      language: language,
      content: JSON.stringify(content, null, 2),
      fileType: fileType,
      tags: tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatarSeed: crypto.randomUUID()
    };

    return newArtifact;
  }, [authState.user]);

  // Modified handleCreateArtifact to potentially create different types
  const handleCreateNew = useCallback((type: 'code' | 'project' | 'business', language?: string) => {
    if (!authState.user) return;

    if (type === 'code') {
      const newArtifact: ArtifactData = {
        id: crypto.randomUUID(),
        userId: authState.user.id,
        title: 'Untitled Code Snippet',
        language: language || 'javascript',
        content: '// Add your code here\n',
        fileType: getFileTypeFromLanguage(language || 'javascript'),
        tags: ['code'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };
      
      setUserArtifacts(prev => [newArtifact, ...prev]);
      setSelectedArtifactId(newArtifact.id);
      setIsEditing(true);
    } else if (type === 'project') {
      const projectArtifact = createPlanningArtifact('project');
      if (projectArtifact) {
        setUserArtifacts(prev => [projectArtifact, ...prev]);
        setSelectedArtifactId(projectArtifact.id);
        setIsEditing(true);
      }
    }
  }, [authState.user, createPlanningArtifact]);

  const handleSaveArtifact = useCallback(async (updatedArtifact: ArtifactData) => {
    if (!authState.user) return;
    try {
      // Ensure fileType matches language if it's a standard code type
      // Keep project-spec/business plans as json
      if (!['project-spec'].includes(updatedArtifact.language)) {
         updatedArtifact.fileType = getFileTypeFromLanguage(updatedArtifact.language);
      } else {
         updatedArtifact.fileType = 'json'; // Ensure specs/plans are saved as json
      }
      await dbService.saveArtifact(updatedArtifact);
      await fetchUserArtifacts(authState.user.id); // Refresh list from source
      // selectedArtifactId remains the same, useEffect will update currentArtifact
      setIsEditing(false);
      toast.success('Artifact saved successfully');
    } catch (error) {
      console.error("Failed to save artifact:", error);
      toast.error("Failed to save artifact");
    }
  }, [authState.user, fetchUserArtifacts]);

  const handleDeleteArtifact = useCallback(async (artifactToDelete: ArtifactData) => {
    if (!authState.user) return;
    try {
      await dbService.deleteArtifact(artifactToDelete.id);
      await fetchUserArtifacts(authState.user.id); // Refresh list from source
      setSelectedArtifactId(null); // Clear selection
      toast.success('Artifact deleted successfully');
    } catch (error) {
      console.error("Failed to delete artifact:", error);
      toast.error("Failed to delete artifact");
    }
  }, [authState.user, fetchUserArtifacts]);

  const handleForkArtifact = useCallback(async (artifactToFork: ArtifactData) => {
    if (!authState.user) return;

    try {
      const forkedArtifact: ArtifactData = {
        ...artifactToFork,
        id: crypto.randomUUID(),
        userId: authState.user.id,
        title: `Fork of ${artifactToFork.title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };

      await dbService.saveArtifact(forkedArtifact);
      await fetchUserArtifacts(authState.user.id);
      setSelectedArtifactId(forkedArtifact.id);
      toast.success('Artifact forked successfully');
    } catch (error) {
      console.error("Failed to fork artifact:", error);
      toast.error("Failed to fork artifact");
    }
  }, [authState.user, fetchUserArtifacts]);

  const handleUpload = useCallback(async (file: File) => {
    if (!authState.user) return;

    try {
      const content = await file.text();
      const fileType = file.name.split('.').pop() || 'txt';
      const language = getLanguageFromFileType(fileType) || 'plaintext';

      const uploadedArtifact: ArtifactData = {
        id: crypto.randomUUID(),
        userId: authState.user.id,
        title: file.name,
        language,
        content,
        fileType,
        tags: ['upload', 'code'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };

      await dbService.saveArtifact(uploadedArtifact);
      await fetchUserArtifacts(authState.user.id);
      setSelectedArtifactId(uploadedArtifact.id);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file");
    }
  }, [authState.user, fetchUserArtifacts]);

  const handleTemplateSelect = useCallback((template: any) => {
    if (template.type === 'code') {
      handleCreateNew('code', template.language);
    } else if (template.type === 'project') {
      handleCreateNew('project');
    } else {
      const art = createPlanningArtifact(template.type);
      if (art) {
        setUserArtifacts(prev => [art, ...prev]);
        setSelectedArtifactId(art.id);
      }
    }
    setShowTemplateModal(false);
  }, [handleCreateNew, createPlanningArtifact]);

  const handleExport = useCallback(async (artifacts: ArtifactData[], format: 'markdown' | 'pdf') => {
    try {
      if (format === 'markdown') {
        const content = await exportToMarkdown(artifacts);
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'artifacts.md';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const content = await exportToPDF(artifacts);
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'artifacts.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }
      setShowExportModal(false);
      toast.success(`Exported ${artifacts.length} artifacts as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export artifacts');
    }
  }, []);

  // --- Render Logic ---
  // ...existing code...
  if (loading) {
    // ...existing code...
  }

  if (!authState.isAuthenticated || !authState.user) {
    // ...existing code...
  }

  // Create a registry of artifact handlers
  const artifactHandlers = useMemo(() => ({
    'project-spec': {
      getComponent: (artifact: ArtifactData, isEditing: boolean) => {
        try {
          const content = JSON.parse(artifact.content || '{}');
          
          // Handle business plan types
          if (content.marketingPlanData || content.fundraisingPlanData || 
              content.budgetPlanData || content.sharesPlanData || 
              content.startupPlanData || content.objectivesPlanData) {
            return isEditing ? BusinessPlanGenerator : BusinessPlanGenerator;
          }
          
          // Handle sprint planning
          if (content.type === 'sprint') {
            return SprintPlanner;
          }
          
          // Handle generic project specs
          return ProjectGenerator;
        } catch (error) {
          console.error("Error parsing artifact content:", error);
          return isEditing ? ArtifactEditor : ArtifactViewer;
        }
      },
      save: handleSaveArtifact,
      delete: handleDeleteArtifact,
      fork: handleForkArtifact
    },
    // Handle other artifact types
    'default': {
      getComponent: (artifact: ArtifactData, isEditing: boolean) => 
        isEditing ? ArtifactEditor : ArtifactViewer,
      save: handleSaveArtifact,
      delete: handleDeleteArtifact,
      fork: handleForkArtifact
    }
  }), [handleSaveArtifact, handleDeleteArtifact, handleForkArtifact]);

  // Function to get the appropriate component for an artifact
  const getArtifactComponent = useCallback((artifact: ArtifactData, isEditing: boolean) => {
    const handler = artifactHandlers[artifact.language] || artifactHandlers.default;
    return handler.getComponent(artifact, isEditing);
  }, [artifactHandlers]);

  // Render artifact in the artifacts tab
  const renderArtifact = () => {
    if (!currentArtifact) return null;
    
    const Component = getArtifactComponent(currentArtifact, isEditing);
    const handler = artifactHandlers[currentArtifact.language] || artifactHandlers.default;
    
    return (
      <Component
        key={currentArtifact.id}
        artifact={currentArtifact}
        onSave={handler.save}
        onFork={handler.fork}
        onCancel={isEditing ? () => setIsEditing(false) : undefined}
        onEdit={!isEditing ? () => setIsEditing(true) : undefined}
      />
    );
  };

  // Group artifacts by folder/category for explorer view
  const artifactsByFolder = useMemo(() => {
    const grouped: Record<string, ArtifactData[]> = {
      "All": [],
      "Code Snippets": [],
      "Project Specs": [],
      "Business Plans": [],
      "Sprint Plans": []
    };
    
    userArtifacts.forEach(artifact => {
      // Add to All category
      grouped["All"].push(artifact);
      
      // Add to specific category based on language/tags
      if (artifact.language === 'project-spec') {
        try {
          const content = JSON.parse(artifact.content || '{}');
          if (content.type === 'sprint') {
            grouped["Sprint Plans"].push(artifact);
          } else if (content.marketingPlanData || content.fundraisingPlanData || 
                     content.budgetPlanData || content.sharesPlanData || 
                     content.startupPlanData || content.objectivesPlanData) {
            grouped["Business Plans"].push(artifact);
          } else {
            grouped["Project Specs"].push(artifact);
          }
        } catch (e) {
          grouped["Project Specs"].push(artifact);
        }
      } else {
        grouped["Code Snippets"].push(artifact);
      }
    });
    
    return grouped;
  }, [userArtifacts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Not Authenticated</h2>
          <p className="text-muted-foreground">Please login to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-background p-2 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg">Artifact Bin</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowExplorer(!showExplorer)}
              title={showExplorer ? "Hide explorer" : "Show explorer"}
            >
              <FolderTree className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search artifacts..."
                className="pl-8 w-[200px] sm:w-[300px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Start</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCreateNew('code')}>
                  <File className="mr-2 h-4 w-4" />
                  Code Artifact
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCreateNew('project')}>
                  <Layout className="mr-2 h-4 w-4" />
                  Project Specification
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTemplateModal(true)}>
                  <Search className="mr-2 h-4 w-4" />
                  Browse all templates...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DataPortability onImportComplete={() => fetchUserArtifacts(authState.user.id)} />
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main three-panel layout */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left panel - Explorer */}
        {showExplorer && (
          <aside className="w-64 border-r bg-muted/20 overflow-hidden flex flex-col">
            <div className="p-2 font-medium border-b flex justify-between items-center">
              <span>EXPLORER</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowExplorer(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ScrollArea className="flex-grow">
              <FolderExplorer
                folders={artifactsByFolder}
                activeArtifactId={selectedArtifactId}
                activeFolderId={activeFolderId}
                onSelectFolder={setActiveFolderId}
                onSelectArtifact={setSelectedArtifactId}
              />
            </ScrollArea>
            
            <div className="border-t p-2">
              <UserProfile userId={authState.user.id} isGuest={authState.isGuest} />
            </div>
          </aside>
        )}

        {/* Center panel - Artifact content */}
        <main className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-auto p-4">
            {currentArtifact ? (
              renderArtifact()
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center max-w-md">
                  <div className="mb-4">
                    <File className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Artifact Selected</h3>
                  <p>
                    {userArtifacts.length > 0
                      ? "Select an artifact from the explorer to view or edit."
                      : "No artifacts found. Create one to get started."}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => handleCreateNew('code')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Artifact
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right panel - Prompt sidebar */}
        {showPromptPanel && (
          <aside className="w-64 border-l bg-muted/20 flex flex-col overflow-hidden">
            <div className="p-2 font-medium border-b flex justify-between items-center">
              <span>CLAUDE ASSISTANT</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setShowPromptPanel(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <PromptSidebar 
              artifactId={selectedArtifactId} 
              artifact={currentArtifact}
            />
          </aside>
        )}
        
        {/* Toggle button for prompt panel when hidden */}
        {!showPromptPanel && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-[50px]"
            onClick={() => setShowPromptPanel(true)}
            title="Show assistant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <TemplateModal 
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        artifacts={userArtifacts}
        onExport={handleExport}
      />
    </div>
  );
}
