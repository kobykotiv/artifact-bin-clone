import { useState, useEffect, useMemo, useCallback } from 'react';
import { authService, type AuthState } from '@/lib/services/auth';
import { dbService, type ArtifactData, type UserData } from '@/lib/services/db';
import { UserProfile } from '@/components/UserProfile';
import { ArtifactList } from '@/components/ArtifactList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Plus, Network, Briefcase, ListTodo, Lightbulb, BarChart3, Layout } from 'lucide-react';
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

export function Dashboard() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [userArtifacts, setUserArtifacts] = useState<ArtifactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>("artifacts");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // --- Data Fetching ---
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
  const dashboardStats = useMemo(() => {
    const languageCounts: Record<string, number> = {};
    let totalArtifactsSize = 0;
    
    userArtifacts.forEach(artifact => {
      // Count languages
      const lang = artifact.language || 'unknown';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      
      // Calculate total size (approximation)
      totalArtifactsSize += (artifact.content?.length || 0);
    });
    
    return {
      totalArtifacts: userArtifacts.length,
      languageDistribution: languageCounts,
      totalSize: Math.round(totalArtifactsSize / 1024), // KB
      recentActivity: userArtifacts
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    };
  }, [userArtifacts]);

  // --- Artifact Selection Logic ---
  useEffect(() => {
    if (selectedArtifactId) {
      const found = userArtifacts.find(a => a.id === selectedArtifactId);
      setCurrentArtifact(found || null);
      // If not found, it might have been deleted or list is stale,
      // but we avoid fetching again here to prevent loops.
      // The artifact list refresh should handle consistency.
      setIsEditing(false); // Always reset to view mode on selection change
    } else {
      setCurrentArtifact(null);
      setIsEditing(false);
    }
  }, [selectedArtifactId, userArtifacts]);

  // --- Filtering Logic ---
  const filteredArtifacts = useMemo(() => {
    // ... filtering logic remains the same ...
    return userArtifacts.filter(artifact => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
          (artifact.title && artifact.title.toLowerCase().includes(searchLower)) ||
          (artifact.tags && artifact.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
          (artifact.content && artifact.content.toLowerCase().includes(searchLower));

        const matchesLanguage = filterLanguage === 'all' || artifact.language === filterLanguage;

        return matchesSearch && matchesLanguage;
      });
  }, [searchQuery, filterLanguage, userArtifacts]);

  // --- Handlers ---
  const handleUserUpdate = useCallback((updatedUser: UserData) => {
    console.log("User updated in dashboard:", updatedUser);
    if (authState.user && authState.user.id === updatedUser.id) {
        // Assuming authService needs explicit update notification
        // authService.updateUser(updatedUser);
    }
  }, [authState.user]);

  const handleSelectArtifact = useCallback((id: string) => {
    setSelectedArtifactId(id);
  }, []);

  // Modified handleCreateArtifact to potentially create different types
  const handleCreateNew = useCallback((type: 'code' | 'project') => {
    if (!authState.user) return;

    let newArtifact: ArtifactData;

    if (type === 'project') {
      newArtifact = {
        id: crypto.randomUUID(),
        userId: authState.user.id,
        title: 'Untitled Project Specification',
        language: 'project-spec', // Special language identifier
        content: JSON.stringify({ // Default project structure
            id: crypto.randomUUID(), // Inner ID for the project data itself
            name: 'Untitled Project Specification',
            description: '', problem: '', customers: '', customerLocation: '',
            applicationType: '', dataModel: '', userRole: '',
            features: [], pseudocode: '', contributors: ['You'], forks: 0, stars: 0
        }, null, 2),
        fileType: 'json', // Store content as JSON
        tags: ['project-spec'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };
      setIsEditing(false); // Project Generator manages its own state initially
    } else { // Default to 'code'
      newArtifact = {
        id: crypto.randomUUID(),
        userId: authState.user.id,
        title: 'Untitled Artifact',
        language: 'javascript',
        content: '// Start coding here...',
        fileType: 'js',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };
      setIsEditing(true); // Enter code editor immediately
    }

    setUserArtifacts(prev => [newArtifact, ...prev]);
    setSelectedArtifactId(newArtifact.id);
    // currentArtifact update is handled by useEffect

  }, [authState.user]);

  const handleSaveArtifact = useCallback(async (updatedArtifact: ArtifactData) => {
    if (!authState.user) return;
    try {
      updatedArtifact.fileType = getFileTypeFromLanguage(updatedArtifact.language);
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

  // Add handleForkArtifact
  const handleForkArtifact = useCallback(async (artifactToFork: ArtifactData) => {
    if (!authState.user) return;
    try {
      const forkId = crypto.randomUUID();
      let forkedContent = artifactToFork.content;

      // If it's a project spec, update the internal ID and reset contributors/forks
      if (artifactToFork.language === 'project-spec') {
          try {
              const projectData = JSON.parse(artifactToFork.content);
              projectData.id = forkId; // Give the project data a new unique ID
              projectData.contributors = [authState.user.username || 'You']; // Reset contributors
              projectData.forks = 0; // Reset forks count
              forkedContent = JSON.stringify(projectData, null, 2);
          } catch (e) {
              console.error("Failed to parse project spec content during fork:", e);
              // Proceed with raw content fork if parsing fails
          }
      }


      const newArtifact: ArtifactData = {
        ...artifactToFork, // Copy most properties
        id: forkId, // New unique ID for the artifact itself
        userId: authState.user.id, // Belongs to the current user
        title: `${artifactToFork.title} (Fork)`, // Indicate it's a fork
        content: forkedContent, // Use potentially modified content
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Optionally link back to the original? Add a tag?
        tags: [...(artifactToFork.tags || []), 'fork', `forked-from:${artifactToFork.id}`],
        avatarSeed: crypto.randomUUID(), // New avatar
      };

      await dbService.saveArtifact(newArtifact); // Save the new fork
      await fetchUserArtifacts(authState.user.id); // Refresh list
      setSelectedArtifactId(newArtifact.id); // Select the new fork
      setIsEditing(false); // View the new fork
      toast.success(`Forked "${artifactToFork.title}" successfully!`);

    } catch (error) {
      console.error("Failed to fork artifact:", error);
      toast.error("Failed to fork artifact");
    }
  }, [authState.user, fetchUserArtifacts]);

  const handleUpload = useCallback(async (file: File) => {
    if (!authState.user) throw new Error("User not authenticated");
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const language = getLanguageFromFileType(fileType);
      const content = await file.text();

      const newArtifact: ArtifactData = {
        id: crypto.randomUUID(),
        userId: authState.user.id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        language: language,
        content: content,
        fileType: fileType,
        tags: [fileType], // Add file type as a tag
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarSeed: crypto.randomUUID()
      };

      await dbService.saveArtifact(newArtifact);
      await fetchUserArtifacts(authState.user.id); // Refresh list
      toast.success(`File "${file.name}" uploaded successfully`);
      // Optionally select the newly uploaded artifact
      // setSelectedArtifactId(newArtifact.id);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw for the dialog
    }
  }, [authState.user, fetchUserArtifacts]);

  // Function to create a specific planning artifact if needed
  const createPlanningArtifact = useCallback((planType: string) => {
    if (!authState.user) return null;
    
    const newArtifact: ArtifactData = {
      id: crypto.randomUUID(),
      userId: authState.user.id,
      title: `${planType} Plan`,
      language: 'project-spec',
      content: JSON.stringify({
        id: crypto.randomUUID(),
        name: `${planType} Plan`,
        type: planType.toLowerCase(),
        // Add specific fields based on plan type
        createdAt: new Date().toISOString(),
        tasks: [],
        notes: '',
      }, null, 2),
      fileType: 'json',
      tags: ['plan', planType.toLowerCase()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatarSeed: crypto.randomUUID()
    };
    
    return newArtifact;
  }, [authState.user]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4 p-6 max-w-md text-center">
          <div className="p-4 rounded-full bg-muted">
            <Loader2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in or continue as guest to access your dashboard.</p>
          <Button onClick={() => authService.loginAsGuest()}>Continue as Guest</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col gap-4">
      {/* Header with responsive design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {authState.user.username || "Guest"}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <DataPortability onImportComplete={() => fetchUserArtifacts(authState.user.id)} />
          <FileUploadDialog onUpload={handleUpload} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCreateNew('code')}>
                Code Artifact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateNew('project')}>
                Project Specification
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filter - Responsive design */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search artifacts by name, tag, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-auto min-w-[160px]">
              <SelectValue placeholder="Filter language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {supportedLanguages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-md border">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="icon" 
              className="rounded-none rounded-l-md"
              onClick={() => setViewMode('list')}
            >
              <ListTodo className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="icon" 
              className="rounded-none rounded-r-md"
              onClick={() => setViewMode('grid')}
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {userArtifacts.length > 0 && (
        <StatsCard userArtifacts={userArtifacts} />
      )}

      {/* Main Content Grid with improved responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow overflow-hidden">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          {/* User Profile */}
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle>{authState.isGuest ? 'Guest Profile' : 'User Profile'}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserProfile
                userId={authState.user.id}
                isGuest={authState.isGuest}
                onUserChange={handleUserUpdate}
              />
            </CardContent>
          </Card>

          {/* Artifact List with improved styling */}
          <Card className="flex-grow flex flex-col overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span>My Artifacts ({filteredArtifacts.length})</span>
                {filteredArtifacts.length > 0 && searchQuery && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {filteredArtifacts.length} results
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="p-1 md:p-2">
                  <ArtifactList
                    artifacts={filteredArtifacts}
                    selectedId={selectedArtifactId}
                    onSelect={handleSelectArtifact}
                    displayMode={viewMode}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs for Different Forms */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col overflow-hidden">
          <Card className="flex-grow flex flex-col overflow-hidden">
            <Tabs defaultValue="artifacts" className="flex flex-col flex-grow overflow-hidden" onValueChange={setActiveTab}>
              <TabsList className="px-6 pt-2 mb-0 border-b overflow-x-auto flex-nowrap w-full justify-start">
                <TabsTrigger value="artifacts"><ListTodo className="w-4 h-4 mr-2" />Artifacts</TabsTrigger>
                <TabsTrigger value="project"><Lightbulb className="w-4 h-4 mr-2" />Project Idea</TabsTrigger>
                <TabsTrigger value="marketing"><Briefcase className="w-4 h-4 mr-2" />Marketing</TabsTrigger>
                <TabsTrigger value="funding"><Briefcase className="w-4 h-4 mr-2" />Funding</TabsTrigger>
                <TabsTrigger value="sprint"><ListTodo className="w-4 h-4 mr-2" />Sprint</TabsTrigger>
                <TabsTrigger value="network"><Network className="w-4 h-4 mr-2" />Network</TabsTrigger>
              </TabsList>
              
              {/* Artifacts Tab - Original viewer/editor functionality */}
              <TabsContent value="artifacts" className="flex-grow overflow-hidden flex flex-col">
                {currentArtifact ? (
                  // Check artifact type/language to determine which component to render
                  currentArtifact.language === 'project-spec' ? (
                    <ProjectGenerator
                      key={currentArtifact.id}
                      artifact={currentArtifact}
                      onSave={handleSaveArtifact}
                      onFork={handleForkArtifact}
                    />
                  ) : isEditing ? (
                    <ArtifactEditor
                      key={currentArtifact.id}
                      artifact={currentArtifact}
                      onSave={handleSaveArtifact}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
                    <ArtifactViewer
                      key={currentArtifact.id}
                      artifact={currentArtifact}
                      onEdit={() => setIsEditing(true)}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground p-6">
                    <div className="text-center max-w-md">
                      <div className="mb-4">
                        <ListTodo className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Artifact Selected</h3>
                      <p>
                        {userArtifacts.length > 0
                          ? "Select an artifact from the list to view or edit."
                          : "No artifacts found. Create one or upload a file."}
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
              </TabsContent>
              
              {/* Project Idea Tab */}
              <TabsContent value="project" className="flex-grow overflow-hidden">
                <ProjectGenerator
                  artifact={createPlanningArtifact('Project') || {
                    id: 'temp-project',
                    title: 'New Project Idea',
                    content: JSON.stringify({ name: 'New Project Idea', description: '', features: [] }, null, 2)
                  }}
                  onSave={handleSaveArtifact}
                  onFork={handleForkArtifact}
                  isTemplate
                />
              </TabsContent>
              
              {/* Other tabs remain the same */}
              <TabsContent value="marketing" className="flex-grow overflow-hidden">
                <ProjectGenerator
                  artifact={createPlanningArtifact('Marketing') || {
                    id: 'temp-marketing',
                    title: 'Marketing Plan',
                    content: JSON.stringify({ name: 'Marketing Plan', targetAudience: '', strategies: [] }, null, 2)
                  }}
                  onSave={handleSaveArtifact}
                  onFork={handleForkArtifact}
                  isTemplate
                />
              </TabsContent>
              
              {/* Funding Plan Tab */}
              <TabsContent value="funding" className="flex-grow overflow-hidden">
                <ProjectGenerator
                  artifact={createPlanningArtifact('Funding') || {
                    id: 'temp-funding',
                    title: 'Funding Plan',
                    content: JSON.stringify({ name: 'Funding Plan', budget: '', sources: [] }, null, 2)
                  }}
                  onSave={handleSaveArtifact}
                  onFork={handleForkArtifact}
                  isTemplate
                />
              </TabsContent>
              
              {/* Sprint Planner Tab */}
              <TabsContent value="sprint" className="flex-grow overflow-hidden">
                <SprintPlanner
                  artifact={createPlanningArtifact('Sprint') || {
                    id: 'temp-sprint',
                    title: 'Sprint Plan',
                    content: JSON.stringify({ projectName: '', sprints: [] }, null, 2)
                  }}
                  onSave={handleSaveArtifact}
                />
              </TabsContent>
              
              {/* Network Graph Tab */}
              <TabsContent value="network" className="flex-grow overflow-hidden p-6">
                <div className="h-full flex items-center justify-center flex-col gap-4 text-center">
                  <Network className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Git Network Visualization</h3>
                    <p className="text-muted-foreground max-w-md">
                      View connections between forked artifacts and collaborators in a network graph.
                      This feature is coming soon.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
