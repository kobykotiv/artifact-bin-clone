import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from './StatsCard';
import { SaaSStrategies } from './SaaSStrategies';
import { SuggestionFeed } from '../SuggestionFeed';
import { GitSidebar } from '../GitSidebar';
import { ArtifactData } from '@/lib/services/db';
import { LayoutState } from './types';

interface DashboardSidebarProps {
  position: 'left' | 'right';
  width: 'normal' | 'expanded';
  toggleWidth: () => void;
  theme: 'light' | 'dark';
  layout: LayoutState;
  setLayout: (state: Partial<LayoutState>) => void;
  children?: React.ReactNode;
  artifacts?: ArtifactData[];
  createArtifact?: (type: string) => Promise<void>;
  setSelectedFolderId?: (id: string | null) => void;
  leftContent?: React.ReactNode;
}

export function DashboardSidebar({
  position, 
  width, 
  toggleWidth, 
  theme,
  layout,
  setLayout,
  children,
  artifacts = [],
  createArtifact,
  setSelectedFolderId,
  leftContent
}: DashboardSidebarProps) {
  
  const isLeftSide = position === 'left';
  const sidebarClasses = `flex flex-col border-${isLeftSide ? 'r' : 'l'} bg-muted/20 p-2 space-y-4 overflow-y-auto sticky-${position}-sidebar ${width === 'expanded' ? 'sidebar-expanded' : 'w-64'} ${theme}`;
  
  return (
    <div className={sidebarClasses}>
      <div className="flex items-center justify-end p-1 border-b">
        <Button 
          variant="ghost"
          size="sm"
          onClick={toggleWidth}
          title={width === 'expanded' ? 'Reduce sidebar' : 'Expand sidebar'}
        >
          {width === 'expanded' ? 
            <Minimize2 className="h-4 w-4" /> : 
            <Maximize2 className="h-4 w-4" />
          }
        </Button>
      </div>

      {isLeftSide ? (
        <ScrollArea className="flex-grow">
          <div className="p-4">
            {leftContent}
          </div>
        </ScrollArea>
      ) : (
        <ScrollArea className="flex-grow">
          <div className="px-1 space-y-4">
            {/* Stats Card Collapsible */}
            <Collapsible open={layout.showStats} onOpenChange={(open) => setLayout({ ...layout, showStats: open })}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center cursor-pointer mb-2 p-2 rounded hover:bg-muted">
                  {layout.showStats ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="ml-2 font-semibold text-lg">Statistics</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <StatsCard userArtifacts={artifacts} />
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
                    {createArtifact && (
                      <>
                        <Button 
                          className="w-full justify-start" 
                          onClick={() => createArtifact('code')}
                        >
                          <ChevronRight className="mr-2 h-4 w-4" />
                          New Code Snippet
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="secondary"
                          onClick={() => createArtifact('project')}
                        >
                          <ChevronRight className="mr-2 h-4 w-4" />
                          New Project
                        </Button>
                      </>
                    )}
                    
                    {setSelectedFolderId && (
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setSelectedFolderId(null)}
                      >
                        <ChevronRight className="mr-2 h-4 w-4" />
                        View All Files
                      </Button>
                    )}
                    
                    {setLayout && (
                      <Button 
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => {
                          setLayout({ activeTab: "pseudocode", tabVisibility: { ...layout.tabVisibility, pseudocode: true } });
                        }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Generate Pseudocode
                      </Button>
                    )}
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
            
            {children}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
