export interface UserTemplateField {
  name: string; // Corresponds to {{name}} in the template
  label: string; // Display label in the UI
  type: 'text' | 'textarea' | 'array'; // Input type
  placeholder?: string;
  defaultValue?: string | string[];
}

export interface UserDefinedTemplate {
  id: string; // Unique ID for the template
  name: string; // Display name for the template
  description?: string;
  templateType: 'prompt' | 'pseudocode' | 'document'; // Category of template
  content: string; // The actual template string with {{mustache}} variables
  fields: UserTemplateField[]; // Definitions for the UI to collect variable values
  icon?: string; // Optional: lucide-react icon name
}

const USER_TEMPLATES_STORAGE_KEY = 'userDefinedTemplates';

// Basic functions (localStorage for simplicity, consider a backend for production)

export function loadUserTemplates(): UserDefinedTemplate[] {
  try {
    const storedTemplates = localStorage.getItem(USER_TEMPLATES_STORAGE_KEY);
    return storedTemplates ? JSON.parse(storedTemplates) : [];
  } catch (error) {
    console.error("Failed to load user templates:", error);
    return [];
  }
}

export function saveUserTemplates(templates: UserDefinedTemplate[]): void {
  try {
    localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Failed to save user templates:", error);
  }
}

export function addUserTemplate(template: Omit<UserDefinedTemplate, 'id'>): UserDefinedTemplate {
  const templates = loadUserTemplates();
  const newTemplate: UserDefinedTemplate = {
    ...template,
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };
  templates.push(newTemplate);
  saveUserTemplates(templates);
  return newTemplate;
}

export function updateUserTemplate(updatedTemplate: UserDefinedTemplate): void {
  let templates = loadUserTemplates();
  templates = templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
  saveUserTemplates(templates);
}

export function deleteUserTemplate(templateId: string): void {
  let templates = loadUserTemplates();
  templates = templates.filter(t => t.id !== templateId);
  saveUserTemplates(templates);
}

// Example: Function to apply a user template (similar to PromptTemplate.generate)
export function applyUserTemplate(templateContent: string, variables: Record<string, string | string[]>): string {
  let result = templateContent;
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    if (Array.isArray(value)) {
      result = result.replace(pattern, value.join('\n- ')); // Simple array to list
    } else {
      result = result.replace(pattern, String(value));
    }
  });
  // Clean up unreplaced placeholders (optional)
  result = result.replace(/{{[A-Za-z0-9_]+}}/g, `[${'$'}{'{'}Not provided: $&${'}'}]`);
  return result;
}
