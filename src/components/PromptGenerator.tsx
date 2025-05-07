import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Wand2, Building2, LayoutGrid, Globe, Smartphone, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { promptLibrary, PromptTemplate, type TemplateVariables } from '@/lib/promptTemplates';

export type PromptType = 
  | 'businessPlan' 
  | 'marketingPlan' 
  | 'techStack' 
  | 'startupFoundation' 
  | 'saaSModelCanvas'
  | 'websiteDesign'
  | 'mobileAppConcept'
  | 'aiMlAppConcept'
  | 'threeJsApp'
  | 'wordpressTheme';

interface PromptGeneratorProps {
  initialPromptType?: PromptType;
  onSave: (generatedPrompt: string, inputs: TemplateVariables, promptType: PromptType) => void;
}

interface PromptField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'array';
  placeholder?: string;
}

const promptFields: Record<PromptType, PromptField[]> = {
  businessPlan: [
    { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Acme Inc.' },
    { name: 'businessType', label: 'Business Type', type: 'text', placeholder: 'SaaS platform' },
    { name: 'valueProposition', label: 'Value Proposition', type: 'textarea', placeholder: 'Streamlined workflow automation' },
    { name: 'targetCustomers', label: 'Target Customers', type: 'text', placeholder: 'SMB marketing teams' },
    { name: 'targetMarket', label: 'Target Market', type: 'text', placeholder: 'Digital marketing agencies' },
    { name: 'marketSize', label: 'Market Size', type: 'text', placeholder: '$10B annually' },
    { name: 'productDescription', label: 'Product Description', type: 'textarea', placeholder: 'A comprehensive platform that...' },
    { name: 'features', label: 'Key Features (one per line)', type: 'array', placeholder: 'One feature per line' },
    { name: 'revenueModel', label: 'Revenue Model', type: 'text', placeholder: 'subscription' },
    { name: 'pricingStrategy', label: 'Pricing Strategy', type: 'text', placeholder: 'tiered' },
    { name: 'marketingChannels', label: 'Marketing Channels (one per line)', type: 'array', placeholder: 'One channel per line' },
    { name: 'techStackConsiderations', label: 'Tech Stack Considerations', type: 'textarea', placeholder: 'Brief notes on tech for this plan.'}
  ],
  marketingPlan: [
    { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'ProductX' },
    { name: 'audienceDescription', label: 'Target Audience', type: 'textarea', placeholder: 'Tech-savvy professionals...' },
    { name: 'valueProposition', label: 'Value Proposition', type: 'textarea', placeholder: 'Save 20 hours per month...' },
    { name: 'channels', label: 'Marketing Channels (one per line)', type: 'array', placeholder: 'One channel per line' },
    { name: 'budget', label: 'Marketing Budget', type: 'text', placeholder: '$5,000 monthly' },
    { name: 'kpis', label: 'Key Performance Indicators (one per line)', type: 'array', placeholder: 'One KPI per line' },
    { name: 'techToolsForMarketing', label: 'Tech/Tools for Marketing', type: 'textarea', placeholder: 'e.g., CRM, Analytics, Email Marketing Platform'}
  ],
  techStack: [
    { name: 'projectName', label: 'Project Name', type: 'text', placeholder: 'My SaaS App' },
    { name: 'projectDescription', label: 'Project Description', type: 'textarea', placeholder: 'A detailed description of the project.' },
    { name: 'keyFeatures', label: 'Key Features (one per line)', type: 'array', placeholder: 'Feature A\nFeature B' },
    { name: 'targetUsersAndScale', label: 'Target Users & Scale', type: 'textarea', placeholder: 'e.g., 1000 concurrent users, SMBs' },
    { name: 'teamSkills', label: 'Development Team Skills', type: 'textarea', placeholder: 'e.g., Strong in Python, familiar with AWS' },
    { name: 'budgetConstraints', label: 'Budget Constraints', type: 'text', placeholder: 'e.g., Moderate, aiming for cost-efficiency' },
    { name: 'timeToMarket', label: 'Time-to-Market', type: 'text', placeholder: 'e.g., 3 months for MVP' },
    { name: 'nonFunctionalRequirements', label: 'Non-Functional Requirements', type: 'textarea', placeholder: 'e.g., High availability, GDPR compliance' },
  ],
  startupFoundation: [
    { name: 'businessConcept', label: 'Business Concept', type: 'textarea', placeholder: 'Core idea and vision for the startup.' },
    { name: 'problemToSolve', label: 'Problem to Solve', type: 'textarea', placeholder: 'Specific problem your startup addresses for customers.' },
    { name: 'targetMarketDescription', label: 'Target Market Description', type: 'textarea', placeholder: 'Detailed profile of ideal customers (demographics, needs, pain points).' },
    { name: 'uniqueSellingPoints', label: 'Unique Selling Points (USPs)', type: 'array', placeholder: 'What makes your business stand out? (One USP per line)' },
    { name: 'coreTeamSkills', label: 'Core Team Skills/Roles', type: 'array', placeholder: 'Key skills or roles needed in the founding/early team (One per line).' },
    { name: 'initialMilestones', label: 'Initial Milestones (3-6 Months)', type: 'array', placeholder: 'Key goals for the first 3-6 months (One per line).' },
    { name: 'fundingApproach', label: 'Funding Approach', type: 'text', placeholder: 'E.g., Bootstrapped, Angel Investment, Pre-seed VC, Grant' },
    { name: 'biggestRisks', label: 'Biggest Risks & Mitigation', type: 'textarea', placeholder: 'Identify potential major risks and how you might address them.' },
  ],
  saaSModelCanvas: [
    { name: 'productName', label: 'SaaS Product Name', type: 'text', placeholder: 'e.g., SyncMaster Pro' },
    { name: 'valueProposition', label: 'Value Proposition', type: 'textarea', placeholder: 'What unique value does your SaaS offer?' },
    { name: 'techStackForValue', label: 'Tech for Value Proposition', type: 'textarea', placeholder: 'e.g., Real-time DB, AI algorithms' },
    { name: 'customerSegments', label: 'Customer Segments (one per line)', type: 'array', placeholder: 'Who are your target users/buyers? (One per line)' },
    { name: 'channels', label: 'Channels (one per line)', type: 'array', placeholder: 'How will you reach your customers? (e.g., Content Marketing, Direct Sales)' },
    { name: 'techStackForChannels', label: 'Tech for Channels', type: 'textarea', placeholder: 'e.g., SEO tools, CRM' },
    { name: 'customerRelationships', label: 'Customer Relationships (one per line)', type: 'array', placeholder: 'How will you interact with customers? (e.g., Self-service, Dedicated Support)' },
    { name: 'techStackForRelationships', label: 'Tech for Relationships', type: 'textarea', placeholder: 'e.g., Helpdesk, Community Forum software' },
    { name: 'revenueStreams', label: 'Revenue Streams (one per line)', type: 'array', placeholder: 'How will you make money? (e.g., Subscription Tiers, Usage-based)' },
    { name: 'techStackForRevenue', label: 'Tech for Revenue', type: 'textarea', placeholder: 'e.g., Stripe, Chargebee' },
    { name: 'keyActivities', label: 'Key Activities (one per line)', type: 'array', placeholder: 'What core activities are crucial? (e.g., Software Development, Marketing)' },
    { name: 'techStackForActivities', label: 'Tech for Activities', type: 'textarea', placeholder: 'e.g., Jira, GitHub, Figma' },
    { name: 'keyResources', label: 'Key Resources (one per line)', type: 'array', placeholder: 'What assets are essential? (e.g., Engineering Team, IP, Brand)' },
    { name: 'techStackForResources', label: 'Tech for Resources', type: 'textarea', placeholder: 'e.g., AWS/GCP, Patent software' },
    { name: 'keyPartnerships', label: 'Key Partnerships (one per line)', type: 'array', placeholder: 'Any strategic alliances? (e.g., Tech Providers, Resellers)' },
    { name: 'techStackForPartnerships', label: 'Tech for Partnerships', type: 'textarea', placeholder: 'e.g., Zapier, API Gateways' },
    { name: 'costStructure', label: 'Cost Structure', type: 'textarea', placeholder: 'What are your major costs? (e.g., Hosting, Salaries, Marketing Spend)' },
    { name: 'techStackCosts', label: 'Tech Stack Related Costs', type: 'textarea', placeholder: 'e.g., Server costs, SaaS tool subscriptions' },
  ],
  websiteDesign: [
    { name: 'siteName', label: 'Website Name/Brand', type: 'text', placeholder: 'e.g., Stellar Solutions Co.' },
    { name: 'siteType', label: 'Type of Website', type: 'text', placeholder: 'e.g., E-commerce, Portfolio, Blog, Corporate' },
    { name: 'targetAudience', label: 'Target Audience', type: 'textarea', placeholder: 'Describe your ideal visitors' },
    { name: 'corePurpose', label: 'Core Purpose/Goal', type: 'textarea', placeholder: 'What should visitors achieve or learn?' },
    { name: 'keyPagesSections', label: 'Key Pages/Sections (one per line)', type: 'array', placeholder: 'e.g., Homepage, About Us, Services, Contact (one per line)' },
    { name: 'designStyle', label: 'Desired Design Style/Aesthetic', type: 'text', placeholder: 'e.g., Minimalist, Modern, Playful, Corporate' },
    { name: 'inspirations', label: 'Inspirational Websites (URLs, optional, one per line)', type: 'array', placeholder: 'List websites you like (one per line)' },
    { name: 'keyMessage', label: 'Key Message/Feeling', type: 'textarea', placeholder: 'What should the site convey?'},
    { name: 'functionalities', label: 'Specific Functionalities/Integrations', type: 'textarea', placeholder: 'e.g., Contact form, e-commerce, blog, API integrations'},
    { name: 'brandingElements', label: 'Available Branding Elements', type: 'textarea', placeholder: 'e.g., Logo files, color codes, font names'},
    { name: 'callToAction', label: 'Primary Call to Action', type: 'text', placeholder: 'e.g., Sign Up, Learn More, Buy Now'},
    { name: 'contentNotes', label: 'Content Notes', type: 'textarea', placeholder: 'e.g., Provided by client, SEO keywords: X, Y, Z'},
    { name: 'technicalConsiderations', label: 'Technical Considerations (optional)', type: 'textarea', placeholder: 'e.g., Preferred CMS, hosting, performance targets'},
  ],
  mobileAppConcept: [
    { name: 'appName', label: 'App Name', type: 'text', placeholder: 'e.g., ConnectSphere' },
    { name: 'appType', label: 'Type of App', type: 'text', placeholder: 'e.g., Social Network, Game, Utility, News Feed' },
    { name: 'platform', label: 'Target Platform(s)', type: 'text', placeholder: 'e.g., iOS, Android, Cross-Platform' },
    { name: 'problemSolved', label: 'Problem Solved by App', type: 'textarea', placeholder: 'What user problem does this app address?' },
    { name: 'coreFeatures', label: 'Core Features (one per line)', type: 'array', placeholder: 'List main functionalities (one per line)' },
    { name: 'uniqueSellingPoint', label: 'Unique Selling Point (USP)', type: 'textarea', placeholder: 'What makes this app stand out?' },
    { name: 'monetizationStrategy', label: 'Monetization Strategy (optional)', type: 'text', placeholder: 'e.g., Freemium, Ads, Subscription' },
    { name: 'userPersona', label: 'Target User Persona', type: 'textarea', placeholder: 'Brief description of the ideal user.'},
    { name: 'designUxConsiderations', label: 'Design/UX Considerations', type: 'textarea', placeholder: 'e.g., Minimalist UI, Gamified, Accessibility focus'},
    { name: 'technicalConsiderations', label: 'Technical Considerations (optional)', type: 'textarea', placeholder: 'e.g., Offline support, Real-time data, Backend needs'},
  ],
  aiMlAppConcept: [
    { name: 'appName', label: 'AI/ML App Name', type: 'text', placeholder: 'e.g., InsightEngine' },
    { name: 'aiTask', label: 'Primary AI/ML Task', type: 'text', placeholder: 'e.g., Image Classification, Text Generation, Anomaly Detection' },
    { name: 'targetUsers', label: 'Target Users', type: 'textarea', placeholder: 'Who will use this AI/ML application?' },
    { name: 'inputDataDescription', label: 'Input Data Description', type: 'textarea', placeholder: 'What kind of data will the AI process? (e.g., images of cats, customer reviews)' },
    { name: 'outputDescription', label: 'Desired Output/Outcome', type: 'textarea', placeholder: 'What should the AI produce or achieve?' },
    { name: 'keyMetricsForSuccess', label: 'Key Metrics for Success (one per line)', type: 'array', placeholder: 'e.g., Accuracy > 95%, Response time < 500ms (one per line)' },
    { name: 'potentialChallenges', label: 'Potential Challenges', type: 'textarea', placeholder: 'e.g., Data scarcity, model bias, computational cost' },
  ],
  threeJsApp: [
    { name: 'appName', label: '3D App Name', type: 'text', placeholder: 'e.g., Virtual Explorer 3D' },
    { name: 'conceptDescription', label: 'App Concept', type: 'textarea', placeholder: 'Describe the core idea and purpose of the 3D application.' },
    { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Students, designers, gamers' },
    { name: 'key3DObjects', label: 'Key 3D Objects/Models (one per line)', type: 'array', placeholder: 'List main 3D elements (e.g., planets, furniture, characters)' },
    { name: 'interactionStyle', label: 'Interaction Style', type: 'text', placeholder: 'e.g., Mouse orbit, First-person navigation, Point-and-click' },
    { name: 'desiredAesthetic', label: 'Desired Aesthetic', type: 'text', placeholder: 'e.g., Realistic, Low-poly, Cartoonish, Abstract' },
    { name: 'coreFunctionality', label: 'Core Functionality', type: 'textarea', placeholder: 'What can users do beyond viewing? (e.g., customize models, solve puzzles, simulate physics)' },
    { name: 'techConsiderations', label: 'Technical Considerations (optional)', type: 'textarea', placeholder: 'e.g., Performance targets, specific Three.js features to use, lighting setup' },
  ],
  wordpressTheme: [
    { name: 'themeName', label: 'WordPress Theme Name', type: 'text', placeholder: 'e.g., CreativeFolio Pro' },
    { name: 'targetAudienceOrNiche', label: 'Target Audience/Niche', type: 'text', placeholder: 'e.g., Bloggers, Small Businesses, Photographers, E-commerce' },
    { name: 'themeStyle', label: 'Theme Style/Aesthetic', type: 'text', placeholder: 'e.g., Minimalist, Corporate, Magazine, Bold & Modern' },
    { name: 'keyFeatures', label: 'Key Features & Functionality (one per line)', type: 'array', placeholder: 'List essential features (e.g., Customizer options, Widget areas, Gutenberg support, WooCommerce compatibility)' },
    { name: 'requiredTemplates', label: 'Required Page Templates (one per line)', type: 'array', placeholder: 'List necessary templates (e.g., Homepage, Single Post, Page, Archive, Search Results)' },
    { name: 'pluginCompatibility', label: 'Key Plugin Compatibility (optional, one per line)', type: 'array', placeholder: 'List plugins it should work well with (e.g., Yoast SEO, Elementor, Contact Form 7)' },
    { name: 'monetizationAspects', label: 'Monetization (if premium theme)', type: 'text', placeholder: 'e.g., One-time purchase, Subscription, Freemium model' },
  ],
};

export function PromptGenerator({ initialPromptType = 'businessPlan', onSave }: PromptGeneratorProps) {
  const [promptType, setPromptType] = useState<PromptType>(initialPromptType);
  const [formValues, setFormValues] = useState<TemplateVariables>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  useEffect(() => {
    setPromptType(initialPromptType);
    setFormValues({});
    setGeneratedPrompt('');
  }, [initialPromptType]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleArrayChange = (field: string, value: string) => {
    const items = value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    setFormValues(prev => ({ ...prev, [field]: items }));
  };
  
  const generatePromptInternal = () => {
    const template = promptLibrary[promptType];
    if (template) {
      const result = template.generate(formValues);
      setGeneratedPrompt(result);
    } else {
      toast.error(`Prompt template for type "${promptType}" not found.`);
      setGeneratedPrompt('');
    }
  };

  const handleSavePrompt = () => {
    if (!generatedPrompt) {
      toast.error("Please generate a prompt first.");
      return;
    }
    onSave(generatedPrompt, formValues, promptType);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Prompt Generator</CardTitle>
          <CardDescription>
            Create customized prompts for your business documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prompt Type</Label>
              <Select value={promptType} onValueChange={(value) => {
                setPromptType(value as PromptType);
                setFormValues({});
                setGeneratedPrompt('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a prompt type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="businessPlan">Business Plan Sections</SelectItem>
                  <SelectItem value="marketingPlan">Marketing Strategy</SelectItem>
                  <SelectItem value="techStack">Technology Stack Design</SelectItem>
                  <SelectItem value="startupFoundation">Startup Foundation Strategy</SelectItem>
                  <SelectItem value="saaSModelCanvas">SaaS Business Model Canvas</SelectItem>
                  <SelectItem value="websiteDesign">Website Design Brief</SelectItem>
                  <SelectItem value="mobileAppConcept">Mobile App Concept</SelectItem>
                  <SelectItem value="aiMlAppConcept">AI/ML App Concept</SelectItem>
                  <SelectItem value="threeJsApp">Faux 3D App (Three.js)</SelectItem>
                  <SelectItem value="wordpressTheme">WordPress Theme Brief</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {promptFields[promptType].map(field => (
                <div key={field.name} className={`space-y-2 ${field.type === 'textarea' || field.type === 'array' ? 'md:col-span-2' : ''}`}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  
                  {field.type === 'textarea' ? (
                    <Textarea 
                      id={field.name}
                      placeholder={field.placeholder}
                      value={(formValues[field.name] as string) || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'array' ? (
                    <Textarea 
                      id={field.name}
                      placeholder={field.placeholder}
                      value={Array.isArray(formValues[field.name]) 
                        ? (formValues[field.name] as string[]).join('\n')
                        : ''}
                      onChange={(e) => handleArrayChange(field.name, e.target.value)}
                    />
                  ) : (
                    <Input 
                      id={field.name}
                      placeholder={field.placeholder}
                      value={(formValues[field.name] as string) || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={generatePromptInternal}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Prompt
          </Button>
          {generatedPrompt && (
            <Button onClick={handleSavePrompt} variant="outline">
              Save to Artifacts
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Prompt</CardTitle>
            <CardDescription>Ready to use in your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                {generatedPrompt}
              </pre>
              <Button 
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
