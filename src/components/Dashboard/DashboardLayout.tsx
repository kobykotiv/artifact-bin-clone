import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from './DashboardContext';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ArrowUpDown, 
  Search, 
  FolderOpen, 
  BarChart4, 
  FileText,
  ChevronDown 
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
import { StartupOrgGenerator } from '../StartupOrgGenerator';

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
    createArtifact,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    createFolder,
    shareFolder,
    deleteFolder,
    authState
  } = useDashboard();

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="border-b bg-background p-2 flex-shrink-0 sticky-header">
        <div className="large-screen-container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg">Artifact Bin</h1>
            
            {/* File Menu (formerly Quick Actions) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="file-menu-trigger">
                  <FileText className="mr-2 h-4 w-4" />
                  File
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => createArtifact('code')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Code Snippet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createArtifact('project')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLayout({ activeTab: "pseudocode", tabVisibility: { ...layout.tabVisibility, pseudocode: true } })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Pseudocode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowStartupOrgGenerator(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Startup Organization
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedFolderId(null)}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  View All Files
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
              <RadioGroup 
                value={navTheme} 
                onValueChange={(value) => setNavTheme(value as 'light' | 'dark')}
                className="flex items-center space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="light" id="theme-light" />
                  <label htmlFor="theme-light" className="text-sm">Light</label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <label htmlFor="theme-dark" className="text-sm">Dark</label>
                </div>
              </RadioGroup>
              <UserAvatar username="demo-user" />
            </div>
          </div>
        </div>
      </div>

      {/* Main three-panel layout */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Explorer Panel */}
        {layout.showExplorer && (
          <DashboardSidebar
            position="left"
            width={leftSidebarWidth}
            toggleWidth={toggleLeftSidebarWidth}
            theme={navTheme}
            layout={layout}
            setLayout={setLayout}
            leftContent={tabsContent}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-grow overflow-auto">
          <div className="large-screen-container mx-auto p-4 dashboard-content-xl">
            {/* Existing content rendering */}
            {currentArtifact && (
              <Card className="mt-6 xl:mt-8">
                <CardContent className="p-6 xl:p-8">
                  {renderArtifactComponent()}
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Right Sidebar Panels */}
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
  );
}
