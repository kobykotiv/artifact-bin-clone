import axios from 'axios';
import Mustache from 'mustache';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { env } from '@/lib/config/env';
import { type TicketTemplate } from '../templates/ticketTemplates';

const JIRA_API = env.jira.api;
const JIRA_TOKEN = env.jira.token;
const JIRA_PROJECT = env.jira.project;

export interface JiraTicket {
  title: string;
  type: string;
  priority: string;
  description: string;
  labels: string[];
}

export async function createJiraTicket(ticket: JiraTicket) {
  try {
    const response = await axios.post(
      `${JIRA_API}/issue`,
      {
        fields: {
          project: { key: JIRA_PROJECT },
          summary: ticket.title,
          description: ticket.description,
          issuetype: { name: ticket.type },
          priority: { name: ticket.priority },
          labels: ticket.labels
        }
      },
      {
        headers: {
          Authorization: `Bearer ${JIRA_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to create Jira ticket:', error);
    throw error;
  }
}

export async function createTicketFromTemplate(
  templateName: string,
  variables: Record<string, string>
) {
  // Load template
  const templatePath = `/lib/templates/jira/${templateName}.yaml`;
  const template = readFileSync(templatePath, 'utf-8');
  const rendered = Mustache.render(template, variables);
  const ticket = load(rendered) as JiraTicket;
  
  return await createJiraTicket(ticket);
}

export function formatTicketMarkdown(ticket: TicketTemplate): string {
  return [
    `# ${ticket.summary}`,
    '',
    `> Type: ${ticket.type} | Priority: ${ticket.priority} | Labels: ${ticket.labels.join(', ')}`,
    '',
    ticket.description,
    '',
    '---'
  ].join('\n');
}
