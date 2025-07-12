import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ArtifactList } from '@/components/ArtifactList';
import { FolderView } from './FolderView';
import PseudocodeGenerator from '@/lib/templates/PseudocodeGenerator';
import type { ArtifactData, FolderData } from '@/lib/services/db';
import type { LayoutState } from './types';
import { StartupOrgGenerator } from '../StartupOrgGenerator';

interface DashboardTabsProps {
  layout: LayoutState;
  setLayout: (state: Partial<LayoutState>) => void;
  artifacts: ArtifactData[];
  selectedArtifactId: string | null;
  setSelectedArtifactId: (id: string | null) => void;
  viewMode: 'grid' | 'list';
  folders: FolderData[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  shareFolder: (folderId: string, emails: string[]) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  createArtifact: (type: string, template?: any) => Promise<void>;
}

export function DashboardTabs({
  layout,
  setLayout,
  artifacts,
  selectedArtifactId,
  setSelectedArtifactId,
  viewMode,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  createFolder,
  shareFolder,
  deleteFolder,
  createArtifact
}: DashboardTabsProps) {

  // Filter artifacts based on selected folder
  const filteredArtifacts = artifacts.filter(artifact => {
    // Show all artifacts if no folder is selected
    if (!selectedFolderId) return true;
    // Show only artifacts in the selected folder
    return artifact.folderId === selectedFolderId;
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setLayout({
      activeTab: value,
      tabVisibility: {
        ...layout.tabVisibility,
        [value]: true
      }
    });
  };

  return (
    <Tabs defaultValue="artifacts" value={layout.activeTab} onValueChange={handleTabChange}>
      <TabsList className="sticky-tabs-header">
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

          <TabsTrigger 
            value="organization" 
            className="flex items-center"
            onClick={() => setLayout({ tabVisibility: { ...layout.tabVisibility, organization: !layout.tabVisibility.organization } })}
          >
            Organization
            {layout.tabVisibility.organization ? 
              <ChevronDown className="ml-2 h-4 w-4" /> : 
              <ChevronRight className="ml-2 h-4 w-4" />
            }
          </TabsTrigger>
        </div>
      </TabsList>
      
      {/* Tab Contents */}
      <div className="border rounded-lg p-4 mt-2">
        {layout.activeTab === "artifacts" && layout.tabVisibility.artifacts && (
          <ArtifactList
            artifacts={filteredArtifacts.map(a => ({
              ...a,
              language: a.language ?? 'javascript',
              code: a.code ?? '', // ensure code is always present
            }))}
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
            }}
            onClose={() => {
              setLayout({ 
                activeTab: "artifacts", 
                tabVisibility: { ...layout.tabVisibility, pseudocode: false } 
              });
            }}
          />
        )}

        {layout.activeTab === "organization" && layout.tabVisibility.organization && (
          <StartupOrgGenerator
            onSave={(data) => {
              createArtifact('organization', data);
              setLayout({ 
                activeTab: "artifacts", 
                tabVisibility: { ...layout.tabVisibility, organization: false } 
              });
            }}
          />
        )}
      </div>
    </Tabs>
  );
}
