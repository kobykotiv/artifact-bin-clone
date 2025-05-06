import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { toast } from "sonner";
// Keep existing artifact imports if the old view is still used for non-logged-in users
import { type Artifact, deleteArtifact, getAllArtifacts, getArtifact, saveArtifact, getArtifactStats } from "@/lib/db";
import { ArtifactList } from "@/components/ArtifactList";
import { ArtifactEditor } from "@/components/ArtifactEditor";
import { ArtifactPreview } from "@/components/ArtifactPreview";
import { DataPortability } from "@/components/DataPortability";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Plus, Database, Lightbulb, LogIn } from "lucide-react";
import ProjectGenerator from "@/components/ProjectGenerator"; // Import ProjectGenerator
import { authService, type AuthState } from "@/lib/services/auth"; // Import auth service
import Dashboard from "@/components/Dashboard"; // Corrected Import Dashboard

// Define a constant for the project generator language type
const PROJECT_GENERATOR_LANG = 'project-generator';

export function App() {
  // --- Existing State for Artifact Bin View ---
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [isNewArtifact, setIsNewArtifact] = useState(false);
  const [stats, setStats] = useState({ count: 0, size: 0 });
  const [fullscreenArtifact, setFullscreenArtifact] = useState<Artifact | null>(null);
  // --- End Existing State ---

  // --- New Auth State ---
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [loadingAuth, setLoadingAuth] = useState(true);
  // --- End New Auth State ---

  // --- Auth Effect ---
  useEffect(() => {
    const checkAuth = async () => {
      // Attempt to initialize/check auth state if needed
      // For now, just subscribe to changes
      const unsubscribe = authService.subscribe(setAuthState);
      setLoadingAuth(false); // Assume initial state is ready quickly
      return unsubscribe;
    };
    checkAuth();
  }, []);
  // --- End Auth Effect ---


  // --- Existing Artifact Bin Logic (conditionally used) ---
  const loadArtifacts = async () => {
    try {
      const allArtifacts = await getAllArtifacts();
      setArtifacts(allArtifacts);
      const currentStats = await getArtifactStats();
      setStats(currentStats);
    } catch (error) {
      console.error("Failed to load artifacts:", error);
      toast.error("Failed to load artifacts");
    }
  };

  useEffect(() => {
    // Only load old artifact view data if not authenticated
    if (!authState.isAuthenticated) {
        loadArtifacts();
    }
  }, [authState.isAuthenticated]); // Reload if auth state changes

  useEffect(() => {
    const loadSelectedArtifact = async () => {
      if (selectedId) {
        try {
          const artifact = await getArtifact(selectedId);
          setCurrentArtifact(artifact);
          setIsNewArtifact(false); // If we selected an existing one, it's not new
        } catch (error) {
          console.error("Failed to load selected artifact:", error);
          toast.error("Failed to load selected artifact");
          setSelectedId(null); // Deselect if loading failed
          setCurrentArtifact(null);
        }
      } else {
        setCurrentArtifact(null); // Clear current artifact if nothing is selected
        setIsNewArtifact(false); // Not creating a new one if deselected
      }
    };
    loadSelectedArtifact();
  }, [selectedId]);

  const handleNewArtifact = (type: 'code' | 'project' = 'code') => {
    setSelectedId(null); // Deselect any current artifact
    setIsNewArtifact(true);
    const newSeed = Math.floor(Math.random() * 10000);
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    if (type === 'project') {
      setCurrentArtifact({
        id: newId,
        title: "New Project Idea",
        language: PROJECT_GENERATOR_LANG, // Use the special language type
        code: JSON.stringify({ // Initialize with minimal project structure
            id: newId,
            name: "New Project Idea",
            description: '',
            problem: '',
            customers: '',
            customerLocation: '',
            applicationType: '',
            dataModel: '',
            userRole: '',
            features: [],
            pseudocode: '',
            contributors: ['You'],
            forks: 0,
            stars: 0
        }, null, 2),
        createdAt: now,
        updatedAt: now,
        avatarSeed: newSeed.toString(),
      });
    } else {
      setCurrentArtifact({
        id: newId,
        title: "",
        language: "javascript", // Default to javascript for code snippets
        code: "",
        createdAt: now,
        updatedAt: now,
        avatarSeed: newSeed.toString(),
      });
    }
  };

  const handleSaveArtifact = async (data: Partial<Artifact>) => {
    try {
      if (!currentArtifact) throw new Error("No artifact selected/being created");

      const artifactToSave: Artifact = {
        ...currentArtifact,
        ...data, // Apply incoming changes (like title, code, language)
        updatedAt: new Date().toISOString(),
      };

      // Ensure createdAt is set only once for new artifacts
      if (isNewArtifact && !artifactToSave.createdAt) {
        artifactToSave.createdAt = new Date().toISOString();
      }

      await saveArtifact(artifactToSave);
      toast.success("Artifact saved successfully");

      // Refresh list and select the saved/updated artifact
      await loadArtifacts();
      setSelectedId(artifactToSave.id); // Ensure the saved artifact is selected
      setIsNewArtifact(false); // It's no longer a "new" unsaved artifact

    } catch (error) {
      console.error("Failed to save artifact:", error);
      toast.error("Failed to save artifact");
    }
  };

  const handleDeleteArtifact = async () => {
    if (!currentArtifact) return;

    try {
      await deleteArtifact(currentArtifact.id);
      toast.success("Artifact deleted");

      // Refresh artifact list and clear selection
      setSelectedId(null);
      setCurrentArtifact(null);
      await loadArtifacts();
    } catch (error) {
      console.error("Failed to delete artifact:", error);
      toast.error("Failed to delete artifact");
    }
  };

  const handleForkArtifact = (originalArtifact: Artifact) => {
    const newSeed = Math.floor(Math.random() * 10000);
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Parse the original project data if it's a project generator artifact
    let forkedProjectData = {};
    if (originalArtifact.language === PROJECT_GENERATOR_LANG) {
        try {
            forkedProjectData = JSON.parse(originalArtifact.code || '{}');
        } catch (e) {
            console.error("Error parsing original project data for fork:", e);
        }
    }

    const forkedArtifact: Artifact = {
      ...originalArtifact, // Copy most fields
      id: newId,
      title: `Fork of ${originalArtifact.title || "Untitled"}`,
      // Keep the language type
      code: originalArtifact.language === PROJECT_GENERATOR_LANG
          ? JSON.stringify({
              ...forkedProjectData, // Spread parsed data
              id: newId, // Assign new ID within the project data too
              name: `Fork of ${originalArtifact.title || "Untitled"}`,
              forks: 0, // Reset forks for the new fork
              contributors: ['You'], // Reset contributors
          }, null, 2)
          : originalArtifact.code, // Or just copy code for other types
      createdAt: now,
      updatedAt: now,
      avatarSeed: newSeed.toString(), // Generate new seed
    };

    setSelectedId(null); // Deselect current
    setIsNewArtifact(true); // Treat the fork as a new artifact initially
    setCurrentArtifact(forkedArtifact); // Set the forked artifact as current
    toast.info("Fork created. You are now editing the new version.");
  };

  const handleFullscreenArtifact = (artifact: Artifact) => {
    setFullscreenArtifact(artifact);
  };

  const closeFullscreen = () => {
    setFullscreenArtifact(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };
  // --- End Existing Artifact Bin Logic ---

  // --- Login/Guest Access ---
  const handleLoginAsGuest = async () => {
    setLoadingAuth(true);
    try {
      await authService.loginAsGuest();
      // Auth state updates via subscription
    } catch (error) {
      console.error("Guest login failed:", error);
      toast.error("Could not log in as guest.");
    } finally {
      setLoadingAuth(false);
    }
  };
  // --- End Login/Guest Access ---


  if (loadingAuth) {
      // Optional: Show a loading spinner while checking auth
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      {authState.isAuthenticated ? (
        // Render Dashboard if authenticated (registered or guest)
        <Dashboard />
      ) : (
        // Render existing Artifact Bin view or a Login prompt for unauthenticated users
        <div className="container mx-auto p-4 md:p-8 h-screen flex flex-col">
          <header className="flex justify-between items-center py-4 flex-shrink-0">
            <h1 className="text-2xl font-bold">Artifact Bin</h1>
            {/* Show Login/Guest button instead of artifact actions */}
            <Button onClick={handleLoginAsGuest}>
              <LogIn className="mr-2 h-4 w-4" />
              Continue as Guest
            </Button>
            {/* Optionally add a real Login button here */}
          </header>

          <main className="flex-grow flex items-center justify-center">
             <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to Artifact Bin</h2>
                <p className="text-muted-foreground mb-4">Log in or continue as a guest to manage your code snippets and project ideas.</p>
                <Button onClick={handleLoginAsGuest}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Continue as Guest
                </Button>
             </div>
          </main>
          {/* Keep Toaster and InstallPrompt outside conditional rendering if needed globally */}
        </div>
      )}

      {/* Fullscreen Overlay (Keep if needed globally or move into Dashboard) */}
      {fullscreenArtifact && !authState.isAuthenticated && ( // Only show if not in dashboard view
        <div className="fixed inset-0 bg-background z-50 flex flex-col p-4">
           <div className="flex justify-end mb-4 flex-shrink-0">
             <Button variant="secondary" onClick={closeFullscreen}>
               Close Fullscreen
             </Button>
           </div>
           <div className="flex-grow overflow-hidden border rounded-lg">
             <ArtifactPreview artifact={fullscreenArtifact as any} isVisible={true} />
           </div>
        </div>
      )}

      {/* Prompt user to install as a PWA */}
      <InstallPrompt />

      {/* Toast notifications */}
      <Toaster />
    </>
  );
}

export default App;
