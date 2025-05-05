export type VariableType = 'text' | 'number' | 'select' | 'multiselect' | 'boolean';

export interface TemplateVariable {
  name: string;
  description?: string;
  type: VariableType;
  defaultValue?: string | string[] | number | boolean;
  options?: string[] | { label: string; value: string }[]; // For select/multiselect
  required?: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: TemplateVariable[];
  category?: string;
  tags?: string[];
}

// Parse template to extract variables: {{variable}} or {{variable-description}}
export function extractTemplateVariables(template: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = template.match(variableRegex) || [];
  
  return matches.map(match => {
    // Remove {{ and }}
    const varContent = match.slice(2, -2);
    // If there's a hyphen, take the part before it (variable name)
    const hyphenIndex = varContent.indexOf('-');
    return hyphenIndex > -1 ? varContent.slice(0, hyphenIndex) : varContent;
  });
}

// Render template with variables
export function renderTemplate(
  template: string, 
  variables: Record<string, string | string[] | number | boolean>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, varContent) => {
    // Get the variable name (part before hyphen if exists)
    const hyphenIndex = varContent.indexOf('-');
    const varName = hyphenIndex > -1 ? varContent.slice(0, hyphenIndex) : varContent;
    
    const value = variables[varName];
    
    if (value === undefined) {
      return match; // Keep the original placeholder if variable is not provided
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return String(value);
  });
}
