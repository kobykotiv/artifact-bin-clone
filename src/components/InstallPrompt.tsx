import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the prompt
    const hasDismissed = localStorage.getItem('pwaPromptDismissed');
    if (hasDismissed === 'true') {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Reset the deferred prompt variable
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    // Track the outcome
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <h3 className="text-lg font-semibold mb-1">Install Artifact Bin</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Install this app on your device for quick access to your code snippets, even when offline.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstall}
                  className="gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Install App
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDismiss}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6" 
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
