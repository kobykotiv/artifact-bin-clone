import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Plus, Save, Trash, FileCode, Variable } from 'lucide-react';
import { extractTemplateVariables, renderTemplate, type TemplateDefinition, type TemplateVariable } from '@/lib/templateEngine';

interface TemplateEditorProps {
  initialTemplate?: TemplateDefinition;
  onSave: (template: TemplateDefinition) => Promise<void>;
}

export function TemplateEditor({ initialTemplate, onSave }: TemplateEditorProps) {
  const [template, setTemplate] = useState<TemplateDefinition>({
    id: initialTemplate?.id || crypto.randomUUID(),
    name: initialTemplate?.name || '',
    description: initialTemplate?.description || '',
    template: initialTemplate?.template || '',
    variables: initialTemplate?.variables || [],
    category: initialTemplate?.category || 'general',
    tags: initialTemplate?.tags || [],
  });
  
  const [activeTab, setActiveTab] = useState('edit');
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    name: '',
    type: 'text',
    required: false,
  });
  
  // Sync detected variables from template with the variables array
  useEffect(() => {
    const detectedVars = extractTemplateVariables(template.template);
    
    // Check if we need to add any new variables
    const existingVarNames = template.variables.map(v => v.name);
    const newVars = detectedVars.filter(name => !existingVarNames.includes(name));
    
    if (newVars.length > 0) {
      setTemplate(prev => ({
        ...prev,
        variables: [
          ...prev.variables,
          ...newVars.map(name => ({
            name,
            type: 'text' as const,
            required: false,
          })),
        ],
      }));
    }
    
    // Initialize preview variables
    setPreviewVariables(prev => {
      const updated = { ...prev };
      detectedVars.forEach(name => {
        if (!updated[name]) updated[name] = `[${name}]`;
      });
      return updated;
    });
  }, [template.template]);
  
  const handleAddVariable = () => {
    if (!newVariable.name.trim()) return;
    
    setTemplate(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable],
    }));
    
    setNewVariable({
      name: '',
      type: 'text',
      required: false,
    });
  };
  
  const handleRemoveVariable = (name: string) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.name !== name),
    }));
  };
  
  const handleSave = () => {
    onSave(template);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">
            <FileCode className="w-4 h-4 mr-2" />
            Edit Template
          </TabsTrigger>
          <TabsTrigger value="variables">
            <Variable className="w-4 h-4 mr-2" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Name</Label>
                <Input 
                  id="template-name" 
                  value={template.name}
                  onChange={e => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Template name"
                />
              </div>
              
              <div>
                <Label htmlFor="template-desc">Description</Label>
                <Textarea 
                  id="template-desc" 
                  value={template.description}
                  onChange={e => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Template description"
                />
              </div>
              
              <div>
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea 
                  id="template-content" 
                  value={template.template}
                  onChange={e => setTemplate(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Use {{variable}} or {{variable-description}} syntax"
                  className="min-h-[200px] font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={template.category}
                  onValueChange={value => setTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template-tags">Tags (comma separated)</Label>
                <Input 
                  id="template-tags" 
                  value={template.tags?.join(', ')}
                  onChange={e => setTemplate(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()) 
                  }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Variables</CardTitle>
              <CardDescription>
                Variables detected from your template using {{variable}} syntax
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {template.variables.map((variable, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 border rounded-md">
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium">{variable.name}</span>
                        {variable.required && (
                          <span className="ml-2 text-red-500">*</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Select 
                          value={variable.type}
                          onValueChange={value => {
                            const updatedVars = [...template.variables];
                            updatedVars[index] = { ...variable, type: value as VariableType };
                            setTemplate(prev => ({ ...prev, variables: updatedVars }));
                          }}
                        >
                          <SelectTrigger className="h-7 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="multiselect">Multi-select</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <span className="text-muted-foreground ml-2">Required:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-7 h-7 p-0"
                          onClick={() => {
                            const updatedVars = [...template.variables];
                            updatedVars[index] = { ...variable, required: !variable.required };
                            setTemplate(prev => ({ ...prev, variables: updatedVars }));
                          }}
                        >
                          {variable.required ? <Check className="h-4 w-4" /> : null}
                        </Button>
                      </div>
                      
                      {(variable.type === 'select' || variable.type === 'multiselect') && (
                        <div>
                          <Label className="text-xs">Options (comma separated)</Label>
                          <Input 
                            value={variable.options?.join(', ') || ''}
                            onChange={e => {
                              const options = e.target.value.split(',').map(o => o.trim());
                              const updatedVars = [...template.variables];
                              updatedVars[index] = { ...variable, options };
                              setTemplate(prev => ({ ...prev, variables: updatedVars }));
                            }}
                            className="h-7 text-sm"
                            placeholder="option1, option2, option3"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input 
                          value={variable.description || ''}
                          onChange={e => {
                            const updatedVars = [...template.variables];
                            updatedVars[index] = { ...variable, description: e.target.value };
                            setTemplate(prev => ({ ...prev, variables: updatedVars }));
                          }}
                          className="h-7 text-sm"
                          placeholder="Description of this variable"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariable(variable.name)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  <div className="text-sm font-medium mb-2">Add New Variable</div>
                  <div className="flex gap-2">
                    <Input
                      value={newVariable.name}
                      onChange={e => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Variable name"
                      className="flex-grow"
                    />
                    <Button onClick={handleAddVariable}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Enter values for variables to see the rendered template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Variable inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {template.variables.map((variable, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`var-${variable.name}`}>
                        {variable.name}
                        {variable.required && <span className="text-red-500">*</span>}
                      </Label>
                      
                      {variable.type === 'text' && (
                        <Input
                          id={`var-${variable.name}`}
                          value={previewVariables[variable.name] || ''}
                          onChange={e => setPreviewVariables(prev => ({ 
                            ...prev,
                            [variable.name]: e.target.value
                          }))}
                          placeholder={variable.description || variable.name}
                        />
                      )}
                      
                      {/* Add more input types based on variable.type */}
                    </div>
                  ))}
                </div>
                
                {/* Rendered template */}
                <div className="border rounded-md p-4 min-h-[200px] whitespace-pre-wrap">
                  {renderTemplate(template.template, previewVariables)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
