import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { promptLibrary, PromptTemplate, type TemplateVariables } from '@/lib/promptTemplates';

type PromptType = 'businessPlan' | 'marketingPlan' | 'techStack';

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
  ]
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
              <Select value={promptType} onValueChange={(value) => setPromptType(value as PromptType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a prompt type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="businessPlan">Business Plan</SelectItem>
                  <SelectItem value="marketingPlan">Marketing Plan</SelectItem>
                  <SelectItem value="techStack">Technology Stack</SelectItem>
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
