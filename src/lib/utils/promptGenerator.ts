import { promptTemplates } from './promptTemplates';
import { getRandomItem } from './random';

function fillTemplate(template: string, variables: Record<string, string[]>): string {
  let result = template;
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  
  matches.forEach(match => {
    const key = match.replace(/[{}]/g, '');
    const options = variables[key] || [];
    const value = getRandomItem(options) || key;
    result = result.replace(match, value);
  });
  
  return result;
}

export function generatePrompt(): string {
  const category = getRandomItem(Object.keys(promptTemplates));
  if (!category) return "Create something amazing...";

  const templates = promptTemplates[category].templates;
  const variables = promptTemplates[category].variables;
  const template = getRandomItem(templates);
  
  if (!template) return "Create something amazing...";
  
  return fillTemplate(template, variables);
}

export function generateBatch(size: number = 5): string[] {
  return Array(size).fill(null).map(() => generatePrompt());
}
