export interface LayoutState {
  showExplorer: boolean;
  showPromptPanel: boolean;
  showGitPanel: boolean;
  showQuickActions: boolean;
  showSaaS: boolean;
  showStats: boolean;
  activeTab: string;
  tabVisibility: {
    artifacts: boolean;
    folders: boolean;
    pseudocode: boolean;
    organization?: boolean;
  };
}
