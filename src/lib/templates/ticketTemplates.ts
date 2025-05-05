export interface TicketTemplate {
  summary: string;
  description: string;
  type: string;
  priority: 'Low' | 'Medium' | 'High';
  labels: string[];
  fields?: Record<string, string>;
}

export const ticketTypes = {
  bug: {
    template: (vars: Record<string, string>): TicketTemplate => ({
      summary: `[Bug] ${vars.title || 'Issue'}`,
      description: [
        `## Issue Description`,
        vars.description || '',
        `## Steps to Reproduce`,
        vars.steps || '1. ',
        `## Expected Behavior`,
        vars.expected || '',
        `## Actual Behavior`,
        vars.actual || '',
        `## Environment`,
        vars.environment || 'Production'
      ].join('\n\n'),
      type: 'Bug',
      priority: 'High',
      labels: ['bug', 'needs-triage']
    })
  },
  feature: {
    template: (vars: Record<string, string>): TicketTemplate => ({
      summary: `[Feature] ${vars.title || 'New Feature'}`,
      description: [
        `## Overview`,
        vars.description || '',
        `## Acceptance Criteria`,
        vars.criteria || '- [ ] ',
        `## Technical Notes`,
        vars.notes || '',
        `## Dependencies`,
        vars.dependencies || 'None'
      ].join('\n\n'),
      type: 'Story',
      priority: 'Medium',
      labels: ['feature']
    })
  },
  prompt: {
    template: (vars: Record<string, string>): TicketTemplate => ({
      summary: `[Prompt] ${vars.title || 'Update prompt template'}`,
      description: [
        `## Current Prompt`,
        `\`\`\`\n${vars.current || ''}\n\`\`\``,
        `## Issue`,
        vars.issue || '',
        `## Suggested Improvement`,
        vars.suggestion || '',
        `## Expected Impact`,
        vars.impact || ''
      ].join('\n\n'),
      type: 'Task',
      priority: 'Medium',
      labels: ['ai', 'prompt-engineering']
    })
  }
};

export function generateTicket(type: keyof typeof ticketTypes, vars: Record<string, string>): TicketTemplate {
  return ticketTypes[type].template(vars);
}
