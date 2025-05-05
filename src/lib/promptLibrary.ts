type VariableType = 'multiple' | 'single' | 'singleton';

interface PromptVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[]; // For select type
  required: boolean;
  default?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Parse the template string and extract variable names
 */
export function extractVariables(template: string): PromptVariable[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: PromptVariable[] = [];
  const variableSet = new Set<string>();
  
  let match;
  while ((match = regex.exec(template)) !== null) {
    const fullMatch = match[0]; // {{variable}}
    const varContent = match[1].trim(); // variable
    
    // Handle complex variable syntax like {{variable-option1-option2}}
    const parts = varContent.split('-');
    const varName = parts[0].trim();
    
    // Skip if we've already processed this variable
    if (variableSet.has(varName)) continue;
    variableSet.add(varName);
    
    // Determine variable type
    let varType: PromptVariable['type'] = 'text';
    let options: string[] | undefined;
    
    if (parts.length > 1) {
      // If there are options, make it a select type
      varType = 'select';
      options = parts.slice(1);
    }
    
    variables.push({
      name: varName,
      type: varType,
      options,
      required: !template.includes(`{{${varName}?}}`), // Optional if has ?
      default: ''
    });
  }
  
  return variables;
}

/**
 * Process a template with the given variables
 */
export function processTemplate(template: string, variables: Record<string, string>): string {
  let processed = template;
  
  // Process simple variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}(\\?)?\\}\\}`, 'g');
    processed = processed.replace(regex, value);
  });
  
  // Process complex variables with options
  Object.entries(variables).forEach(([key, value]) => {
    const complexRegex = new RegExp(`\\{\\{${key}-[^}]*\\}\\}`, 'g');
    processed = processed.replace(complexRegex, value);
  });
  
  // Clean up any unfilled optional variables
  processed = processed.replace(/\{\{[^}]+\?\}\}/g, '');
  
  // Warn about unfilled required variables by leaving them marked
  return processed;
}

/**
 * Save a prompt template to the database
 */
export async function savePromptTemplate(template: PromptTemplate): Promise<PromptTemplate> {
  // Implementation to save the template
  return template;
}

/**
 * Get all prompt templates
 */
export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  // Implementation to fetch templates
  return [];
}

/**
 * Get a prompt template by ID
 */
export async function getPromptTemplateById(id: string): Promise<PromptTemplate | null> {
  // Implementation to fetch a specific template
  return null;
}

export class PromptLibrary {
  templates: PromptTemplate[] = [];
  
  registerTemplate(template: PromptTemplate) {
    this.templates.push(template);
  }
  
  getTemplate(id: string) {
    return this.templates.find(t => t.id === id);
  }
  
  renderPrompt(templateId: string, variables: Record<string, any>): string {
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);
    
    let result = template.prompt;
    
    // Replace all variables using the {{variable}} syntax
    template.variables.forEach(v => {
      const regex = new RegExp(`{{${v.name}}}`, 'g');
      const value = variables[v.name] || v.default || '';
      
      if (v.type === 'multiple' && Array.isArray(value)) {
        result = result.replace(regex, value.join(', '));
      } else {
        result = result.replace(regex, String(value));
      }
    });
    
    return result;
  }
}

// Example usage:
export const promptLibrary = new PromptLibrary();
promptLibrary.registerTemplate({
  id: 'business-plan',
  name: 'Business Plan Generator',
  description: 'Generate a business plan',
  prompt: 'Create a {{planType}} plan for {{industry}} with {{focus}} focus.',
  variables: [
    { name: 'planType', type: 'single', description: 'Type of plan', options: ['marketing', 'financial', 'strategic'] },
    { name: 'industry', type: 'single', description: 'Industry' },
    { name: 'focus', type: 'multiple', description: 'Focus areas' }
  ],
  category: 'business',
  tags: ['plan', 'business'],
  author: 'Author Name',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'business-pitch',
    name: 'Business Pitch Generator',
    description: 'Create a compelling business pitch for your startup',
    prompt: `We're building a {{productDescriptor}} {{productType}} for {{targetAudience}} that solves {{problemSolved}} through our {{businessModel}}. {{#revenueModel}}Our {{revenueModel}} model focuses on {{focusArea}}{{/revenueModel}} with a clear advantage over {{competitorType}} through our {{advantage}}. {{#fundingStatus}}Backed by {{fundingStatus}}, {{/fundingStatus}}our team of {{teamDescriptor}} has already achieved {{achievement}} as we {{marketAction}} the industry.`,
    variables: [
      {
        name: 'productDescriptor',
        description: 'A descriptive adjective for your product',
        type: 'select',
        options: ['innovative', 'cutting-edge', 'game-changing', 'revolutionary', 'scalable', 'intuitive'],
        defaultValue: 'innovative',
        required: true
      },
      {
        name: 'productType',
        description: 'The category of your product',
        type: 'select',
        options: ['SaaS platform', 'mobile app', 'AI solution', 'marketplace', 'productivity tool', 'analytics dashboard'],
        required: true
      },
      {
        name: 'targetAudience',
        description: 'Your primary customer segment',
        type: 'text',
        required: true
      },
      {
        name: 'problemSolved',
        description: 'The main problem your product solves',
        type: 'text',
        required: true
      },
      {
        name: 'businessModel',
        description: 'Your business approach',
        type: 'select',
        options: ['freemium model', 'subscription service', 'enterprise solution', 'marketplace', 'API-as-a-service'],
        required: true
      },
      {
        name: 'revenueModel',
        description: 'How you generate revenue',
        type: 'select',
        options: ['SaaS', 'transaction-based', 'usage-based', 'licensing', 'advertising'],
        required: false
      },
      {
        name: 'focusArea',
        description: 'Key business focus',
        type: 'select',
        options: ['customer acquisition', 'retention', 'lifetime value', 'network effects', 'economies of scale'],
        required: false
      },
      {
        name: 'competitorType',
        description: 'What type of competitors you face',
        type: 'text',
        required: true
      },
      {
        name: 'advantage',
        description: 'Your key competitive advantage',
        type: 'text',
        required: true
      },
      {
        name: 'fundingStatus',
        description: 'Your funding situation',
        type: 'text',
        required: false
      },
      {
        name: 'teamDescriptor',
        description: 'How to describe your team',
        type: 'text',
        defaultValue: 'experienced innovators',
        required: true
      },
      {
        name: 'achievement',
        description: 'A key achievement so far',
        type: 'text',
        required: true
      },
      {
        name: 'marketAction',
        description: 'What you're doing to the market',
        type: 'select',
        options: ['disrupt', 'transform', 'revolutionize', 'redefine', 'optimize'],
        required: true
      }
    ],
    category: 'Marketing',
    tags: ['pitch', 'startup', 'business'],
    author: 'Author Name',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tech-stack-recommendation',
    name: 'Tech Stack Recommendation',
    description: 'Generate a recommended tech stack for your project',
    prompt: `# Recommended Tech Stack for {{projectName}}\n\n## Project Overview\n{{projectDescription}}\n\n## Frontend\n{{#frontendFrameworks}}{{.}}{{^isLast}}, {{/isLast}}{{/frontendFrameworks}}\n\n## Backend\n{{backendFramework}}\n\n## Database\n{{database}}\n\n## DevOps & Infrastructure\n{{#devOpsTools}}{{.}}{{^isLast}}, {{/isLast}}{{/devOpsTools}}\n\n## Additional Considerations\n{{additionalConsiderations}}`,
    variables: [
      {
        name: 'projectName',
        description: 'Name of your project',
        type: 'text',
        required: true
      },
      {
        name: 'projectDescription',
        description: 'Brief description of your project',
        type: 'text',
        required: true
      },
      {
        name: 'frontendFrameworks',
        description: 'Frontend technologies to use',
        type: 'multiselect',
        options: ['React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'React Native', 'Flutter'],
        required: true
      },
      {
        name: 'backendFramework',
        description: 'Backend framework',
        type: 'select',
        options: ['Node.js/Express', 'Django', 'Ruby on Rails', 'Spring Boot', 'Laravel', 'FastAPI', '.NET Core'],
        required: true
      },
      {
        name: 'database',
        description: 'Database technology',
        type: 'select',
        options: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'DynamoDB', 'Firebase', 'Supabase'],
        required: true
      },
      {
        name: 'devOpsTools',
        description: 'DevOps and infrastructure tools',
        type: 'multiselect',
        options: ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'GitHub Actions', 'CircleCI', 'Terraform'],
        required: true
      },
      {
        name: 'additionalConsiderations',
        description: 'Any other technical considerations',
        type: 'text',
        required: false
      }
    ],
    category: 'Development',
    tags: ['tech stack', 'architecture', 'development'],
    author: 'Author Name',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to parse template with variables
export function parseTemplate(template: string, variables: Record<string, any>): string {
  // Basic variable replacement
  let result = template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? variables[varName] : match;
  });
  
  // Handle conditional blocks {{#var}}content{{/var}}
  result = result.replace(/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs, (match, varName, content) => {
    const value = variables[varName];
    
    // If variable exists and has a value, include the content
    if (value) {
      // For arrays, we need to handle each item
      if (Array.isArray(value)) {
        return value.map((item, i) => {
          // Add isLast flag for comma handling
          const itemWithMeta = typeof item === 'object' ? 
            { ...item, isLast: i === value.length - 1 } : 
            { value: item, isLast: i === value.length - 1 };
          
          // Replace {{.}} with the item itself
          return content.replace(/\{\{\.\}\}/g, typeof item === 'object' ? JSON.stringify(item) : item.toString());
        }).join('');
      }
      
      return content;
    }
    
    // If variable doesn't exist or is falsy, exclude the content
    return '';
  });
  
  return result;
}

export const startupOrganizationTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: 'Daily Team Organization',
    description: 'Create a daily meeting agenda to keep your team organized',
    prompt: 'Create a {{meetingType-standup-review-planning}} meeting agenda for a {{teamSize-small-medium-large}} {{teamType-product-dev-design-marketing}} team with {{focusArea-goals-roadblocks-planning}} as the main focus.',
    tags: ['meetings', 'organization', 'team'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'SaaS Pricing Strategy',
    description: 'Generate a pricing strategy for your SaaS product',
    prompt: 'Create a {{pricingType-tiered-usage-freemium-enterprise}} pricing strategy for a {{productType-B2B-B2C-B2B2C}} SaaS product in the {{industry}} space with {{customerSize-small-mid-enterprise}} businesses as the target market.',
    tags: ['pricing', 'saas', 'strategy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Product Roadmap',
    description: 'Generate a roadmap for your product development',
    prompt: 'Create a {{timeframe-3-month-6-month-1-year}} product roadmap for a {{productStage-early-growth-mature}} SaaS product focusing on {{priorityArea-features-scalability-integrations-ux}}.',
    tags: ['roadmap', 'planning', 'product'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const startupOrganizationVariables: Record<string, string[]> = {
  'meetingType': ['standup', 'review', 'planning', 'retrospective'],
  'teamSize': ['small', 'medium', 'large'],
  'teamType': ['product', 'dev', 'design', 'marketing', 'sales', 'customer success'],
  'focusArea': ['goals', 'roadblocks', 'planning', 'metrics', 'customer feedback'],
  'pricingType': ['tiered', 'usage-based', 'freemium', 'enterprise'],
  'productType': ['B2B', 'B2C', 'B2B2C'],
  'industry': ['fintech', 'healthtech', 'edtech', 'martech', 'devtools', 'productivity'],
  'customerSize': ['small', 'mid-market', 'enterprise'],
  'timeframe': ['3-month', '6-month', '1-year'],
  'productStage': ['early', 'growth', 'mature'],
  'priorityArea': ['features', 'scalability', 'integrations', 'ux', 'security']
};
