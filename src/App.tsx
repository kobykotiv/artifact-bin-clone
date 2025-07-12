import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { AuthProvider, useAuthContext } from '@/lib/context/AuthContext';
import { authService } from "@/lib/services/auth";
import Dashboard from "@/components/Dashboard";
import { LogIn, Lightbulb } from 'lucide-react';
import { ThemeSwitcher } from './components/ThemeSwitcher';

function AppContent() {
  const { authState, loginAsGuest } = useAuthContext();

  if (authState.status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-4xl font-bold mb-4">Welcome to Artifact Bin</h1>
        <p className="text-muted-foreground mb-8">Your personal space for code snippets, project ideas, and more.</p>
        <div className="flex gap-4">
          <Button size="lg" onClick={() => authService.loginWithGoogle()}>
            <LogIn className="mr-2 h-5 w-5" />
            Login / Register with Google
          </Button>
          <Button size="lg" variant="outline" onClick={loginAsGuest}>
            <Lightbulb className="mr-2 h-5 w-5" />
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }
  
  if (authState.user) {
    return <Dashboard />;
  }

  // Fallback for loading state
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Loading...</p>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
      <ThemeSwitcher />
    </AuthProvider>
  );
}

export default App;
