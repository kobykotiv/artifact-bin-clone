import { useState, useEffect, useMemo, useCallback } from 'react';
import { authService, type AuthState, type UserData } from '@/lib/services/auth'; // Ensure UserData is imported
import { dbService, type ArtifactData } from '@/lib/services/db';
import { UserProfile } from '@/components/UserProfile';
import { ArtifactList } from '@/components/ArtifactList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Plus, Network, Briefcase, ListTodo, Lightbulb, BarChart3, Layout, DollarSign, PieChart, Building, Target } from 'lucide-react'; // Added Target icon
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
// import { type UserData } from '@/lib/services/auth'; // Ensure UserData is imported if used

export function Dashboard() {
  // ...existing state...
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [userArtifacts, setUserArtifacts] = useState<ArtifactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>("artifacts"); // Keep track of the main dashboard tab
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');


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

  // Modified handleCreateArtifact to potentially create different types
  // ...existing code...
  const handleCreateNew = useCallback((type: 'code' | 'project' | 'business') => {
    // ...existing code...
  }, [authState.user, /* createPlanningArtifact dependency */]);


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

  // Add handleForkArtifact
  // ...existing code...
  const handleForkArtifact = useCallback(async (artifactToFork: ArtifactData) => {
    // ...existing code...
  }, [authState.user, fetchUserArtifacts]);


  // ...existing code...
  const handleUpload = useCallback(async (file: File) => {
    // ...existing code...
  }, [authState.user, fetchUserArtifacts]);


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

  // --- Render Logic ---
  // ...existing code...
  if (loading) {
    // ...existing code...
  }

  if (!authState.isAuthenticated || !authState.user) {
    // ...existing code...
  }


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col gap-4">
      {/* Header with responsive design */}
      {/* ...existing code... */}
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
              {/* <DropdownMenuItem onClick={() => handleCreateNew('business')}>
                 Business Plan (Generic - Deprecated?)
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              {/* Updated creation handlers - Now create specific plan types directly */}
              <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Marketing'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('marketing'); // Let useEffect handle tab change */ } }}>Marketing Plan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Funding'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('funding'); */ } }}>Fundraising Plan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Budget'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('budget'); */ } }}>Budget Plan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Shares'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('shares'); */ } }}>Shares Plan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Startup'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('startup'); */ } }}>Startup Plan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Objectives'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('objectives'); */ } }}>Objectives Plan</DropdownMenuItem>
               <DropdownMenuItem onClick={() => { const art = createPlanningArtifact('Sprint'); if(art) { setUserArtifacts(prev => [art, ...prev]); setSelectedArtifactId(art.id); /* setActiveTab('sprint'); */ } }}>Sprint Plan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* Search and Filter - Responsive design */}
      {/* ...existing code... */}


      {/* Statistics Overview */}
      {/* ...existing code... */}


      {/* Main Content Grid with improved responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow overflow-hidden">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          {/* User Profile */}
          {/* ...existing code... */}

          {/* Artifact List with improved styling */}
          {/* ...existing code... */}
        </div>

        {/* Right Column: Tabs for Different Forms */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col overflow-hidden">
          <Card className="flex-grow flex flex-col overflow-hidden">
            {/* Use controlled Tabs component */}
            <Tabs value={activeTab} className="flex flex-col flex-grow overflow-hidden" onValueChange={setActiveTab}>
              <TabsList className="px-6 pt-2 mb-0 border-b overflow-x-auto flex-nowrap w-full justify-start">
                <TabsTrigger value="artifacts"><ListTodo className="w-4 h-4 mr-2" />Artifacts</TabsTrigger>
                <TabsTrigger value="project"><Lightbulb className="w-4 h-4 mr-2" />Project Idea</TabsTrigger>
                {/* Updated Business Plan Tabs */}
                <TabsTrigger value="marketing"><Briefcase className="w-4 h-4 mr-2" />Marketing</TabsTrigger>
                <TabsTrigger value="funding"><Briefcase className="w-4 h-4 mr-2" />Funding</TabsTrigger>
                <TabsTrigger value="budget"><DollarSign className="w-4 h-4 mr-2" />Budget</TabsTrigger>
                <TabsTrigger value="shares"><PieChart className="w-4 h-4 mr-2" />Shares</TabsTrigger>
                <TabsTrigger value="startup"><Building className="w-4 h-4 mr-2" />Startup</TabsTrigger>
                <TabsTrigger value="objectives"><Target className="w-4 h-4 mr-2" />Objectives</TabsTrigger> {/* Added Objectives */}
                {/* Other Tabs */}
                <TabsTrigger value="sprint"><ListTodo className="w-4 h-4 mr-2" />Sprint</TabsTrigger>
                <TabsTrigger value="network"><Network className="w-4 h-4 mr-2" />Network</TabsTrigger>
              </TabsList>

              {/* Artifacts Tab - Original viewer/editor functionality */}
              <TabsContent value="artifacts" className="flex-grow overflow-hidden flex flex-col">
                {currentArtifact ? (
                  // Check artifact type/language to determine which component to render
                  // Check if it's a specific plan type handled by BusinessPlanGenerator
                  currentArtifact.language === 'project-spec' && (
                    JSON.parse(currentArtifact.content || '{}').marketingPlanData ||
                    JSON.parse(currentArtifact.content || '{}').fundraisingPlanData ||
                    JSON.parse(currentArtifact.content || '{}').budgetPlanData ||
                    JSON.parse(currentArtifact.content || '{}').sharesPlanData ||
                    JSON.parse(currentArtifact.content || '{}').startupPlanData ||
                    JSON.parse(currentArtifact.content || '{}').objectivesPlanData
                  ) ? (
                     <BusinessPlanGenerator
                       key={currentArtifact.id}
                       artifact={currentArtifact}
                       onSave={handleSaveArtifact}
                       // isTemplate={false} // Explicitly not a template when viewing existing
                     />
                  // Check if it's a generic project spec handled by ProjectGenerator
                  ) : currentArtifact.language === 'project-spec' && !JSON.parse(currentArtifact.content || '{}').type && !JSON.parse(currentArtifact.content || '{}').marketingPlanData /* Add checks for other plan data */ ? (
                    <ProjectGenerator
                      key={currentArtifact.id}
                      artifact={currentArtifact}
                      onSave={handleSaveArtifact}
                      onFork={handleForkArtifact}
                      // isTemplate={false} // Explicitly not a template
                    />
                  // Check if it's a sprint plan
                  ) : currentArtifact.language === 'project-spec' && JSON.parse(currentArtifact.content || '{}').type === 'sprint' ? (
                     <SprintPlanner
                       key={currentArtifact.id}
                       artifact={currentArtifact}
                       onSave={handleSaveArtifact}
                     />
                  // Handle standard code artifacts (edit/view)
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
                      onFork={handleForkArtifact} // Pass fork handler to viewer
                    />
                  )
                ) : (
                  // Placeholder when no artifact is selected
                  // ...existing code...
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
                    // Provide a minimal valid ArtifactData structure as fallback
                    id: 'temp-project',
                    userId: authState.user.id,
                    title: 'New Project Idea Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'project-spec'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'project-template',
                    content: JSON.stringify({ id: 'temp-project-data', name: 'New Project Idea', description: '', features: [], contributors: ['You'], forks: 0, stars: 0 }, null, 2)
                  }}
                  onSave={handleSaveArtifact}
                  onFork={handleForkArtifact}
                  isTemplate // Mark as template
                />
              </TabsContent>


              {/* Marketing Plan Tab - Uses BusinessPlanGenerator as template */}
              <TabsContent value="marketing" className="flex-grow overflow-hidden">
                <BusinessPlanGenerator
                  artifact={createPlanningArtifact('Marketing') || {
                    id: 'temp-marketing',
                    userId: authState.user.id, // Add required fields
                    title: 'Marketing Plan Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'marketing'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'marketing-template',
                    content: JSON.stringify({ marketingPlanData: { audience: '', campaignType: '', channel: '', budget: '', kpi: '', timeline: '' } }, null, 2) // Simplified content
                  }}
                  onSave={handleSaveArtifact}
                  isTemplate // Mark as template
                />
              </TabsContent>


              {/* Funding Plan Tab - Uses BusinessPlanGenerator as template */}
              <TabsContent value="funding" className="flex-grow overflow-hidden">
                <BusinessPlanGenerator
                  artifact={createPlanningArtifact('Funding') || {
                    id: 'temp-funding',
                    userId: authState.user.id,
                    title: 'Funding Plan Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'funding'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'funding-template',
                    content: JSON.stringify({ fundraisingPlanData: { stage: '', amount: '', useOfFunds: '', sector: '', closeDate: '', checklist: { pitchDeck: false, financials: false, marketAnalysis: false, teamBios: false } } }, null, 2) // Simplified content
                  }}
                  onSave={handleSaveArtifact}
                  isTemplate // Mark as template
                />
              </TabsContent>


              {/* Budget Plan Tab - Uses BusinessPlanGenerator as template */}
              <TabsContent value="budget" className="flex-grow overflow-hidden">
                <BusinessPlanGenerator
                  artifact={createPlanningArtifact('Budget') || {
                    id: 'temp-budget',
                    userId: authState.user.id,
                    title: 'Budget Plan Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'budget'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'budget-template',
                    content: JSON.stringify({ budgetPlanData: { revenueProjection: '', costOfGoodsSold: '', operatingExpenses: '', fundingNeeds: '' } }, null, 2) // Simplified content
                  }}
                  onSave={handleSaveArtifact}
                  isTemplate // Mark as template
                />
              </TabsContent>


              {/* Shares Plan Tab - Uses BusinessPlanGenerator as template */}
              <TabsContent value="shares" className="flex-grow overflow-hidden">
                <BusinessPlanGenerator
                  artifact={createPlanningArtifact('Shares') || {
                    id: 'temp-shares',
                    userId: authState.user.id,
                    title: 'Shares Plan Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'shares'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'shares-template',
                    content: JSON.stringify({ sharesPlanData: { totalShares: '', founderShares: '', employeePool: '', investorShares: '' } }, null, 2) // Simplified content
                  }}
                  onSave={handleSaveArtifact}
                  isTemplate // Mark as template
                />
              </TabsContent>


              {/* Startup Plan Tab - Uses BusinessPlanGenerator as template */}
              <TabsContent value="startup" className="flex-grow overflow-hidden">
                <BusinessPlanGenerator
                  artifact={createPlanningArtifact('Startup') || {
                    id: 'temp-startup',
                    userId: authState.user.id,
                    title: 'Startup Plan Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'startup'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'startup-template',
                    content: JSON.stringify({ startupPlanData: { companyName: '', legalStructure: '', incorporationState: '', registeredAgent: '', checklist: { einObtained: false, bankAccountOpened: false, domainRegistered: false, founderAgreements: false } } }, null, 2) // Simplified content
                  }}
                  onSave={handleSaveArtifact}
                  isTemplate // Mark as template
                />
              </TabsContent>


              {/* Objectives Plan Tab - Uses BusinessPlanGenerator as template */}
               <TabsContent value="objectives" className="flex-grow overflow-hidden">
                 <BusinessPlanGenerator
                   artifact={createPlanningArtifact('Objectives') || {
                     id: 'temp-objectives',
                     userId: authState.user.id,
                     title: 'Objectives Plan Template', // Indicate template
                     language: 'project-spec',
                     fileType: 'json',
                     tags: ['template', 'objectives'],
                     createdAt: new Date().toISOString(),
                     updatedAt: new Date().toISOString(),
                     avatarSeed: 'objectives-template',
                     content: JSON.stringify({ objectivesPlanData: { goalVerb: '', goalMetric: '', goalTarget: '', timeframe: '', objectiveArea: '', growthStrategy: '', actionVerb: '', actionTarget: '', kpiMetric: '' } }, null, 2) // Simplified content
                   }}
                   onSave={handleSaveArtifact}
                   isTemplate // Mark as template
                 />
               </TabsContent>


              {/* Sprint Planner Tab */}
              <TabsContent value="sprint" className="flex-grow overflow-hidden">
                <SprintPlanner
                  artifact={createPlanningArtifact('Sprint') || {
                    // Provide minimal valid structure
                    id: 'temp-sprint',
                    userId: authState.user.id,
                    title: 'Sprint Plan Template', // Indicate template
                    language: 'project-spec',
                    fileType: 'json',
                    tags: ['template', 'sprint'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatarSeed: 'sprint-template',
                    content: JSON.stringify({ type: 'sprint', projectName: '', sprints: [] }, null, 2)
                  }}
                  onSave={handleSaveArtifact}
                  // isTemplate // SprintPlanner might not need isTemplate, it handles its own state
                />
              </TabsContent>


              {/* Network Graph Tab */}
              {/* ...existing code... */}

            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
