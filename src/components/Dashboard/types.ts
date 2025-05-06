export interface LayoutState {
  showExplorer: boolean;
  showPromptPanel: boolean;
  showGitPanel: boolean;
  activeTab: string;
  tabVisibility: {
    artifacts: boolean;
    folders: boolean;
    pseudocode: boolean;
  };
}
