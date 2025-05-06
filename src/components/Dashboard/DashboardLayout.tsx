import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from './DashboardContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactList } from '@/components/ArtifactList';
import { artifactComponentRegistry } from '@/lib/artifactTypes';
import { SaaSStrategies } from './SaaSStrategies';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, Search, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FolderView } from './FolderView';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserAvatar } from '@/components/UserAvatar';
import { Root as Collapsible, Trigger as CollapsibleTrigger, Content as CollapsibleContent } from '@radix-ui/react-collapsible';
import PseudocodeGenerator from '@/lib/templates/PseudocodeGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitSidebar } from '../GitSidebar';
import { SuggestionFeed } from '../SuggestionFeed';
import { StatsCard } from './StatsCard';

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
    deleteFolder
  } = useDashboard();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setLayout({
      activeTab: value,
      tabVisibility: {
        ...layout.tabVisibility,
        [value]: true
      }
    });
  }, [layout.tabVisibility, setLayout]);

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="border-b bg-background p-2 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg">Artifact Bin</h1>
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
              <div className="relative w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-[150px]">
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
            </div>
            <UserAvatar username="demo-user" />
          </div>
        </div>
      </div>

      {/* Main three-panel layout */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Explorer Panel */}
        {layout.showExplorer && (
          <aside className="w-64 border-r bg-muted/20 flex flex-col overflow-hidden">
            <ScrollArea className="flex-grow">
              <div className="p-4">
                <Tabs defaultValue="artifacts" value={layout.activeTab} onValueChange={handleTabChange}>
                  <TabsList>
                    <div className="flex items-center">
                      <TabsTrigger 
                        value="artifacts" 
                        className="flex items-center"
                        onClick={() => setLayout({ tabVisibility: { ...layout.tabVisibility, artifacts: !layout.tabVisibility.artifacts } })}
                      >
                        Artifacts
                        {layout.tabVisibility.artifacts ? 
                          <ChevronDown className="ml-2 h-4 w-4" /> : 
                          <ChevronRight className="ml-2 h-4 w-4" />
                        }
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="folders" 
                        className="flex items-center"
                        onClick={() => setLayout({ tabVisibility: { ...layout.tabVisibility, folders: !layout.tabVisibility.folders } })}
                      >
                        Folders
                        {layout.tabVisibility.folders ? 
                          <ChevronDown className="ml-2 h-4 w-4" /> : 
                          <ChevronRight className="ml-2 h-4 w-4" />
                        }
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="pseudocode" 
                        className="flex items-center"
                        onClick={() => setLayout({ tabVisibility: { ...layout.tabVisibility, pseudocode: !layout.tabVisibility.pseudocode } })}
                      >
                        Pseudocode
                        {layout.tabVisibility.pseudocode ? 
                          <ChevronDown className="ml-2 h-4 w-4" /> : 
                          <ChevronRight className="ml-2 h-4 w-4" />
                        }
                      </TabsTrigger>
                    </div>
                  </TabsList>
                  
                  {/* Tab Contents */}
                  <div className="border rounded-lg p-4">
                    {layout.activeTab === "artifacts" && layout.tabVisibility.artifacts && (
                      <ArtifactList
                        artifacts={filteredArtifacts}
                        selectedId={selectedArtifactId}
                        onSelect={setSelectedArtifactId}
                        displayMode={viewMode}
                      />
                    )}
                    
                    {layout.activeTab === "folders" && layout.tabVisibility.folders && (
                      <FolderView
                        folders={folders}
                        artifacts={artifacts}
                        selectedFolderId={selectedFolderId}
                        onSelectFolder={setSelectedFolderId}
                        onCreateFolder={createFolder}
                        onShareFolder={shareFolder}
                        onDeleteFolder={deleteFolder}
                        onSelectArtifact={setSelectedArtifactId}
                        selectedArtifactId={selectedArtifactId}
                        onMoveArtifacts={() => {}}
                      />
                    )}
                    
                    {layout.activeTab === "pseudocode" && layout.tabVisibility.pseudocode && (
                      <PseudocodeGenerator
                        onGenerate={(code: string) => {
                            createArtifact('code', code);
                        } } onClose={function(): void {
                            throw new Error('Function not implemented.');
                        } }/>
                    )}
                  </div>
                </Tabs>
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-grow overflow-auto">
          <div className="container mx-auto p-4">
            {/* Existing content rendering */}
            {currentArtifact && (
              <Card className="mt-6 xl:mt-8">
                <CardContent className="p-6">
                  {renderArtifactComponent()}
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Right Sidebar Panels */}
        <div className="flex flex-col w-64 border-l bg-muted/20 p-2 space-y-4 overflow-y-auto">
          {/* Stats Card Collapsible */}
          <Collapsible open={layout.showStats} onOpenChange={(open) => setLayout({ ...layout, showStats: open })}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center cursor-pointer mb-2 p-2 rounded hover:bg-muted">
                {layout.showStats ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="ml-2 font-semibold text-lg">Statistics</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <StatsCard userArtifacts={artifacts} /> {/* Pass artifacts to StatsCard */}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Quick Actions */}
          <Collapsible open={layout.showQuickActions} onOpenChange={(open) => setLayout({ ...layout, showQuickActions: open })}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center cursor-pointer mb-2 p-2 rounded hover:bg-muted">
                {layout.showQuickActions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="ml-2 font-semibold text-lg">Quick Actions</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => createArtifact('code')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Code Snippet
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="secondary"
                    onClick={() => createArtifact('project')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setSelectedFolderId(null)}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    View All Files
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setLayout({ activeTab: "pseudocode", tabVisibility: { ...layout.tabVisibility, pseudocode: true } });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Pseudocode
                  </Button>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Git Panel */}
          {layout.showGitPanel && <GitSidebar />}

          {/* Suggestion Feed */}
          {layout.showPromptPanel && (
            <Collapsible open={layout.showPromptPanel} onOpenChange={(open) => setLayout({...layout, showPromptPanel: open })}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center cursor-pointer mb-2 p-2 rounded hover:bg-muted">
                  {layout.showPromptPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="ml-2 font-semibold text-lg">Suggestions</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Suggestion Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SuggestionFeed onSuggestionSelect={() => {}} />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* SaaS Strategies Collapsible */}
          <Collapsible open={layout.showSaaS} onOpenChange={(open) => setLayout({ ...layout, showSaaS: open })}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center cursor-pointer mb-2 p-2 rounded hover:bg-muted">
                {layout.showSaaS ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="ml-2 font-semibold text-lg">SaaS Strategies</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="sticky top-[280px]">
                <CardHeader className="pb-2">
                  <CardTitle>SaaS Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="-mt-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                    <SaaSStrategies />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
