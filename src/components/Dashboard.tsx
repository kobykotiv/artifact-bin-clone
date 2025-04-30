import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { authService, type AuthState } from '@/lib/services/auth';
import { dbService, type ArtifactData, type UserData } from '@/lib/services/db';
import { UserProfile } from '@/components/UserProfile';
import { ArtifactList } from '@/components/ArtifactList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Plus } from 'lucide-react';
import { ArtifactViewer } from '@/components/ArtifactViewer';
import { ArtifactEditor } from '@/components/ArtifactEditor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { getLanguageFromFileType, getFileTypeFromLanguage, supportedLanguages } from '@/lib/utils/fileTypes';
import ProjectGenerator from '@/components/ProjectGenerator'; // Import ProjectGenerator
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Import Dropdown components

// Define the special language identifier
const PROJECT_SPEC_LANG = 'project-spec';

export function Dashboard() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [userArtifacts, setUserArtifacts] = useState<ArtifactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

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

  // --- Render Logic ---
  if (loading) {
    // ... loading spinner ...
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Dashboard...</span>
        </div>
      );
  }
  if (!authState.isAuthenticated || !authState.user) {
    // ... login prompt ...
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 h-screen flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <FileUploadDialog onUpload={handleUpload} />
          {/* Replace single New Artifact button with Dropdown */}
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
              {/* Add Tech Stack Generator option later */}
              {/* <DropdownMenuItem onClick={() => handleCreateNew('tech-stack')}>
                Tech Stack Pseudocode
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 flex-shrink-0">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search artifacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow overflow-hidden">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          {/* User Profile */}
          <Card className="flex-shrink-0">
            {/* ... UserProfile card content ... */}
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

          {/* Artifact List */}
          <Card className="flex-grow flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>My Artifacts ({filteredArtifacts.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea className="h-full">
                 <div className="p-1 md:p-2"> {/* Adjust padding */}
                    <ArtifactList
                      artifacts={filteredArtifacts}
                      selectedId={selectedArtifactId}
                      onSelect={handleSelectArtifact}
                    />
                 </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Viewer/Editor/Generator */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden">
          {/* Use a single Card container */}
          <Card className="flex-grow flex flex-col overflow-hidden">
            {currentArtifact ? (
              // Check artifact type/language to determine which component to render
              currentArtifact.language === 'project-spec' ? (
                <ProjectGenerator
                  key={currentArtifact.id} // Ensure re-mount on artifact change
                  artifact={currentArtifact}
                  onSave={handleSaveArtifact} // Use the existing save handler
                  onFork={handleForkArtifact} // Use the new fork handler
                />
              ) : isEditing ? (
                // Standard Code Editor
                <ArtifactEditor
                  key={currentArtifact.id}
                  artifact={currentArtifact}
                  onSave={handleSaveArtifact}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                // Standard Code Viewer
                <ArtifactViewer
                  key={currentArtifact.id}
                  artifact={currentArtifact}
                  onEdit={() => setIsEditing(true)}
                />
              )
            ) : (
              // Placeholder when no artifact is selected
              <div className="flex items-center justify-center h-full text-muted-foreground p-6">
                <p>
                  {userArtifacts.length > 0
                    ? "Select an artifact from the list to view or edit."
                    : "No artifacts found. Create one or upload a file."}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
