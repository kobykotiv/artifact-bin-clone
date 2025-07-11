export interface TicketTemplate {
  title: string;
  type: 'Story' | 'Bug' | 'Task';
  priority: 'Low' | 'Medium' | 'High';
  description: string;
  steps?: string[];
  acceptance?: string[];
  labels: string[];
}

export const templates = {
  featureRequest: (vars: {
    feature: string;
    description: string;
    acceptance?: string[];
  }): TicketTemplate => ({
    title: `Add ${vars.feature}`,
    type: 'Story',
    priority: 'Medium',
    description: vars.description,
    acceptance: vars.acceptance || [],
    labels: ['feature', 'needs-review']
  }),

  bugReport: (vars: {
    component: string;
    error: string;
    steps: string[];
  }): TicketTemplate => ({
    title: `Fix ${vars.component} error`,
    type: 'Bug',
    priority: 'High',
    description: vars.error,
    steps: vars.steps,
    labels: ['bug', 'needs-triage']
  }),

  promptUpdate: (vars: {
    component: string;
    currentPrompt: string;
    suggestedPrompt: string;
  }): TicketTemplate => ({
    title: `Update prompt in ${vars.component}`,
    type: 'Task',
    priority: 'Medium',
    description: [
      '## Current Prompt',
      '```',
      vars.currentPrompt,
      '```',
      '## Suggested Prompt',
      '```',
      vars.suggestedPrompt,
      '```'
    ].join('\n'),
    labels: ['prompt-engineering', 'ai']
  }),

  startupActionItem: (vars: {
    actionTitle: string;
    context: string; // e.g., From SaaS Bootstrapper Guide - Section 2
    details?: string;
    dueDate?: string; // Optional due date
    assignee?: string; // Optional assignee
  }): TicketTemplate => ({
    title: `Action: ${vars.actionTitle}`,
    type: 'Task',
    priority: 'Medium',
    description: `
Context: ${vars.context}
${vars.details ? `\nDetails:\n${vars.details}\n` : ''}
${vars.dueDate ? `\nSuggested Due Date: ${vars.dueDate}` : ''}
${vars.assignee ? `\nSuggested Assignee: ${vars.assignee}` : ''}
    `.trim(), // Use trim() to remove leading/trailing whitespace from template literal
    acceptance: [`${vars.actionTitle} completed and verified.`],
    labels: ['startup-task', 'planning']
  }),

  newFeatureRequest: (vars: {
    featureName: string;
    description: string;
    userStory?: string;
    acceptanceCriteria?: string[];
    relatedComponent?: string; // e.g., PromptGenerator, PseudocodeGenerator
  }): TicketTemplate => ({
    title: `Feature Request: ${vars.featureName}`,
    type: 'Story',
    priority: 'Medium',
    description: `
## Feature Description
${vars.description}

${vars.userStory ? `## User Story\nAs a user, I want to ${vars.userStory} so that I can achieve [benefit].\n` : ''}
${vars.relatedComponent ? `\n## Related Component/Area\n${vars.relatedComponent}\n` : ''}
    `.trim(), // Use trim()
    acceptance: vars.acceptanceCriteria || [`${vars.featureName} is implemented and works as described.`],
    labels: ['feature-request', 'enhancement', 'needs-scoping']
  })
};

export function formatTicket(ticket: TicketTemplate): string {
  let markdown = `# ${ticket.title}\n\n`;
  markdown += `> Type: ${ticket.type} | Priority: ${ticket.priority}\n\n`;
  markdown += ticket.description + '\n\n';

  if (ticket.steps?.length) {
    markdown += '## Steps to Reproduce\n';
    ticket.steps.forEach((step, i) => {
      markdown += `${i + 1}. ${step}\n`;
    });
    markdown += '\n';
  }

  if (ticket.acceptance?.length) {
    markdown += '## Acceptance Criteria\n';
    ticket.acceptance.forEach(criteria => {
      markdown += `- [ ] ${criteria}\n`;
    });
    markdown += '\n';
  }

  markdown += `Labels: ${ticket.labels.join(', ')}\n`;

  return markdown;
}
