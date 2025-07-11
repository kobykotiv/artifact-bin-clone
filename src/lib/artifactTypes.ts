import { BusinessPlanGenerator } from '@/components/BusinessPlanGenerator';
import { ProjectGenerator } from '@/components/ProjectGenerator';
import { SprintPlanner } from '@/components/SprintPlanner';
import { ArtifactEditor } from '@/components/ArtifactEditor';
import { ArtifactViewer } from '@/components/ArtifactViewer';

// Define component mappings based on artifact properties
export const artifactComponentRegistry = {
  getEditorComponent: (artifact) => {
    // Determine which component to use based on artifact properties
    if (artifact.language === 'project-spec') {
      try {
        const content = JSON.parse(artifact.content || '{}');
        
        if (content.marketingPlanData || 
            content.fundraisingPlanData || 
            content.budgetPlanData ||
            content.sharesPlanData ||
            content.startupPlanData ||
            content.objectivesPlanData) {
          return BusinessPlanGenerator;
        }
        
        if (content.type === 'sprint') {
          return SprintPlanner;
        }
        
        // Default project spec handler
        return ProjectGenerator;
      } catch (e) {
        console.error('Error parsing artifact content:', e);
        return ArtifactEditor;
      }
    }
    
    // Default editor for code artifacts
    return ArtifactEditor;
  },
  
  getViewerComponent: (artifact) => {
    // Similar logic to determine the appropriate viewer
    // ...

    return ArtifactViewer;
  }
};
