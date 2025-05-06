export interface LayoutState {
  showExplorer: boolean;
  showPromptPanel: boolean;
  showGitPanel: boolean;
  showQuickActions: boolean;
  showSaaS: boolean;
  showStats: boolean; // Added showStats
  activeTab: string;
  tabVisibility: {
    artifacts: boolean;
    folders: boolean;
    pseudocode: boolean;
  };
}
