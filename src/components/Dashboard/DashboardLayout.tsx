import { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactList } from '@/components/ArtifactList';
import { UserProfile } from '@/components/UserProfile';
import { artifactComponentRegistry } from '@/lib/artifactTypes';
import { SaaSStrategies } from './SaaSStrategies';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, Search, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FolderView } from './FolderView';

export function DashboardLayout() {
  const { 
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
    activeTab,
    setActiveTab,
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
  });

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
    <div className="container mx-auto p-4">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Artifact Dashboard</h1>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search artifacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="project-spec">Project Specs</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <UserProfile />
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Artifacts</h2>
              <Button size="sm" onClick={() => createArtifact('code')}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New
              </Button>
            </div>
            <ArtifactList 
              artifacts={filteredArtifacts}
              selectedId={selectedArtifactId}
              onSelect={setSelectedArtifactId}
              displayMode={viewMode}
            />
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="strategies">SaaS Strategies</TabsTrigger>
              <TabsTrigger value="folders">
                <FolderOpen className="w-4 h-4 mr-2" />
                Folders
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="artifacts" className="min-h-[500px]">
              {renderArtifactComponent()}
            </TabsContent>
            
            <TabsContent value="strategies">
              <SaaSStrategies />
            </TabsContent>
            
            <TabsContent value="folders">
              <FolderView
                folders={folders}
                artifacts={artifacts}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={createFolder}
                onShareFolder={shareFolder}
                onDeleteFolder={deleteFolder}
                onSelectArtifact={(id) => {
                  setSelectedArtifactId(id);
                  setActiveTab('artifacts');
                }}
                selectedArtifactId={selectedArtifactId}
              />
            </TabsContent>
            
            {/* Add other tab contents here */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
