import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, History, Lightbulb, HistoryIcon, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type ArtifactData } from '@/lib/services/db';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface PromptSidebarProps {
  artifactId: string | null;
  artifact: ArtifactData | null;
}

interface PromptHistory {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[]; // Variable identifiers 
}

export function PromptSidebar({ artifactId, artifact }: PromptSidebarProps) {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate> | null>(null);

  useEffect(() => {
    // Load prompt history from localStorage
    const savedHistory = localStorage.getItem('promptHistory');
    if (savedHistory) {
      try {
        setPromptHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse prompt history', error);
      }
    }

    // Load saved templates from localStorage
    const savedTemplates = localStorage.getItem('promptTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Failed to parse templates', error);
      }
    }
  }, []);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || !artifactId) return;

    setIsLoading(true);

    try {
      // Simulate API call to Claude
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a realistic response based on artifact type
      let response = '';
      if (artifact?.language === 'project-spec') {
        response = `Here's my analysis of your ${artifact.title || 'project'} specification:\n\n`;

        try {
          const content = JSON.parse(artifact.content || '{}');
          if (content.marketingPlanData) {
            response += `Your marketing plan targeting ${content.marketingPlanData.audience || 'your audience'} through ${content.marketingPlanData.channel || 'selected channels'} seems well-structured. To improve ROI, consider adding more specific KPIs for measuring success.`;
          } else if (content.type === 'sprint') {
            response += 'Your sprint plan is well-organized. Consider adding more detailed acceptance criteria for each task to ensure clear deliverables.';
          } else {
            response += 'This project specification provides a good foundation. I recommend adding more detail to the user stories and acceptance criteria to guide development.';
          }
        } catch (e) {
          response += 'Your project specification looks promising but would benefit from more structured data to analyze properly.';
        }
      } else {
        response = `I've analyzed your ${artifact?.language || 'code'} artifact. The implementation is generally good, but there are opportunities to improve readability and efficiency:\n\n`;
        response += '1. Consider adding more comments to document complex logic\n';
        response += '2. Some variable names could be more descriptive\n';
        response += '3. There may be opportunities to refactor repeated patterns';
      }

      // Add prompt to history
      const newPrompt = {
        id: crypto.randomUUID(),
        prompt: prompt,
        response,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [newPrompt, ...promptHistory];
      setPromptHistory(updatedHistory);
      localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));

      setPrompt('');
      toast.success('Response received from Claude');
    } catch (error) {
      toast.error('Failed to get response from Claude');
    } finally {
      setIsLoading(false);
      setActiveTab('history');
    }
  };

  const applyTemplate = (template: PromptTemplate) => {
    // Parse template and extract variable options
    const variables: Record<string, string[]> = {};

    template.variables.forEach(varName => {
      // Handle both simple variables and those with options
      // Format: {{varName}} or {{varName-option1-option2}}
      const regex = new RegExp(`\\{\\{${varName}(?:-([^}]*))?\\}\\}`, 'g');
      let match = regex.exec(template.template);

      if (match && match[1]) {
        // Variable has predefined options ({{varName-option1-option2}})
        variables[varName] = match[1].split('-');
      } else {
        // Simple variable without options
        const defaultOptions = {
          'language': ['JavaScript', 'TypeScript', 'Python', 'Java'],
          'testType': ['unit', 'integration', 'e2e'],
          'framework': ['Jest', 'Mocha', 'Cypress'],
          'expert': ['startup', 'marketing', 'sales', 'product'],
          'experience': ['senior', '10-year', 'silicon valley'],
          'businessArea': ['customer acquisition', 'pricing strategy', 'team organization']
        };

        variables[varName] = defaultOptions[varName as keyof typeof defaultOptions] || ['N/A'];
      }
    });

    // Create a prompt with the first option for each variable
    let newPrompt = template.template;
    Object.entries(variables).forEach(([varName, options]) => {
      const regex = new RegExp(`\\{\\{${varName}(?:-[^}]*)?\\}\\}`, 'g');
      newPrompt = newPrompt.replace(regex, options[0] || varName);
    });

    setPrompt(newPrompt);
    setActiveTab('prompt');
  };

  const saveTemplates = (updatedTemplates: PromptTemplate[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem('promptTemplates', JSON.stringify(updatedTemplates));
  };

  const startNewTemplate = () => {
    setNewTemplate({ name: '', template: '', variables: [] });
    setEditingTemplate(null);
  };

  const startEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate({ ...template });
    setNewTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    saveTemplates(updatedTemplates);
    toast.success('Template deleted');
  };

  const saveTemplate = (template: Partial<PromptTemplate>, isNew: boolean) => {
    // Extract variables from template content
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...template.template?.matchAll(variableRegex) || []];
    const extractedVars = matches.map(match => {
      // Extract variable name (before any hyphen)
      const parts = match[1].split('-');
      return parts[0];
    });

    // Remove duplicates
    const uniqueVars = [...new Set(extractedVars)];

    if (isNew && template.name && template.template) {
      const newTemplateObj: PromptTemplate = {
        id: crypto.randomUUID(),
        name: template.name,
        template: template.template,
        variables: uniqueVars
      };

      saveTemplates([...templates, newTemplateObj]);
      setNewTemplate(null);
      toast.success('Template created');
    } else if (!isNew && editingTemplate?.id && template.name && template.template) {
      const updatedTemplates = templates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, name: template.name, template: template.template, variables: uniqueVars }
          : t
      );

      saveTemplates(updatedTemplates);
      setEditingTemplate(null);
      toast.success('Template updated');
    }
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setNewTemplate(null);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="prompt" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid grid-cols-3 h-9 w-full">
          <TabsTrigger value="prompt">
            <Bot className="h-3.5 w-3.5 mr-1" />
            Prompt
          </TabsTrigger>
          <TabsTrigger value="history">
            <HistoryIcon className="h-3.5 w-3.5 mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Lightbulb className="h-3.5 w-3.5 mr-1" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="flex-grow flex flex-col p-2">
          {artifactId ? (
            <>
              <div className="text-xs text-muted-foreground mb-2">
                Ask Claude about{' '}
                <span className="font-semibold">
                  {artifact?.title || artifactId}
                </span>
              </div>

              <Textarea
                placeholder="Ask Claude to review this artifact, suggest improvements, or explain how it works..."
                className="flex-grow resize-none mb-2"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />

              <Button
                onClick={handleSendPrompt}
                disabled={!prompt.trim() || isLoading}
                className="ml-auto"
              >
                {isLoading ? 'Sending...' : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Bot className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p>Select an artifact to start a conversation with Claude</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-grow p-2">
          <ScrollArea className="h-full">
            {promptHistory.length > 0 ? (
              <div className="space-y-4">
                {promptHistory.map(item => (
                  <div key={item.id} className="space-y-1.5 text-sm">
                    <p className="font-semibold">
                      You: <span className="font-normal">{item.prompt}</span>
                    </p>
                    <p className="font-semibold">
                      Claude: <span className="font-normal">{item.response}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <hr className="mt-3 border-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p>No prompt history yet</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates" className="flex-grow p-2">
          <ScrollArea className="h-full">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Prompt Templates:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startNewTemplate}
                  className="h-7"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> New
                </Button>
              </div>

              {newTemplate && (
                <div className="border rounded-md p-3 mb-3 space-y-2">
                  <Input
                    placeholder="Template name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="Template content with {{variables}}"
                    value={newTemplate.template}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template: e.target.value })}
                    rows={3}
                    className="mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7">
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveTemplate(newTemplate, true)}
                      disabled={!newTemplate.name || !newTemplate.template}
                      className="h-7"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              )}

              {editingTemplate && (
                <div className="border rounded-md p-3 mb-3 space-y-2">
                  <Input
                    placeholder="Template name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="Template content with {{variables}}"
                    value={editingTemplate.template}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, template: e.target.value })}
                    rows={3}
                    className="mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7">
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveTemplate(editingTemplate, false)}
                      disabled={!editingTemplate.name || !editingTemplate.template}
                      className="h-7"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Update
                    </Button>
                  </div>
                </div>
              )}

              {templates.map(template => (
                <div
                  key={template.id}
                  className="border rounded-md p-3 hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{template.name}</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => startEditTemplate(template)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{template.template}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map(variable => (
                      <span
                        key={variable}
                        className="text-xs bg-muted px-2 py-0.5 rounded-sm"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 h-7"
                    onClick={() => applyTemplate(template)}
                  >
                    Apply Template
                  </Button>
                </div>
              ))}

              {templates.length === 0 && !newTemplate && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mx-auto mb-2" />
                  <p>No templates yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startNewTemplate}
                    className="mt-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create Template
                  </Button>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Template variables use &#123;&#123;variable&#125;&#125; syntax. For options, use &#123;&#123;variable-option1-option2&#125;&#125;
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
