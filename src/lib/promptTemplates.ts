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
`
Design a technology stack for the project: {{projectName}}.

Consider the following aspects and for each choice, briefly mention the **key reasons** and **potential trade-offs** (e.g., learning curve, cost, scalability, ecosystem maturity).

1.  **Overall Architecture Style:**
    *   Choice: {{architecture}}
    *   Reasons & Trade-offs:

2.  **Frontend Framework:**
    *   Choice: {{frontendFramework}}
    *   Reasons & Trade-offs:

3.  **Frontend State Management (if applicable):**
    *   Choice: {{stateManagement}}
    *   Reasons & Trade-offs:

4.  **Frontend UI Library/Component Set:**
    *   Choice: {{uiLibrary}}
    *   Reasons & Trade-offs:

5.  **Backend Framework/Language:**
    *   Choice: {{backendFramework}}
    *   Reasons & Trade-offs:

6.  **Database:**
    *   Choice: {{database}}
    *   Reasons & Trade-offs:

7.  **API Style (e.g., REST, GraphQL, gRPC):**
    *   Choice: {{apiStyle}}
    *   Reasons & Trade-offs:

8.  **Hosting/Deployment Platform:**
    *   Choice: {{hosting}}
    *   Reasons & Trade-offs:

9.  **CI/CD Solution:**
    *   Choice: {{cicd}}
    *   Reasons & Trade-offs:

10. **Monitoring & Logging:**
    *   Choice: {{monitoring}}
    *   Reasons & Trade-offs:

11. **Other Key Technologies (e.g., Caching, Search, Messaging Queues):**
    *   [Specify Technology Type]:
        *   Choice:
        *   Reasons & Trade-offs:

Overall Rationale:
Briefly summarize why this combination of technologies is suitable for {{projectName}}.
`
  ),

  startupFoundation: new PromptTemplate(
    `
Develop a foundational strategy document for a new startup.

Business Concept:
{{businessConcept}}

Problem Addressed:
{{problemToSolve}}

Target Market Deep Dive:
Describe the ideal customer for this startup. Go beyond demographics into psychographics, behaviors, and specific pain points related to the problem.
{{targetMarketDescription}}

Unique Selling Propositions (USPs):
What makes this startup different and better than alternatives?
- {{uniqueSellingPoints_items}}

Core Team & Skills:
Identify the essential skills and roles required in the founding or early-stage team to execute this concept.
- {{coreTeamSkills_items}}

Initial Milestones (First 3-6 Months):
What are the critical, measurable goals to achieve in the short term to validate the concept and build momentum?
- {{initialMilestones_items}}

Funding Approach:
Outline the initial strategy for funding the startup.
{{fundingApproach}}

Risk Assessment & Mitigation:
Identify the top 2-3 significant risks this startup might face and brainstorm potential mitigation strategies.
{{biggestRisks}}

Based on the above, provide a concise strategic summary and recommend the next immediate steps for the founders.
    `
  ),

  saaSModelCanvas: new PromptTemplate(
`
Generate a detailed SaaS Business Model Canvas for "{{productName}}".

1.  **Value Proposition:**
    What unique value does your SaaS offer to customers? How do you solve their problems or satisfy their needs?
    {{valueProposition}}

2.  **Customer Segments:**
    Who are the different groups of people or organizations your SaaS aims to reach and serve?
    {{customerSegments[]}}

3.  **Channels:**
    How does your SaaS reach its Customer Segments to deliver its Value Proposition?
    {{channels[]}}

4.  **Customer Relationships:**
    What type of relationship does each Customer Segment expect you to establish and maintain with them?
    {{customerRelationships[]}}

5.  **Revenue Streams:**
    How does your SaaS generate revenue from each Customer Segment? For what value are customers willing to pay?
    {{revenueStreams[]}}

6.  **Key Activities:**
    What are the most important activities your SaaS must perform to make its business model work?
    {{keyActivities[]}}

7.  **Key Resources:**
    What are the most important assets required to make your SaaS business model work?
    {{keyResources[]}}

8.  **Key Partnerships:**
    Who are the key partners and suppliers needed to make the SaaS business model work?
    {{keyPartnerships[]}}

9.  **Cost Structure:**
    What are the most important costs incurred while operating under this SaaS business model?
    {{costStructure}}

Summarize the core strengths and potential weaknesses of this SaaS model based on the canvas.
    `
  ),

  websiteDesign: new PromptTemplate( // New
`
Generate a comprehensive design brief for a new website.

Website Name/Brand: {{siteName}}
Type of Website: {{siteType}}

Target Audience:
{{targetAudience}}

Core Purpose/Goal of the Website:
{{corePurpose}}

Key Pages/Sections Required:
{{keyPagesSections[]}}

Desired Design Style/Aesthetic:
{{designStyle}}

Inspirational Websites (if any):
{{inspirations[]}}

Key message or feeling the website should convey:

Any specific functionalities or integrations needed (e.g., contact form, e-commerce, blog):

Branding elements available (logo, color palette, fonts - if any):

Call to Action: What is the primary action you want visitors to take?

Notes on content (e.g., who provides it, what tone):
`
  ),

  mobileAppConcept: new PromptTemplate( // New
`
Develop a detailed concept for a new mobile application.

App Name: {{appName}}
Type of App: {{appType}}
Target Platform(s): {{platform}}

Problem Solved by App:
{{problemSolved}}

Core Features:
{{coreFeatures[]}}

Unique Selling Point (USP):
{{uniqueSellingPoint}}

Target User Persona (brief description):

Monetization Strategy (if applicable):
{{monetizationStrategy}}

Potential Competitors (if known):

Key Design Considerations or User Experience Goals:

Success Metrics (How would you measure the app's success?):
`
  ),

  aiMlAppConcept: new PromptTemplate( // New
`
Outline a concept for an AI/ML-powered application.

Application Name: {{appName}}
Primary AI/ML Task: {{aiTask}}

Target Users:
{{targetUsers}}

Input Data Description:
What data will the AI/ML model process?
{{inputDataDescription}}

Desired Output/Outcome:
What should the application produce or what insights should it provide?
{{outputDescription}}

Key Features of the Application (beyond the core AI/ML task):
- User Interface for interacting with the AI/ML model
- Data input mechanisms
- Results visualization/presentation
- User accounts and personalization (if applicable)

Key Metrics for Success:
{{keyMetricsForSuccess[]}}

Potential Challenges & Mitigation Strategies:
{{potentialChallenges}}

Ethical Considerations (if any):

Technology Stack Ideas (optional - e.g., Python, TensorFlow, PyTorch, Scikit-learn for backend; React, Vue for frontend):
`
  ),

  threeJsApp: new PromptTemplate(
`
Develop a concept brief for a Faux 3D application using Three.js.

Application Name: {{appName}}

Core Concept & Purpose:
{{conceptDescription}}

Target Audience:
{{targetAudience}}

Key 3D Objects / Models to be featured:
{{key3DObjects[]}}

Primary Interaction Style:
{{interactionStyle}}

Desired Visual Aesthetic / Art Style:
{{desiredAesthetic}}

Core Functionality (What users can DO in the app):
{{coreFunctionality}}

Technical Considerations / Specific Three.js features to explore (optional):
{{techConsiderations}}

Monetization Strategy (if any):

Success Metrics (How would success be measured?):
`
  ),

  wordpressTheme: new PromptTemplate(
`
Create a detailed brief for a new WordPress Theme.

Theme Name: {{themeName}}

Target Audience / Niche:
{{targetAudienceOrNiche}}

Overall Theme Style & Aesthetic:
{{themeStyle}}

Key Features & Functionality (must-haves):
{{keyFeatures[]}}

Required Page Templates:
{{requiredTemplates[]}}

Key Plugin Compatibility Requirements (optional):
{{pluginCompatibility[]}}

Monetization Strategy (if this is a premium theme, otherwise N/A):
{{monetizationAspects}}

Unique Selling Proposition (What makes this theme stand out?):

Notes on Design Inspiration or Competitor Themes to consider:
`
  )
};
