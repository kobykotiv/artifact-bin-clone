export type TemplateVariable = string | string[] | number | boolean | null | undefined;
export type TemplateVariables = Record<string, TemplateVariable>;

export class PromptTemplate {
  private template: string;
  
  constructor(template: string) {
    this.template = template;
  }
  
  /**
   * Generate a string by replacing variables in the template
   * Supports {{variable}} format and {{variable}}-{{variable}} linked format
   */
  generate(variables: TemplateVariables): string {
    let result = this.template;
    
    // Replace standard variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      
      if (value === undefined || value === null) {
        // Skip undefined/null values
        return;
      } else if (Array.isArray(value)) {
        // Handle arrays by joining with commas
        result = result.replace(pattern, value.join(', '));
      } else if (typeof value === 'boolean') {
        // Convert boolean to yes/no
        result = result.replace(pattern, value ? 'yes' : 'no');
      } else {
        // Convert numbers and strings to string
        result = result.replace(pattern, String(value));
      }
    });
    
    // Handle linked variables {{var1}}-{{var2}}
    const linkedPattern = /{{([^}]+)}}-{{([^}]+)}}/g;
    result = result.replace(linkedPattern, (match, var1, var2) => {
      const value1 = variables[var1];
      const value2 = variables[var2];
      
      if (value1 === undefined || value1 === null || 
          value2 === undefined || value2 === null) {
        return match; // Keep original if any variable is missing
      }
      
      // Handle arrays by taking the first item
      const val1 = Array.isArray(value1) ? value1[0] : value1;
      const val2 = Array.isArray(value2) ? value2[0] : value2;
      
      return `${val1}-${val2}`;
    });
    
    // Handle multiple items with plural variables {{variables[]}}
    const pluralPattern = /{{([^}]+)\[\]}}/g;
    result = result.replace(pluralPattern, (match, varName) => {
      const value = variables[varName];
      
      if (!Array.isArray(value)) {
        return match; // Keep original if not an array
      }
      
      return value.map(item => `- ${item}`).join('\n');
    });
    
    return result;
  }
}

// Create a prompt library with common templates
export const promptLibrary = {
  businessPlan: new PromptTemplate(
    "# {{businessName}} Business Plan\n\n" +
    "## Executive Summary\n" +
    "{{businessName}} is a {{businessType}} that provides {{valueProposition}} to {{targetCustomers}}.\n\n" +
    "## Market Analysis\n" +
    "Our target market includes {{targetMarket}} with an estimated size of {{marketSize}}.\n\n" +
    "## Product/Service\n" +
    "{{productDescription}}\n\n" +
    "## Key Features\n" +
    "{{features[]}}\n\n" +
    "## Revenue Model\n" +
    "Our primary revenue stream is {{revenueModel}}-{{pricingStrategy}}.\n\n" +
    "## Marketing Strategy\n" +
    "We will acquire customers through {{marketingChannels[]}}."
  ),
  
  marketingPlan: new PromptTemplate(
    "# Marketing Plan for {{productName}}\n\n" +
    "## Target Audience\n" +
    "{{audienceDescription}}\n\n" +
    "## Value Proposition\n" +
    "{{valueProposition}}\n\n" +
    "## Marketing Channels\n" +
    "{{channels[]}}\n\n" +
    "## Budget Allocation\n" +
    "Total budget: {{budget}}\n\n" +
    "## KPIs\n" +
    "{{kpis[]}}"
  ),
  
  techStack: new PromptTemplate(
    "# Technology Stack for {{projectName}}\n\n" +
    "## Architecture\n" +
    "{{architecture}}\n\n" +
    "## Frontend\n" +
    "- Framework: {{frontendFramework}}\n" +
    "- State Management: {{stateManagement}}\n" +
    "- UI Library: {{uiLibrary}}\n\n" +
    "## Backend\n" +
    "- Language/Framework: {{backendFramework}}\n" +
    "- Database: {{database}}\n" +
    "- API Style: {{apiStyle}}\n\n" +
    "## DevOps\n" +
    "- Hosting: {{hosting}}\n" +
    "- CI/CD: {{cicd}}\n" +
    "- Monitoring: {{monitoring}}"
  )
};
