import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { dbService } from '@/lib/services/db';
import { communityService } from '@/lib/services/community';
import { useDashboard } from './DashboardContext';
import { Button } from '@/components/ui/button';
import '@/styles/dashboard.css';
import { 
  Plus, 
  ArrowUpDown, 
  Search, 
  FolderOpen, 
  BarChart4, 
  FileText,
  ChevronDown,
  BarChart,
  DollarSign,
  PieChart,
  Building,
  Briefcase,
  Layout,
  BookOpen,
  LayoutGrid,
  Rocket,
  TrendingUp,
  Settings2,
  Globe,
  Smartphone,
  Brain,
  Store,
  Dice5,
  Target,
  Layers,
  Building2,
  Gamepad2,
  Brush,
  Code,
  ListTodo,
  Menu,
  X,
  Activity,
  Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from '@/components/UserAvatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { artifactComponentRegistry } from '@/lib/artifactTypes';
import { DocumentExporter } from '../DocumentExporter';
import { DashboardTabs } from './DashboardTabs';
import { UsageStatisticsPage } from '../UsageStatistics/UsageStatisticsPage';
import { ArtifactDetailsPage } from '../ArtifactDetailsPage';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StartupOrgGenerator } from '@/components/StartupOrgGenerator';
import { Gallery } from '../Gallery';
import { GlobalNavbar } from '@/components/GlobalNavbar';
import { TemplateLibrary } from '@/components/TemplateLibrary';
import { SettingsPage } from '@/components/SettingsPage';
import { TemplateBrowserModal } from '@/components/TemplateBrowserModal';
import { PixelAvatar } from '../PixelAvatar';
// import { StartupOrganizationGuideTab } from '@/components/Guides/StartupOrganizationGuideTab';
// import { SaasBootstrapperGuideTab } from '@/components/Guides/SaaSBootstrapperGuideTab';
// import { StartupScalingGuideTab } from '@/components/Guides/StartupScalingGuideTab';
// import { CorporationSetupGuideTab } from '@/components/Guides/CorporationSetupGuideTab';
// import { TermSheetGuideTab } from '@/components/Guides/TermSheetGuideTab';
// import { SaaSFinancialFreedomGuideTab } from '@/components/guides/SaaSFinancialFreedomGuideTab'; // New Guide Tab
// import { PseudocodeViewer } from '@/components/PseudocodeViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PromptGenerator, type PromptType } from '@/components/PromptGenerator'; // Assuming PromptGenerator is a component
import { PseudocodeGenerator } from '@/lib/templates/PseudocodeGenerator'; // Assuming PseudocodeGenerator is a component
import { useAuthContext } from '@/lib/context/AuthContext';
import type { TemplateVariables } from '@/lib/promptTemplates';
import type { ArtifactData } from '@/lib/services/db';
import { Badge } from '@/components/ui/badge';
import { CardDescription } from '@/components/ui/card';
import { CommunityFeed } from './CommunityFeed';
import { CommunityPostComposer } from './CommunityPostComposer';
import { CommunityExternalFeed } from './CommunityExternalFeed';
import { MyArtifactsSection } from './MyArtifactsSection';

// --- Dashboard Pseudocode Scaffold ---
// Authentication State:
//   - If not authenticated, show login/register form
//   - If authenticated as user:
//       - Show user's artifacts (filtered by userId)
//       - Show "Create Artifact" button
//       - Show "Gallery" (public artifacts from all users)
//       - Each artifact: Edit/Delete/Share/Like/Star
//       - Share modal: toggle isPublic, add emails, generate/copy short URL
//   - If authenticated as admin:
//       - Show all users, all artifacts, admin controls
//   - Pixel avatars: use avatarSeed/bannerSeed to render unique icons
//
// Gallery of Applets:
//   - Accessible to all users and guests if artifact.isPublic
//   - Render pixel avatars for each artifact/user
//   - <PixelatedAvatar seed={artifact.avatarSeed || artifact.id} />
//   - <PixelBanner seed={artifact.bannerSeed || artifact.id} />
//
// Pixel Avatar API endpoint (Bun server):
//   - GET /api/avatar/:seed returns a deterministic SVG or PNG
//   - Use in <img src={`/api/avatar/${seed}`} />
//
// Default port for Bun server should be set to 3693
//
// See backend/server.ts for API endpoint scaffolding

export function DashboardLayout() {
  const { layout, setLayout, 
    artifacts, 
    selectedArtifactId, 
    setSelectedArtifactId,
    currentArtifact,
    isEditing,
    setIsEditing,
    saveArtifact,
    deleteArtifact,
    forkArtifact,
    // createArtifact,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    createFolder,
    shareFolder,
    deleteFolder,
  } = useDashboard();

  const { authState } = useAuthContext();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // State for navigation theme
  const [navTheme, setNavTheme] = useState<'light' | 'dark'>('light');
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for showing specialized pages/modals
  const [showStatistics, setShowStatistics] = useState(false);
  const [showStartupOrgGenerator, setShowStartupOrgGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'my-artifacts' | 'details' | 'create' | 'settings' | 'dashboard' | 'community'>('gallery');
  const [selectedArtifactUuid, setSelectedArtifactUuid] = useState<string | null>(null);

  const [showCustomTemplateManager, setShowCustomTemplateManager] = useState(false);

  const [showPromptGeneratorModal, setShowPromptGeneratorModal] = useState(false);
  const [activePromptTypeForModal, setActivePromptTypeForModal] = useState<string | null>(null);

  // New state for PseudocodeGenerator modal
  const [showPseudocodeGeneratorModal, setShowPseudocodeGeneratorModal] = useState(false);
  const [activePseudocodeTypeForModal, setActivePseudocodeTypeForModal] = useState<string | null>(null);

  // Gemini API key state
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [showGeminiKeyModal, setShowGeminiKeyModal] = useState(false);
  const geminiKeyInputRef = useRef<HTMLInputElement>(null);

  // New template library and settings state
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);

  // Community tab state
  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  // Filter artifacts
  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || artifact.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  }).map(artifact => ({
    ...artifact,
    avatarSeed: artifact.avatarSeed || artifact.id
  }));

  // Render the appropriate component for the current artifact
  const renderArtifactComponent = () => {
    if (!currentArtifact) return null;
    
    const ComponentToRender = isEditing 
      ? artifactComponentRegistry.getEditorComponent(currentArtifact)
      : artifactComponentRegistry.getViewerComponent(currentArtifact);
    
    return (
      <ComponentToRender
        artifact={currentArtifact}
        onSave={saveArtifact}
        onEdit={() => setIsEditing(true)}
        // onDelete prop removed to match expected props
        onFork={() => forkArtifact(currentArtifact)}
      />
    );
  };

  // Declare createArtifact before using it
  const createArtifact = async (
    type: string,
    content?: any, // Changed from string to any to accommodate various artifact types
    title?: string,
    language?: string,
    metadata?: any
  ) => {
    if (!authState.user) {
      toast.error('You must be logged in to create artifacts.');
      return;
    }

    let artifactTitle = title || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    let artifactContent = content || '';
    let artifactLanguage = language;
    let artifactMetadata = metadata || {};

    if (type === 'prompt') {
      artifactTitle = title || `Prompt: ${metadata?.promptName || 'Untitled'}`;
      artifactContent = content; // content is the generated prompt string
      artifactMetadata = { ...metadata, promptType: activePromptTypeForModal };
      closePromptGeneratorModal();
    } else if (type === 'pseudocode') {
      artifactTitle = title || `Pseudocode: ${metadata?.generatorType || 'Untitled'}`;
      artifactContent = content; // content is the generated pseudocode string
      artifactLanguage = metadata?.language || 'plaintext'; // Or derive from pseudocode type
      artifactMetadata = { ...metadata, pseudocodeType: activePseudocodeTypeForModal };
      closePseudocodeGeneratorModal();
    } else if (type === 'organization') {
        artifactTitle = title || `Startup Org: ${content.companyName || 'Untitled'}`;
        // content is already the StartupOrgData object
        artifactMetadata = { ...metadata, orgData: content };
        setShowStartupOrgGenerator(false); // Close its specific modal if it has one
    }

    try {
      const newArtifact = await dbService.createArtifact({
        userId: authState.user.id,
        title: artifactTitle,
        type: type, // Use string instead of ArtifactData['type']
        content: typeof artifactContent === 'string' ? artifactContent : JSON.stringify(artifactContent),
        language: artifactLanguage,
        folderId: selectedFolderId,
        metadata: artifactMetadata,
      });
      // setArtifacts(prev => [newArtifact, ...prev]);
      setSelectedArtifactId(newArtifact.id);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} artifact created: ${newArtifact.title}`);
      
      // Close modals after creation
      if (showPromptGeneratorModal) closePromptGeneratorModal();
      if (showPseudocodeGeneratorModal) closePseudocodeGeneratorModal();
      if (showStartupOrgGenerator) setShowStartupOrgGenerator(false);

    } catch (error) {
      console.error('Failed to create artifact:', error);
      toast.error(`Failed to create ${type} artifact.`);
    }
  };

  // Prepare tabs content for the left sidebar
  const tabsContent = (
    <DashboardTabs
      layout={layout}
      setLayout={setLayout}
      artifacts={filteredArtifacts}
      selectedArtifactId={selectedArtifactId}
      setSelectedArtifactId={setSelectedArtifactId}
      viewMode={viewMode}
      folders={folders}
      selectedFolderId={selectedFolderId}
      setSelectedFolderId={setSelectedFolderId}
      createFolder={createFolder}
      shareFolder={shareFolder}
      deleteFolder={deleteFolder}
      createArtifact={createArtifact}
    />
  );

  // If showing statistics, render the statistics page
  if (showStatistics) {
    return (
      <UsageStatisticsPage 
        userId={authState.user?.id || 'guest'} 
        onBack={() => setShowStatistics(false)} 
      />
    );
  }

  // If showing startup org generator, render that component
  if (showStartupOrgGenerator) {
    return (
      <div className="h-screen p-4 overflow-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setShowStartupOrgGenerator(false)}>
            Back to Dashboard
          </Button>
        </div>
        <StartupOrgGenerator 
          onSave={(data) => {
            createArtifact('organization', data);
            setShowStartupOrgGenerator(false);
          }} 
        />
      </div>
    );
  }

  // Handlers for PromptGenerator modal
  const openPromptGeneratorModal = (promptType: string) => {
    setActivePromptTypeForModal(promptType);
    setShowPromptGeneratorModal(true);
  };
  const closePromptGeneratorModal = () => {
    setShowPromptGeneratorModal(false);
    setActivePromptTypeForModal(null);
  };

  // Handlers for PseudocodeGenerator modal
  const openPseudocodeGeneratorModal = (generatorType: string) => {
    setActivePseudocodeTypeForModal(generatorType);
    setShowPseudocodeGeneratorModal(true);
  };
  const closePseudocodeGeneratorModal = () => {
    setShowPseudocodeGeneratorModal(false);
    setActivePseudocodeTypeForModal(null);
  };

  // On mount, check for API key in memory cache/db (stubbed for now)
  useEffect(() => {
    // TODO: Replace with real memory cache/db lookup
    const cached = window.sessionStorage.getItem('geminiApiKey');
    if (!cached) setShowGeminiKeyModal(true);
    else setGeminiApiKey(cached);
  }, []);

  // Save API key to memory cache/db (stubbed for now)
  const handleSaveGeminiKey = () => {
    const key = geminiKeyInputRef.current?.value.trim();
    if (key) {
      setGeminiApiKey(key);
      window.sessionStorage.setItem('geminiApiKey', key); // Replace with secure cache/db in production
      setShowGeminiKeyModal(false);
    }
  };

  // Tab content renderers
  const renderTabContent = () => {
    if (activeTab === 'gallery') {
      return <Gallery onSelectArtifact={id => { setSelectedArtifactUuid(id); setActiveTab('details'); }} />;
    }
    if (activeTab === 'my-artifacts') {
      // Show artifacts user can edit or that are shared with them
      const editableArtifacts = artifacts.filter(a => a.userId === authState.user?.id || a.sharedWith?.includes(authState.user?.id));
      return (
        <MyArtifactsSection
          artifacts={editableArtifacts}
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          onSelectArtifact={id => { setSelectedArtifactUuid(id); setActiveTab('details'); }}
          onCreateArtifact={() => setActiveTab('create')}
        />
      );
    }
    if (activeTab === 'create') {
      return (
        <div className="p-2 sm:p-4">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Create New Artifact</h2>
          
          {/* Quick Create Options - Mobile Optimized */}
          <div className="dashboard-create-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <Card className="dashboard-artifact-card cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-blue-400">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Code Snippet</h3>
                <p className="text-xs text-gray-500 mb-3">Create a reusable code snippet</p>
                <Button 
                  size="sm" 
                  className="dashboard-button w-full"
                  onClick={() => createArtifact('code', '', 'New Code Snippet', 'javascript')}
                >
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-artifact-card cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-green-400">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Document</h3>
                <p className="text-xs text-gray-500 mb-3">Write documentation or notes</p>
                <Button 
                  size="sm" 
                  className="dashboard-button w-full"
                  onClick={() => createArtifact('document', '', 'New Document', 'markdown')}
                >
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-artifact-card cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-purple-400">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">AI Prompt</h3>
                <p className="text-xs text-gray-500 mb-3">Generate AI prompts</p>
                <Button 
                  size="sm" 
                  className="dashboard-button w-full"
                  onClick={() => openPromptGeneratorModal('general')}
                >
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-artifact-card cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-orange-400">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ListTodo className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Pseudocode</h3>
                <p className="text-xs text-gray-500 mb-3">Plan code structure</p>
                <Button 
                  size="sm" 
                  className="dashboard-button w-full"
                  onClick={() => openPseudocodeGeneratorModal('algorithm')}
                >
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-artifact-card cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-indigo-400">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Startup Org</h3>
                <p className="text-xs text-gray-500 mb-3">Organization structure</p>
                <Button 
                  size="sm" 
                  className="dashboard-button w-full"
                  onClick={() => setShowStartupOrgGenerator(true)}
                >
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-artifact-card cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-gray-400">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-sm mb-1">Custom</h3>
                <p className="text-xs text-gray-500 mb-3">Create from template</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="dashboard-button w-full"
                  onClick={() => setShowCustomTemplateManager(true)}
                >
                  Browse
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Creation Options */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-base mb-3">Advanced Options</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto justify-start"
                onClick={() => setShowStatistics(true)}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Import from File
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto justify-start ml-0 sm:ml-2"
                onClick={() => setShowTemplateBrowser(true)}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'settings') {
      return (
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Settings</h2>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </div>
          </div>
          
          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <BarChart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Usage Statistics</h3>
                    <p className="text-xs text-gray-500">View your activity</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowStatistics(true)}
                >
                  View Stats
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Startup Org Generator</h3>
                    <p className="text-xs text-gray-500">Create organization charts</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowStartupOrgGenerator(true)}
                >
                  Open Generator
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">AI Settings</h3>
                    <p className="text-xs text-gray-500">Configure API keys</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowGeminiKeyModal(true)}
                >
                  Configure AI
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <LayoutGrid className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Template Library</h3>
                    <p className="text-xs text-gray-500">Browse templates</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowTemplateLibrary(true)}
                >
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Settings2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Advanced Settings</h3>
                    <p className="text-xs text-gray-500">Full settings page</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowSettingsPage(true)}
                >
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    if (activeTab === 'details' && selectedArtifactUuid) {
      return <ArtifactDetailsPage uuid={selectedArtifactUuid} />;
    }
    if (activeTab === 'dashboard') {
      return (
        <div className="dashboard-tab space-y-6 p-4">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="text-2xl font-bold">Welcome, {authState.user?.email || 'User'}!</h1>
            <div className="quick-start-buttons mt-4 flex space-x-4">
              <Button variant="default" onClick={() => setActiveTab('create')}>Upload Artifact</Button>
              <Button variant="outline" onClick={() => setActiveTab('my-artifacts')}>Create New Bin</Button>
            </div>
          </div>

          {/* Key Stats Section */}
          <div className="key-stats grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="text-lg font-semibold">Total Artifacts</h3>
              <p className="text-xl">{artifacts.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold">Total Bins</h3>
              <p className="text-xl">{folders.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold">Storage Usage</h3>
              <p className="text-xl">{calculateStorageUsage()} MB</p>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="recent-activity">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <ul className="list-disc pl-5">
              {artifacts.slice(0, 5).map((artifact) => (
                <li key={artifact.id}>{artifact.title} - {new Date(artifact.createdAt).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>

          {/* Pinned Bins Section */}
          <div className="pinned-bins">
            <h3 className="text-lg font-semibold">Pinned Bins</h3>
            <ul className="list-disc pl-5">
              {folders.filter(folder => folder.isPinned).map((folder) => (
                <li key={folder.id}>{folder.name} - Last Updated: {new Date(folder.updatedAt).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>

          {/* Expiring Artifacts Section */}
          <div className="expiring-artifacts">
            <h3 className="text-lg font-semibold">Expiring Artifacts</h3>
            <ul className="list-disc pl-5">
              {artifacts.filter(artifact => {
                const expiryDate = new Date(artifact.metadata?.expiryDate);
                return expiryDate && expiryDate > new Date() && expiryDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              }).map(artifact => (
                <li key={artifact.id}>{artifact.title} - Expires: {new Date(artifact.metadata?.expiryDate).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>

          {/* Recent Uploads Section */}
          <div className="recent-uploads">
            <h3 className="text-lg font-semibold">Recent Uploads</h3>
            <ul className="list-disc pl-5">
              {artifacts.slice(0, 5).map(upload => (
                <li key={upload.id}>{upload.title} - {upload.fileType}</li>
              ))}
            </ul>
          </div>

          {/* Shared with Me Section */}
          <div className="shared-with-me">
            <h3 className="text-lg font-semibold">Shared with Me</h3>
            <ul className="list-disc pl-5">
              {artifacts.filter(artifact => artifact.sharedWith?.includes(authState.user?.id)).map(shared => (
                <li key={shared.id}>{shared.title} - Owner: {shared.userId}</li>
              ))}
            </ul>
          </div>

          {/* Integrations & Automation Summary */}
          <div className="integrations-summary">
            <h3 className="text-lg font-semibold">Integrations & Automation</h3>
            <p>Last CI/CD Upload: {new Date().toLocaleDateString()}</p>
            <p>Webhook Activity: Active</p>
          </div>

          {/* Developer-Centric Widgets */}
          <div className="developer-widgets">
            <h3 className="text-lg font-semibold">Developer Tools</h3>
            <p>CLI/API Status: Connected</p>
            <p>Upload Logs: No Errors</p>
          </div>

          {/* Social Feed Section */}
          <div className="social-feed">
            <h3 className="text-lg font-semibold">Social Feed</h3>
            <ul className="list-disc pl-5">
              <li><a href="https://dev.to" target="_blank" rel="noopener noreferrer">Explore projects on Dev.to</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">Discover repositories on GitHub</a></li>
              <li><a href="https://hashnode.com" target="_blank" rel="noopener noreferrer">Connect with developers on Hashnode</a></li>
              <li><a href="https://www.reddit.com/r/programming/" target="_blank" rel="noopener noreferrer">Join discussions on r/programming</a></li>
              <li><a href="https://stackoverflow.com" target="_blank" rel="noopener noreferrer">Share knowledge on Stack Overflow</a></li>
            </ul>
          </div>

          {/* Monthly Quota Section */}
          <div className="monthly-quota">
            <h3 className="text-lg font-semibold">Monthly Hosting Quota</h3>
            <p className="text-sm">All users receive <strong>1GB</strong> of free web hosting bandwidth for their hosted SPA widget applications.</p>
          </div>
        </div>
      );
    }
    if (activeTab === 'community') {
      if (loadingCommunity) {
        return <div className="p-8 text-center text-gray-500">Loading community...</div>;
      }
      return (
        <div className="dashboard-tab space-y-6 p-4">
          {/* Hero Banner / Introduction */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Stay connected to the developer world</h2>
              <p className="text-gray-600 text-sm">Trending discussions, devlogs, CI/CD tips, and more from the ecosystem.</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <a href="https://dev.to/t/devops" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition">Dev.to</a>
              <a href="https://bsky.app" target="_blank" rel="noopener noreferrer" className="bg-sky-500 text-white px-4 py-2 rounded font-medium hover:bg-sky-600 transition">Bluesky</a>
            </div>
          </div>
          {/* External Feed Section */}
          <CommunityExternalFeed />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Activity Feed & Calls to Action */}
            <div className="lg:col-span-2 space-y-6">
              {/* Community Post Composer */}
              <Card>
                <CardContent>
                  <CommunityPostComposer onPost={() => window.location.reload()} />
                </CardContent>
              </Card>
              {/* Community Feed */}
              <CommunityFeed />
              {/* Calls to Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Rocket className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium text-base mb-1">Start a New Discussion</h3>
                    <p className="text-xs text-gray-500 mb-2">Share ideas, ask questions, or propose collaborations.</p>
                    <Button size="sm" variant="default">Start Now</Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Users className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-medium text-base mb-1">Invite Collaborators</h3>
                    <p className="text-xs text-gray-500 mb-2">Grow your team and work together on artifacts.</p>
                    <Button size="sm" variant="default">Invite</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Right: Community Stats, Team, Social Links */}
            <div className="space-y-6">
              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Members</span>
                      <span className="font-bold">{communityStats?.members ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Today</span>
                      <span className="font-bold">{communityStats?.activeToday ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trending Topics</span>
                      <span className="font-bold">{communityStats?.trendingTopics ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Posts</span>
                      <span className="font-bold">{communityStats?.posts ?? '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Team/Collaborator Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {collaborators.length === 0 && (
                      <div className="text-center text-gray-400">No collaborators yet.</div>
                    )}
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{collaborator.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{collaborator.name}</p>
                            <p className="text-xs text-muted-foreground">{collaborator.lastActive}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{collaborator.activityCount}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Social Links & Discovery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social & Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a></li>
                    <li><a href="https://dev.to" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dev.to</a></li>
                    <li><a href="https://stackoverflow.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stack Overflow</a></li>
                    <li><a href="https://hashnode.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Hashnode</a></li>
                    <li><a href="https://www.reddit.com/r/programming/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Reddit</a></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Define tab configuration
  const tabs = [
    { id: 'gallery', label: 'Gallery', icon: LayoutGrid, description: 'Public artifacts' },
    { id: 'my-artifacts', label: 'My Work', icon: FileText, description: 'Your artifacts' },
    { id: 'create', label: 'Create', icon: Plus, description: 'New artifact' },
    { id: 'settings', label: 'Settings', icon: Settings2, description: 'Preferences' },
    { id: 'community', label: 'Community', icon: Users, description: 'Developer news & discussions' },
  ];

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // Welcome Section
  const WelcomeSection = () => (
    <div className="welcome-section">
      <h1 className="text-2xl font-bold">Welcome, {authState.user?.email || 'User'}!</h1>
      <div className="quick-start-buttons mt-4">
        <Button variant="default" onClick={() => setActiveTab('create')}>Create Artifact</Button>
        <Button variant="outline" onClick={() => setActiveTab('gallery')}>View Gallery</Button>
      </div>
    </div>
  );

  // Key Stats Widgets
  const KeyStatsWidgets = () => (
    <div className="key-stats-widgets mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <h2 className="text-lg font-semibold">Total Artifacts</h2>
        <p className="text-xl">{artifacts.length}</p>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold">Total Bins</h2>
        <p className="text-xl">{folders.length}</p>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold">Storage Usage</h2>
        <p className="text-xl">{calculateStorageUsage()} MB</p>
      </div>
    </div>
  );

  // Placeholder for calculateStorageUsage function
  const calculateStorageUsage = () => {
    // Placeholder logic; replace with actual calculation
    return 0;
  };

  // Place these mock data definitions near the top of the DashboardLayout component, after hooks and before renderTabContent
  const mockCommunityActivity = [
    { id: '1', type: 'discussion', description: 'Started a discussion on artifact versioning', timestamp: '2 minutes ago', user: 'John Smith', avatar: 'john' },
    { id: '2', type: 'collaboration', description: 'Collaborated on API Template Collection', timestamp: '10 minutes ago', user: 'Sarah Chen', avatar: 'sarah' },
    { id: '3', type: 'share', description: 'Shared a new bin "Frontend Components"', timestamp: '1 hour ago', user: 'Mike Johnson', avatar: 'mike' },
    { id: '4', type: 'invite', description: 'Invited Lisa Wang to join the team', timestamp: '2 hours ago', user: 'Lisa Wang', avatar: 'lisa' },
    { id: '5', type: 'trending', description: 'Artifact "Database Schema" is trending', timestamp: '3 hours ago', user: 'Alex Rodriguez', avatar: 'alex' },
  ];
  const mockCollaborators = [
    { id: '1', name: 'John Smith', avatar: 'john', activityCount: 12, lastActive: '5 minutes ago' },
    { id: '2', name: 'Sarah Chen', avatar: 'sarah', activityCount: 8, lastActive: '1 hour ago' },
    { id: '3', name: 'Mike Johnson', avatar: 'mike', activityCount: 6, lastActive: '2 hours ago' },
    { id: '4', name: 'Lisa Wang', avatar: 'lisa', activityCount: 5, lastActive: '3 hours ago' },
  ];
  const mockCommunityStats = {
    members: 128,
    activeToday: 34,
    trendingTopics: 5,
    posts: 212,
  };

  // Community data fetching effect
  useEffect(() => {
    if (activeTab === 'community') {
      setLoadingCommunity(true);
      Promise.all([
        communityService.getCommunityPosts(),
        communityService.getCommunityStats(),
        communityService.getCollaboratorHighlights()
      ]).then(([posts, stats, collabs]) => {
        setCommunityPosts(posts);
        setCommunityStats(stats);
        setCollaborators(collabs);
        setLoadingCommunity(false);
      });
    }
  }, [activeTab]);

  return (
    <div className="h-screen flex flex-col overflow-hidden w-full min-w-0 bg-gray-50">
      {/* Global Navigation Header */}
      <GlobalNavbar 
        currentPage={activeTab}
        onNavigate={(page) => {
          if (page === 'dashboard' || page === 'gallery' || page === 'my-work') {
            setActiveTab(page as any);
          }
        }}
        onTemplateLibraryOpen={() => setShowTemplateLibrary(true)}
        onSettingsOpen={() => setShowSettingsPage(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto w-full min-w-0">
        <div className="h-full dashboard-tab-content">
          {renderTabContent()}
        </div>
      </main>

      {/* Template Library Modal */}
      <TemplateLibrary 
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelectTemplate={(template) => {
          // Handle template selection - create artifact from template
          createArtifact(template.type, '', template.name, template.language, { 
            templateId: template.id,
            templateName: template.name 
          });
          setShowTemplateLibrary(false);
        }}
      />

      {/* Template Browser Modal */}
      {showTemplateBrowser && (
        <TemplateBrowserModal
          onClose={() => setShowTemplateBrowser(false)}
          onSelectTemplate={(template) => {
            // Handle template selection - create artifact from template
            createArtifact(template.type, '', template.name, template.language, { 
              templateId: template.id,
              templateName: template.name 
            });
            setShowTemplateBrowser(false);
          }}
        />
      )}

      {/* Settings Page Modal */}
      {showSettingsPage && (
        <SettingsPage 
          isOpen={showSettingsPage}
          onClose={() => setShowSettingsPage(false)}
        />
      )}

      {/* Modals remain the same */}
      {/* Prompt Generator Modal */}
      <Dialog open={showPromptGeneratorModal} onOpenChange={setShowPromptGeneratorModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Generate Prompt: {activePromptTypeForModal ? activePromptTypeForModal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}</DialogTitle>
            <DialogDescription>Fill in the details below to generate a tailored prompt.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1">
            {activePromptTypeForModal && (
              <PromptGenerator onSave={function (generatedPrompt: string, inputs: TemplateVariables, promptType: PromptType): void {
                throw new Error('Function not implemented.');
              } } />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Pseudocode Generator Modal */}
      <Dialog open={showPseudocodeGeneratorModal} onOpenChange={setShowPseudocodeGeneratorModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Generate Pseudocode/Spec: {activePseudocodeTypeForModal ? activePseudocodeTypeForModal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}</DialogTitle>
            <DialogDescription>Configure the details to generate your specification or pseudocode.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-1">
            {activePseudocodeTypeForModal && (
              <PseudocodeGenerator
                initialGenerationType={activePseudocodeTypeForModal as any}
                onSave={(code, metadata) => {
                  return createArtifact('pseudocode', code, `Pseudocode: ${metadata?.type || activePseudocodeTypeForModal}`, metadata?.language, { generatorType: activePseudocodeTypeForModal, ...metadata });
                }}
                onClose={closePseudocodeGeneratorModal}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Gemini API Key Modal */}
      <Dialog open={showGeminiKeyModal} onOpenChange={setShowGeminiKeyModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your Gemini API Key</DialogTitle>
            <DialogDescription>
              To enable AI-powered code suggestions and summaries, please enter your Gemini API key. You can get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Google AI Studio</a>.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={geminiKeyInputRef}
            type="password"
            className="w-full border rounded p-2 mb-2"
            placeholder="Paste your Gemini API key here"
            autoFocus
          />
          <Button onClick={handleSaveGeminiKey} className="w-full">Save API Key</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
