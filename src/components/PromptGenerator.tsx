import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Wand2, Building2, LayoutGrid, Globe, Smartphone, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { promptLibrary, PromptTemplate, type TemplateVariables } from '@/lib/promptTemplates';

type PromptType = 
  | 'businessPlan' 
  | 'marketingPlan' 
  | 'techStack' 
  | 'startupFoundation' 
  | 'saaSModelCanvas'
  | 'websiteDesign'       // New
  | 'mobileAppConcept'    // New
  | 'aiMlAppConcept'      // New
  | 'threeJsApp'          // New
  | 'wordpressTheme';     // New

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
    { name: 'features', label: 'Key Features', type: 'array', placeholder: 'One feature per line' },
    { name: 'revenueModel', label: 'Revenue Model', type: 'text', placeholder: 'subscription' },
    { name: 'pricingStrategy', label: 'Pricing Strategy', type: 'text', placeholder: 'tiered' },
    { name: 'marketingChannels', label: 'Marketing Channels', type: 'array', placeholder: 'One channel per line' }
  ],
  marketingPlan: [
    { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'ProductX' },
    { name: 'audienceDescription', label: 'Target Audience', type: 'textarea', placeholder: 'Tech-savvy professionals...' },
    { name: 'valueProposition', label: 'Value Proposition', type: 'textarea', placeholder: 'Save 20 hours per month...' },
    { name: 'channels', label: 'Marketing Channels', type: 'array', placeholder: 'One channel per line' },
    { name: 'budget', label: 'Marketing Budget', type: 'text', placeholder: '$5,000 monthly' },
    { name: 'kpis', label: 'Key Performance Indicators', type: 'array', placeholder: 'One KPI per line' }
  ],
  techStack: [
    { name: 'projectName', label: 'Project Name', type: 'text', placeholder: 'My SaaS App' },
    { name: 'architecture', label: 'Architecture', type: 'text', placeholder: 'Microservices' },
    { name: 'frontendFramework', label: 'Frontend Framework', type: 'text', placeholder: 'React' },
    { name: 'stateManagement', label: 'State Management', type: 'text', placeholder: 'Redux' },
    { name: 'uiLibrary', label: 'UI Library', type: 'text', placeholder: 'Tailwind CSS' },
    { name: 'backendFramework', label: 'Backend Framework', type: 'text', placeholder: 'Node.js/Express' },
    { name: 'database', label: 'Database', type: 'text', placeholder: 'PostgreSQL' },
    { name: 'apiStyle', label: 'API Style', type: 'text', placeholder: 'REST' },
    { name: 'hosting', label: 'Hosting', type: 'text', placeholder: 'AWS' },
    { name: 'cicd', label: 'CI/CD', type: 'text', placeholder: 'GitHub Actions' },
    { name: 'monitoring', label: 'Monitoring', type: 'text', placeholder: 'Datadog' }
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
    { name: 'customerSegments', label: 'Customer Segments', type: 'array', placeholder: 'Who are your target users/buyers? (One per line)' },
    { name: 'channels', label: 'Channels', type: 'array', placeholder: 'How will you reach your customers? (e.g., Content Marketing, Direct Sales)' },
    { name: 'customerRelationships', label: 'Customer Relationships', type: 'array', placeholder: 'How will you interact with customers? (e.g., Self-service, Dedicated Support)' },
    { name: 'revenueStreams', label: 'Revenue Streams', type: 'array', placeholder: 'How will you make money? (e.g., Subscription Tiers, Usage-based)' },
    { name: 'keyActivities', label: 'Key Activities', type: 'array', placeholder: 'What core activities are crucial? (e.g., Software Development, Marketing)' },
    { name: 'keyResources', label: 'Key Resources', type: 'array', placeholder: 'What assets are essential? (e.g., Engineering Team, IP, Brand)' },
    { name: 'keyPartnerships', label: 'Key Partnerships', type: 'array', placeholder: 'Any strategic alliances? (e.g., Tech Providers, Resellers)' },
    { name: 'costStructure', label: 'Cost Structure', type: 'textarea', placeholder: 'What are your major costs? (e.g., Hosting, Salaries, Marketing Spend)' },
  ],
  websiteDesign: [ // New
    { name: 'siteName', label: 'Website Name/Brand', type: 'text', placeholder: 'e.g., Stellar Solutions Co.' },
    { name: 'siteType', label: 'Type of Website', type: 'text', placeholder: 'e.g., E-commerce, Portfolio, Blog, Corporate' },
    { name: 'targetAudience', label: 'Target Audience', type: 'textarea', placeholder: 'Describe your ideal visitors' },
    { name: 'corePurpose', label: 'Core Purpose/Goal', type: 'textarea', placeholder: 'What should visitors achieve or learn?' },
    { name: 'keyPagesSections', label: 'Key Pages/Sections', type: 'array', placeholder: 'e.g., Homepage, About Us, Services, Contact (one per line)' },
    { name: 'designStyle', label: 'Desired Design Style/Aesthetic', type: 'text', placeholder: 'e.g., Minimalist, Modern, Playful, Corporate' },
    { name: 'inspirations', label: 'Inspirational Websites (URLs, optional)', type: 'array', placeholder: 'List websites you like (one per line)' },
  ],
  mobileAppConcept: [ // New
    { name: 'appName', label: 'App Name', type: 'text', placeholder: 'e.g., ConnectSphere' },
    { name: 'appType', label: 'Type of App', type: 'text', placeholder: 'e.g., Social Network, Game, Utility, News Feed' },
    { name: 'platform', label: 'Target Platform(s)', type: 'text', placeholder: 'e.g., iOS, Android, Cross-Platform' },
    { name: 'problemSolved', label: 'Problem Solved by App', type: 'textarea', placeholder: 'What user problem does this app address?' },
    { name: 'coreFeatures', label: 'Core Features', type: 'array', placeholder: 'List main functionalities (one per line)' },
    { name: 'uniqueSellingPoint', label: 'Unique Selling Point (USP)', type: 'textarea', placeholder: 'What makes this app stand out?' },
    { name: 'monetizationStrategy', label: 'Monetization Strategy (optional)', type: 'text', placeholder: 'e.g., Freemium, Ads, Subscription' },
  ],
  aiMlAppConcept: [ // New
    { name: 'appName', label: 'AI/ML App Name', type: 'text', placeholder: 'e.g., InsightEngine' },
    { name: 'aiTask', label: 'Primary AI/ML Task', type: 'text', placeholder: 'e.g., Image Classification, Text Generation, Anomaly Detection' },
    { name: 'targetUsers', label: 'Target Users', type: 'textarea', placeholder: 'Who will use this AI/ML application?' },
    { name: 'inputDataDescription', label: 'Input Data Description', type: 'textarea', placeholder: 'What kind of data will the AI process? (e.g., images of cats, customer reviews)' },
    { name: 'outputDescription', label: 'Desired Output/Outcome', type: 'textarea', placeholder: 'What should the AI produce or achieve?' },
    { name: 'keyMetricsForSuccess', label: 'Key Metrics for Success', type: 'array', placeholder: 'e.g., Accuracy > 95%, Response time < 500ms (one per line)' },
    { name: 'potentialChallenges', label: 'Potential Challenges', type: 'textarea', placeholder: 'e.g., Data scarcity, model bias, computational cost' },
  ],
  threeJsApp: [ // New
    { name: 'appName', label: '3D App Name', type: 'text', placeholder: 'e.g., Virtual Explorer 3D' },
    { name: 'conceptDescription', label: 'App Concept', type: 'textarea', placeholder: 'Describe the core idea and purpose of the 3D application.' },
    { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Students, designers, gamers' },
    { name: 'key3DObjects', label: 'Key 3D Objects/Models', type: 'array', placeholder: 'List main 3D elements (e.g., planets, furniture, characters)' },
    { name: 'interactionStyle', label: 'Interaction Style', type: 'text', placeholder: 'e.g., Mouse orbit, First-person navigation, Point-and-click' },
    { name: 'desiredAesthetic', label: 'Desired Aesthetic', type: 'text', placeholder: 'e.g., Realistic, Low-poly, Cartoonish, Abstract' },
    { name: 'coreFunctionality', label: 'Core Functionality', type: 'textarea', placeholder: 'What can users do beyond viewing? (e.g., customize models, solve puzzles, simulate physics)' },
    { name: 'techConsiderations', label: 'Technical Considerations (optional)', type: 'textarea', placeholder: 'e.g., Performance targets, specific Three.js features to use, lighting setup' },
  ],
  wordpressTheme: [ // New
    { name: 'themeName', label: 'WordPress Theme Name', type: 'text', placeholder: 'e.g., CreativeFolio Pro' },
    { name: 'targetAudienceOrNiche', label: 'Target Audience/Niche', type: 'text', placeholder: 'e.g., Bloggers, Small Businesses, Photographers, E-commerce' },
    { name: 'themeStyle', label: 'Theme Style/Aesthetic', type: 'text', placeholder: 'e.g., Minimalist, Corporate, Magazine, Bold & Modern' },
    { name: 'keyFeatures', label: 'Key Features & Functionality', type: 'array', placeholder: 'List essential features (e.g., Customizer options, Widget areas, Gutenberg support, WooCommerce compatibility)' },
    { name: 'requiredTemplates', label: 'Required Page Templates', type: 'array', placeholder: 'List necessary templates (e.g., Homepage, Single Post, Page, Archive, Search Results)' },
    { name: 'pluginCompatibility', label: 'Key Plugin Compatibility (optional)', type: 'array', placeholder: 'List plugins it should work well with (e.g., Yoast SEO, Elementor, Contact Form 7)' },
    { name: 'monetizationAspects', label: 'Monetization (if premium theme)', type: 'text', placeholder: 'e.g., One-time purchase, Subscription, Freemium model' },
  ],
};

export function PromptGenerator() {
  const [promptType, setPromptType] = useState<PromptType>('businessPlan');
  const [formValues, setFormValues] = useState<TemplateVariables>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleArrayChange = (field: string, value: string) => {
    // Convert multi-line text to array
    const items = value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    setFormValues(prev => ({ ...prev, [field]: items }));
  };
  
  const generatePrompt = () => {
    const template = promptLibrary[promptType];
    const result = template.generate(formValues);
    setGeneratedPrompt(result);
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
                  <SelectItem value="websiteDesign">Website Design Brief</SelectItem> {/* New */}
                  <SelectItem value="mobileAppConcept">Mobile App Concept</SelectItem> {/* New */}
                  <SelectItem value="aiMlAppConcept">AI/ML App Concept</SelectItem> {/* New */}
                  <SelectItem value="threeJsApp">Faux 3D App (Three.js)</SelectItem> {/* New */}
                  <SelectItem value="wordpressTheme">WordPress Theme Brief</SelectItem> {/* New */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {promptFields[promptType].map(field => (
                <div key={field.name} className="space-y-2">
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
        <CardFooter>
          <Button onClick={generatePrompt}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Prompt
          </Button>
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
