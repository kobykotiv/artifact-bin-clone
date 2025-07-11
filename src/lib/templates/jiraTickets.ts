export interface JiraTicketTemplate {
  summary: string;
  description: string;
  type: 'Task' | 'Bug' | 'Story' | 'Epic';
  priority: 'Low' | 'Medium' | 'High';
  labels: string[];
  points?: number;
  subtasks?: string[];
}

export const ticketTemplates = {
  auth: {
    epic: {
      summary: "Implement Authentication System",
      description: "Set up secure user authentication with multiple providers",
      type: "Epic",
      priority: "High",
      labels: ["auth", "security", "core"],
      subtasks: [
        "Set up OAuth providers",
        "Implement JWT handling",
        "Create protected routes",
        "Add user session management"
      ]
    },
    tasks: [
      {
        summary: "OAuth Integration",
        description: "Integrate social login providers",
        type: "Task",
        priority: "High",
        points: 5,
        labels: ["auth", "integration"]
      },
      {
        summary: "User Session Management",
        description: "Implement secure session handling",
        type: "Task",
        priority: "High",
        points: 3,
        labels: ["auth", "security"]
      }
    ]
  },
  search: {
    epic: {
      summary: "Search System Implementation",
      description: "Build scalable search functionality",
      type: "Epic",
      priority: "Medium",
      labels: ["search", "core"],
      subtasks: [
        "Set up search index",
        "Implement search API",
        "Create search UI components",
        "Add search analytics"
      ]
    },
    tasks: [
      {
        summary: "Search Index Setup",
        description: "Configure and optimize search indexing",
        type: "Task",
        priority: "Medium",
        points: 5,
        labels: ["search", "infrastructure"]
      },
      {
        summary: "Search UI Components",
        description: "Build reusable search interface components",
        type: "Task",
        priority: "Medium",
        points: 3,
        labels: ["search", "ui"]
      }
    ]
  }
};

export function generateJiraTickets(feature: string): JiraTicketTemplate[] {
  const template = ticketTemplates[feature];
  if (!template) return [];

  const tickets: JiraTicketTemplate[] = [template.epic];
  return [...tickets, ...template.tasks];
}
