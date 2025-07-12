import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, History, Lightbulb, HistoryIcon, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type ArtifactData } from '@/lib/models/Artifact';
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate> | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

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

  const handleAddTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTpl: PromptTemplate = {
      id: crypto.randomUUID(),
      name: newTemplateName,
      template: 'New template content...',
      variables: [],
    };
    const updatedTemplates = [...templates, newTpl];
    setTemplates(updatedTemplates);
    localStorage.setItem('promptTemplates', JSON.stringify(updatedTemplates));
    setNewTemplateName('');
    toast.success('Template added');
  };

  const handleUpdateTemplate = (id: string, updates: Partial<PromptTemplate>) => {
    const updatedTemplates = templates.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTemplates(updatedTemplates);
    localStorage.setItem('promptTemplates', JSON.stringify(updatedTemplates));
    toast.success('Template updated');
  };

  const handleDeleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('promptTemplates', JSON.stringify(updatedTemplates));
    toast.success('Template deleted');
  };

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
    <>
      <div
        className={`fixed top-0 right-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-50 ${
          isCollapsed ? 'w-16' : 'w-96'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">{isCollapsed ? '' : 'Prompt Engineering'}</h2>
            {!isCollapsed && (
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chat">
                    <Bot className="w-4 h-4 mr-1" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="templates">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <HistoryIcon className="w-4 h-4 mr-1" />
                    History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat">
                  <div className="flex flex-col h-[calc(100vh-12rem)]">
                    <ScrollArea className="flex-grow p-2 bg-gray-800 rounded-lg">
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
                    </ScrollArea>
                    <div className="mt-4 flex items-center">
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your prompt here..."
                        className="flex-grow bg-gray-800 border-gray-700 focus:ring-blue-500"
                      />
                      <Button onClick={handleSendPrompt} className="ml-2">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="templates">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Input
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="New template name"
                        className="flex-grow bg-gray-800 border-gray-700"
                      />
                      <Button onClick={handleAddTemplate} className="ml-2">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {templates.map((template) => (
                      <div key={template.id} className="p-2 rounded-lg bg-gray-800">
                        {editingTemplateId === template.id ? (
                          <div className="flex items-center">
                            <Input
                              defaultValue={template.name}
                              onBlur={(e) =>
                                handleUpdateTemplate(template.id, { name: e.target.value })
                              }
                              className="flex-grow bg-gray-700 border-gray-600"
                            />
                            <Button
                              onClick={() => setEditingTemplateId(null)}
                              size="sm"
                              variant="ghost"
                              className="ml-2"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span>{template.name}</span>
                            <div>
                              <Button
                                onClick={() => setEditingTemplateId(template.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteTemplate(template.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-2">
                      {promptHistory.map(entry => (
                        <div key={entry.id} className="p-2 rounded-lg bg-gray-800">
                          <div className="text-sm text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          <p className="truncate">{entry.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </div>
      {!isCollapsed && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />}
    </>
  );
}
