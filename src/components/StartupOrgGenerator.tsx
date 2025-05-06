import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Building, Users, ArrowRight, BarChart3, Shuffle, Copy, Save } from 'lucide-react';
import { toast } from 'sonner';

interface StartupOrgGeneratorProps {
  onSave: (data: any) => void;
}

// Define organization structure types based on web search results
const orgStructureTypes = [
  { label: 'Flat', value: 'flat', description: 'Very few management layers, specialists report directly to founders' },
  { label: 'Functional', value: 'functional', description: 'Organized by business functions like marketing, engineering, etc.' },
  { label: 'Matrix', value: 'matrix', description: 'Team members report to both functional managers and project managers' },
  { label: 'Team-based', value: 'team-based', description: 'Cross-functional teams organized around products or projects' },
  { label: 'Hierarchical', value: 'hierarchical', description: 'Traditional pyramid structure with clear reporting lines' }
];

const keyRoles = [
  { label: 'CEO', description: 'Chief Executive Officer - Overall company strategy and leadership' },
  { label: 'CTO', description: 'Chief Technology Officer - Technical direction and implementation' },
  { label: 'COO', description: 'Chief Operating Officer - Day-to-day operations and execution' },
  { label: 'CFO', description: 'Chief Financial Officer - Financial planning and management' },
  { label: 'CMO', description: 'Chief Marketing Officer - Marketing strategy and customer acquisition' },
  { label: 'CPO', description: 'Chief Product Officer - Product vision and roadmap' }
];

export function StartupOrgGenerator({ onSave }: StartupOrgGeneratorProps) {
  const [activeTab, setActiveTab] = useState('structure');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('small');
  const [companyIndustry, setCompanyIndustry] = useState('tech');
  const [orgStructure, setOrgStructure] = useState('flat');
  const [customRoles, setCustomRoles] = useState('');
  const [customDepartments, setCustomDepartments] = useState('');
  
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedStructureText, setGeneratedStructureText] = useState('');

  // Generate pseudocode for the startup organization
  const generatePseudocode = () => {
    const template = `/**
 * {{companyName}} Organization Structure - Pseudocode Implementation
 * Size: {{companySize}} | Industry: {{companyIndustry}} | Structure: {{orgStructureLabel}}
 */

// Define organization structure
class OrganizationStructure {
  constructor() {
    this.name = "{{companyName}}";
    this.structureType = "{{orgStructure}}";
    this.departments = [];
    this.roles = [];
  }
  
  // Initialize core leadership team
  initializeLeadershipTeam() {
    {{#keyRoles}}
    this.addLeadershipRole("{{role}}", "{{description}}");
    {{/keyRoles}}
    
    // Additional custom roles
    {{#customRoles}}
    this.addRole("{{.}}");
    {{/customRoles}}
  }
  
  // Setup departments based on {{orgStructureLabel}} model
  initializeDepartments() {
    {{#departments}}
    this.addDepartment("{{.}}");
    {{/departments}}
  }
  
  // Define communication flows in a {{orgStructureLabel}} structure
  defineCommunicationFlows() {
    // {{orgStructureDescription}}
    if (this.structureType === "flat") {
      this.implementDirectCommunication();
    } else if (this.structureType === "functional") {
      this.implementFunctionalHierarchy();
    } else if (this.structureType === "matrix") {
      this.implementMatrixReporting();
    } else if (this.structureType === "team-based") {
      this.implementCrossTeamCollaboration();
    } else {
      this.implementTraditionalHierarchy();
    }
  }
  
  // Establish decision-making processes
  defineDecisionMakingProcess() {
    if (this.companySize === "small") {
      return "consensus_with_founder_override";
    } else if (this.companySize === "medium") {
      return "department_autonomy_with_leadership_alignment";
    } else {
      return "hierarchical_with_delegated_authority";
    }
  }
}

// Initialize company organization
function main() {
  const organization = new OrganizationStructure();
  organization.initializeLeadershipTeam();
  organization.initializeDepartments();
  organization.defineCommunicationFlows();
  
  const decisionProcess = organization.defineDecisionMakingProcess();
  console.log("{{companyName}} organization structure initialized with " + decisionProcess + " decision model");
  
  return organization;
}

// Set up organization
const {{companyNameVariable}} = main();
`;

    // Process the template using simple template substitution
    const selectedStructure = orgStructureTypes.find(s => s.value === orgStructure);
    
    // Parse custom roles and departments
    const roles = customRoles.split('\n')
      .map(role => role.trim())
      .filter(role => role.length > 0);
    
    const departments = customDepartments.split('\n')
      .map(dept => dept.trim())
      .filter(dept => dept.length > 0);
    
    // Create template variables
    const variables = {
      companyName,
      companyNameVariable: companyName.toLowerCase().replace(/\s+/g, '_'),
      companySize,
      companyIndustry,
      orgStructure,
      orgStructureLabel: selectedStructure?.label || orgStructure,
      orgStructureDescription: selectedStructure?.description || '',
      keyRoles: keyRoles.slice(0, 3).map(role => ({ 
        role: role.label, 
        description: role.description 
      })),
      customRoles: roles,
      departments: departments.length > 0 ? departments : [
        'Engineering', 
        'Product', 
        'Marketing', 
        companyIndustry === 'tech' ? 'Customer Success' : 'Sales'
      ]
    };
    
    // Simple template processing
    let result = template;
    
    // Replace simple variables
    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
      }
    });
    
    // Process arrays with mustache-style {{#array}} {{/array}} sections
    const arrayPattern = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
    result = result.replace(arrayPattern, (match, arrayName, content) => {
      const array = (variables as any)[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map((item: any) => {
        let itemContent = content;
        if (typeof item === 'string') {
          // Replace {{.}} with the item itself
          return itemContent.replace(/{{\.}}/g, item);
        } else {
          // Replace {{property}} with item.property
          Object.entries(item).forEach(([key, value]) => {
            const itemRegex = new RegExp(`{{${key}}}`, 'g');
            itemContent = itemContent.replace(itemRegex, value as string);
          });
          return itemContent;
        }
      }).join('\n');
    });
    
    setGeneratedCode(result);
    
    // Also generate a simple text representation
    const structureText = generateStructureText(variables);
    setGeneratedStructureText(structureText);
  };
  
  // Generate a simple text representation of the organization structure
  const generateStructureText = (variables: any) => {
    const selectedStructure = orgStructureTypes.find(s => s.value === orgStructure);
    
    return `# ${companyName} Organization Structure

## Overview
- **Company Size:** ${companySize === 'small' ? 'Small (1-20 employees)' : companySize === 'medium' ? 'Medium (21-100 employees)' : 'Large (100+ employees)'}
- **Industry:** ${companyIndustry}
- **Structure Type:** ${selectedStructure?.label || orgStructure}

${selectedStructure?.description ? `> ${selectedStructure.description}` : ''}

## Leadership Team
${keyRoles.slice(0, 3).map(role => `- **${role.label}:** ${role.description}`).join('\n')}

${customRoles ? `## Additional Roles\n${customRoles.split('\n').map(role => `- ${role}`).join('\n')}` : ''}

## Departments
${variables.departments.map((dept: string) => `- ${dept}`).join('\n')}

## Communication Flow
${selectedStructure?.description || 'Standard communication channels between teams and leadership.'}`;
  };
  
  const handleSave = () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    
    // Generate the code if not already generated
    if (!generatedCode) {
      generatePseudocode();
    }
    
    const data = {
      type: 'startup-org',
      companyName,
      companySize,
      companyIndustry,
      orgStructure,
      customRoles: customRoles.split('\n').filter(r => r.trim().length > 0),
      customDepartments: customDepartments.split('\n').filter(d => d.trim().length > 0),
      generatedCode,
      generatedStructureText
    };
    
    onSave(data);
    toast.success('Organization structure saved');
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };
  
  const randomizeOrganization = () => {
    const randomCompanySize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
    const randomIndustries = ['tech', 'finance', 'healthcare', 'education', 'retail'];
    const randomIndustry = randomIndustries[Math.floor(Math.random() * randomIndustries.length)];
    const randomStructure = orgStructureTypes[Math.floor(Math.random() * orgStructureTypes.length)].value;
    
    setCompanySize(randomCompanySize);
    setCompanyIndustry(randomIndustry);
    setOrgStructure(randomStructure);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Building className="mr-2 h-6 w-6" /> Startup Organization Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="roles">Roles & Departments</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="structure" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Technologies"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger id="company-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-20 employees)</SelectItem>
                      <SelectItem value="medium">Medium (21-100 employees)</SelectItem>
                      <SelectItem value="large">Large (100+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-industry">Primary Industry</Label>
                  <Select value={companyIndustry} onValueChange={setCompanyIndustry}>
                    <SelectTrigger id="company-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="media">Media & Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-structure">Organization Structure</Label>
                  <Select value={orgStructure} onValueChange={setOrgStructure}>
                    <SelectTrigger id="org-structure">
                      <SelectValue placeholder="Select structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgStructureTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="py-4">
                {orgStructureTypes.find(t => t.value === orgStructure)?.description && (
                  <div className="bg-muted p-4 rounded-md text-sm">
                    <p className="font-medium">About {orgStructureTypes.find(t => t.value === orgStructure)?.label} Structure:</p>
                    <p>{orgStructureTypes.find(t => t.value === orgStructure)?.description}</p>
                  </div>
                )}
              </div>
              
              <Button onClick={randomizeOrganization} variant="outline">
                <Shuffle className="mr-2 w-4 h-4" />
                Randomize
              </Button>
            </TabsContent>
            
            <TabsContent value="roles" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-roles">
                    Custom Roles <span className="text-muted-foreground">(one per line)</span>
                  </Label>
                  <Textarea 
                    id="custom-roles" 
                    value={customRoles} 
                    onChange={(e) => setCustomRoles(e.target.value)}
                    placeholder="Chief Growth Officer
VP of Engineering
Head of Design"
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-departments">
                    Departments <span className="text-muted-foreground">(one per line)</span>
                  </Label>
                  <Textarea 
                    id="custom-departments" 
                    value={customDepartments} 
                    onChange={(e) => setCustomDepartments(e.target.value)}
                    placeholder="Engineering
Product
Marketing
Sales
Customer Success"
                    rows={5}
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Label>Common Startup Roles</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {keyRoles.map((role) => (
                    <div key={role.label} className="p-3 border rounded-md">
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <Button 
                onClick={generatePseudocode} 
                className="mb-4"
              >
                <ArrowRight className="mr-2 w-4 h-4" />
                Generate Organization Structure
              </Button>
              
              {generatedCode && (
                <>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-sm whitespace-pre-wrap font-mono">{generatedCode}</pre>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(generatedCode)}
                        className="absolute top-2 right-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" /> 
                        Organization Structure Summary
                      </h3>
                      <div className="mt-2 relative">
                        <div className="bg-muted p-4 rounded-md">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans">{generatedStructureText}</pre>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(generatedStructureText)}
                          className="absolute top-2 right-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={randomizeOrganization}>
            <Shuffle className="mr-2 w-4 h-4" />
            Randomize
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 w-4 h-4" />
            Save Organization
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
