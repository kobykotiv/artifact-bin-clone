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
