import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Tag, Book, Copy } from 'lucide-react';
import { PromptTemplate, extractVariables, processTemplate } from '@/lib/promptLibrary';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PromptLibrary() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string | string[]>>({});
  const [processedPrompt, setProcessedPrompt] = useState('');
  
  // New template state
  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate>>({
    title: '',
    description: '',
    template: '',
    variables: [],
    category: 'general',
    tags: []
  });
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  useEffect(() => {
    if (selectedTemplate) {
      const initialValues: Record<string, string | string[]> = {};
      
      selectedTemplate.variables.forEach(variable => {
        initialValues[variable.name] = variable.defaultValue || '';
      });
      
      setVariableValues(initialValues);
      updateProcessedPrompt(selectedTemplate.template, initialValues);
    }
  }, [selectedTemplate]);
  
  const fetchTemplates = async () => {
    try {
      // Mock data for now
      const mockTemplates: PromptTemplate[] = [
        {
          id: '1',
          title: 'B2B Sales Email',
          description: 'Template for reaching out to B2B customers',
          template: 'Subject: {{productName}} - Solution for {{companyName}}\n\nHi {{recipientName}},\n\nI noticed that {{companyName}} is facing challenges with {{problemArea}}.\n\nOur {{productName}} helps {{customerType}} companies like yours to {{valueProposition}}.\n\nAre you available for a quick 15-minute call {{timeframe}}?\n\nBest regards,\n{{senderName}}\n{{senderPosition}}',
          variables: [
            { name: 'productName', type: 'single', description: 'Your product name' },
            { name: 'companyName', type: 'single', description: 'Target company name' },
            { name: 'recipientName', type: 'single', description: 'Recipient\'s name' },
            { name: 'problemArea', type: 'single', description: 'Problem area your product solves' },
            { name: 'customerType', type: 'single', description: 'Type of customer (e.g., enterprise, SMB)' },
            { name: 'valueProposition', type: 'single', description: 'Key value proposition' },
            { name: 'timeframe', type: 'single', description: 'Suggested meeting timeframe' },
            { name: 'senderName', type: 'single', description: 'Your name' },
            { name: 'senderPosition', type: 'single', description: 'Your position' }
          ],
          category: 'sales',
          tags: ['email', 'b2b', 'outreach'],
          author: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // Add more mock templates
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Could not load prompt templates");
    }
  };
  
  const updateProcessedPrompt = (template: string, values: Record<string, string | string[]>) => {
    try {
      const result = processTemplate(template, values);
      setProcessedPrompt(result);
    } catch (error) {
      console.error("Error processing template:", error);
    }
  };
  
  const handleVariableChange = (name: string, value: string | string[]) => {
    const updatedValues = {
      ...variableValues,
      [name]: value
    };
    
    setVariableValues(updatedValues);
    
    if (selectedTemplate) {
      updateProcessedPrompt(selectedTemplate.template, updatedValues);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(processedPrompt)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };
  
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      template.title.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query) ||
      template.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Prompt Library</h2>
          <p className="text-muted-foreground">Create and use templated prompts with variables</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>
      
      <div className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-auto">
        {/* Template Browser */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Templates</CardTitle>
            <CardDescription>Select a template to use</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No templates found</p>
              ) : (
                filteredTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className={`p-3 cursor-pointer hover:bg-accent/10 transition-colors ${selectedTemplate?.id === template.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{template.title}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex">
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      </div>
                    </div>
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Template Editor/Viewer */}
        <Card className="col-span-2">
          {selectedTemplate ? (
            <Tabs defaultValue="fill" className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTemplate.title}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="fill">Fill Template</TabsTrigger>
                    <TabsTrigger value="view">View Source</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-auto">
                <TabsContent value="fill" className="h-full flex flex-col space-y-4">
                  {/* Variable inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.name} className="space-y-2">
                        <Label htmlFor={variable.name}>{variable.name}</Label>
                        <Input
                          id={variable.name}
                          placeholder={variable.description}
                          value={(variableValues[variable.name] as string) || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex-grow border rounded-md p-4 mt-4 relative">
                    <h3 className="font-medium mb-2">Generated Prompt:</h3>
                    <pre className="whitespace-pre-wrap text-sm">{processedPrompt}</pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="view">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Template Source:</h3>
                      <pre className="border rounded-md p-4 whitespace-pre-wrap text-sm">{selectedTemplate.template}</pre>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Variables:</h3>
                      <ul className="space-y-2">
                        {selectedTemplate.variables.map(variable => (
                          <li key={variable.name} className="flex items-start">
                            <Badge className="mr-2 mt-0.5">{variable.type}</Badge>
                            <div>
                              <span className="font-medium">{variable.name}:</span> {variable.description}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select a Template</h3>
                <p className="text-muted-foreground">Choose a template from the left to start using it</p>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          
          {/* Template creation form */}
          <div className="space-y-4 py-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                  placeholder="Template title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(val) => setNewTemplate({...newTemplate, category: val})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Brief description of this template"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template">Template Content (use {{variableName}} for variables)</Label>
              <Textarea
                id="template"
                rows={8}
                value={newTemplate.template}
                onChange={(e) => setNewTemplate({...newTemplate, template: e.target.value})}
                placeholder="Type your template with {{variables}} here..."
                className="font-mono"
              />
            </div>
            
            {/* Variable editors will go here */}
            {/* We would add dynamic variable editing based on extraction */}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
