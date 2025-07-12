import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dbService } from '@/lib/services/db';
import { type ArtifactData } from '@/lib/services/db';
import { useDashboard } from './DashboardContext';
import { Button } from '@/components/ui/button';
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
  ListTodo
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from '@/components/UserAvatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { artifactComponentRegistry } from '@/lib/artifactTypes';
import { DocumentExporter } from '../DocumentExporter';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTabs } from './DashboardTabs';
import { UsageStatisticsPage } from '../UsageStatistics/UsageStatisticsPage';
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
  
  // State for sidebar width management on large screens
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<'normal' | 'expanded'>('normal');
  const [rightSidebarWidth, setRightSidebarWidth] = useState<'normal' | 'expanded'>('normal');
  
  // State for navigation theme
  const [navTheme, setNavTheme] = useState<'light' | 'dark'>('light');
  
  // State for showing specialized pages/modals
  const [showStatistics, setShowStatistics] = useState(false);
  const [showStartupOrgGenerator, setShowStartupOrgGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showCustomTemplateManager, setShowCustomTemplateManager] = useState(false);

  const [showPromptGeneratorModal, setShowPromptGeneratorModal] = useState(false);
  const [activePromptTypeForModal, setActivePromptTypeForModal] = useState<string | null>(null);

  // New state for PseudocodeGenerator modal
  const [showPseudocodeGeneratorModal, setShowPseudocodeGeneratorModal] = useState(false);
  const [activePseudocodeTypeForModal, setActivePseudocodeTypeForModal] = useState<string | null>(null);

  const [setArtifacts] = useState<ArtifactData[]>([]); // Add missing state

  // Filter artifacts
  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || artifact.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  }).map(artifact => ({
    ...artifact,
    code: artifact.code || '',
    avatarSeed: artifact.avatarSeed || artifact.id
  }));

  // Toggle sidebar width for better use of space on large screens
  const toggleLeftSidebarWidth = () => {
    setLeftSidebarWidth(leftSidebarWidth === 'normal' ? 'expanded' : 'normal');
  };

  const toggleRightSidebarWidth = () => {
    setRightSidebarWidth(rightSidebarWidth === 'normal' ? 'expanded' : 'normal');
  };

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
        onCancel={() => setIsEditing(false)}
        onDelete={() => deleteArtifact(currentArtifact.id)}
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
        type: type as ArtifactData['type'],
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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="border-b bg-background p-2 flex-shrink-0 sticky-header">
        <div className="large-screen-container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg">Artifact Bin</h1>
            
            {/* File Menu in Header */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="file-menu-trigger">
                  <FileText className="mr-2 h-4 w-4" />
                  File
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64"> {/* Increased width for longer items */}
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => createArtifact('code')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Code Artifact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createArtifact('project')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Project Specification
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Business Planning & Strategy</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => createArtifact('marketing')}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Marketing Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createArtifact('fundraising')}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Fundraising Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createArtifact('budget')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Budget Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createArtifact('shares')}>
                  <PieChart className="mr-2 h-4 w-4" />
                  Shares Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createArtifact('startup')}>
                  <Building className="mr-2 h-4 w-4" />
                  Startup Plan Outline {/* Triggers PseudocodeGenerator */}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPromptGeneratorModal('saaSModelCanvas')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  SaaS Model Canvas Prompt
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Creative & Technical Generators</DropdownMenuLabel> {/* New Sub-label */}
                <DropdownMenuItem onClick={() => openPromptGeneratorModal('websiteDesign')}>
                  <Globe className="mr-2 h-4 w-4" /> {/* New Icon */}
                  Website Design Prompt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPromptGeneratorModal('mobileAppConcept')}>
                  <Smartphone className="mr-2 h-4 w-4" /> {/* New Icon */}
                  Mobile App Concept Prompt
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => openPromptGeneratorModal('aiMlAppConcept')}>
                  <Brain className="mr-2 h-4 w-4" /> {/* New Icon */}
                  AI/ML App Concept Prompt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPseudocodeGeneratorModal('shopifyTheme')}> {/* Triggers PseudocodeGenerator */}
                  <Store className="mr-2 h-4 w-4" /> {/* New Icon */}
                  Shopify Theme Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPseudocodeGeneratorModal('boardGameDesign')}> {/* Triggers PseudocodeGenerator */}
                  <Dice5 className="mr-2 h-4 w-4" /> {/* New Icon */}
                  Board Game Design
                </DropdownMenuItem>
                {/* Placeholder for more generators */}
                {/* 
                <DropdownMenuItem onClick={() => openPromptGeneratorModal('threeJsSceneConcept')}>
                  <Box className="mr-2 h-4 w-4" />
                  3D Scene (Three.js) Prompt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPromptGeneratorModal('wordpressThemeBrief')}>
                  <PenTool className="mr-2 h-4 w-4" />
                  WordPress Theme Brief
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPseudocodeGeneratorModal('cardGameDesign')}>
                  <Layers className="mr-2 h-4 w-4" />
                  Card Game Design
                </DropdownMenuItem>
                */}

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Organization & Guides</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowStartupOrgGenerator(true)}>
                  <Layout className="mr-2 h-4 w-4" />
                  Define Org Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('startupOrgGuide')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Startup Organization Guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('saaSBootstrapperGuide')}> {/* New Item */}
                  <Rocket className="mr-2 h-4 w-4" /> {/* Changed Icon */}
                  SaaS Bootstrapper's Guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('saaSFinancialFreedomGuide')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  SaaS Financial Freedom Guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('startupScalingGuide')}> {/* New Item */}
                  <TrendingUp className="mr-2 h-4 w-4" /> {/* Changed Icon */}
                  Startup Scaling Guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('corporation')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Corporation Setup Guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('termsheet')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Term Sheet Guide
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Customization</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowCustomTemplateManager(true)}> {/* New Item - Placeholder */}
                  <Settings2 className="mr-2 h-4 w-4" />
                  Manage Custom Templates
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLayout({ showExplorer: !layout.showExplorer })}
              title={layout.showExplorer ? "Hide explorer" : "Show explorer"}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px] md:w-[400px] xl:w-[500px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-[150px] xl:w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setShowStatistics(true)} title="View Usage Statistics">
                <BarChart4 className="h-4 w-4" />
              </Button>
              {currentArtifact && (
                <DocumentExporter 
                  artifacts={artifacts} 
                  selectedArtifactId={selectedArtifactId} 
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserAvatar username="demo-user" />
            </div>
          </div>
        </div>
      </div>

      {/* Main three-panel layout */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left Explorer Panel */}
        {layout.showExplorer && (
          <div className="hidden md:block h-full">
            <DashboardSidebar
              position="left"
              width={leftSidebarWidth}
              toggleWidth={toggleLeftSidebarWidth}
              theme={navTheme}
              layout={layout}
              setLayout={setLayout}
              leftContent={tabsContent}
            />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-grow overflow-auto w-full">
          <div className="large-screen-container mx-auto p-2 md:p-4 dashboard-content-xl">
            {/* Existing content rendering */}
            {currentArtifact && (
              <Card className="mt-4 md:mt-6 xl:mt-8">
                <CardContent className="p-4 md:p-6 xl:p-8">
                  {renderArtifactComponent()}
                </CardContent>
              </Card>
            )}
            {/* Gallery Component - Public Applets */}
            <Gallery />
          </div>
        </main>

        {/* Right Sidebar Panels */}
        <div className="hidden md:block h-full">
          <DashboardSidebar
            position="right"
            width={rightSidebarWidth}
            toggleWidth={toggleRightSidebarWidth}
            theme={navTheme}
            layout={layout}
            setLayout={setLayout}
            artifacts={artifacts}
            createArtifact={createArtifact}
            setSelectedFolderId={setSelectedFolderId}
          />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#fffbe6] border-t-2 border-[#222] flex md:hidden justify-around items-center py-2 shadow-lg">
        <Button variant="ghost" size="icon" className="neobrutalist-version-btn" aria-label="Home">
          <BarChart4 className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="neobrutalist-version-btn" aria-label="Artifacts">
          <FileText className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="neobrutalist-version-btn" aria-label="Profile">
          <UserAvatar username="demo-user" />
        </Button>
      </nav>

      {/* Prompt Generator Modal */}
      <Dialog open={showPromptGeneratorModal} onOpenChange={setShowPromptGeneratorModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Prompt: {activePromptTypeForModal ? activePromptTypeForModal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}</DialogTitle>
            <DialogDescription>Fill in the details below to generate a tailored prompt.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1">
            {activePromptTypeForModal && (
              <PromptGenerator onSave={function (generatedPrompt: string, inputs: TemplateVariables, promptType: PromptType): void {
                throw new Error('Function not implemented.');
              } }                // This component needs to be adapted to take an initial type and an onSave/onGenerate callback
                // For now, we assume it can be configured or will use its internal state based on a prop
                // This is a placeholder for how it would be integrated.
                // It should call createArtifact('prompt', generatedPromptString, title, null, { promptName: activePromptTypeForModal, inputs: formValues })
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Pseudocode Generator Modal */}
      <Dialog open={showPseudocodeGeneratorModal} onOpenChange={setShowPseudocodeGeneratorModal}>
        <DialogContent className="max-w-4xl"> {/* Adjusted size for PseudocodeGenerator */}
          <DialogHeader>
            <DialogTitle>Generate Pseudocode/Spec: {activePseudocodeTypeForModal ? activePseudocodeTypeForModal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}</DialogTitle>
            <DialogDescription>Configure the details to generate your specification or pseudocode.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-1"> {/* Increased max height */}
            {activePseudocodeTypeForModal && (
              <PseudocodeGenerator
                initialGenerationType={activePseudocodeTypeForModal as any} // Cast as any for now
                onSave={(code, metadata) => {
                  return createArtifact('pseudocode', code, `Pseudocode: ${metadata?.type || activePseudocodeTypeForModal}`, metadata?.language, { generatorType: activePseudocodeTypeForModal, ...metadata });
                }}
                onClose={closePseudocodeGeneratorModal}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
