import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, File, Layout, ListTodo, Target, DollarSign, 
  PieChart, BarChart3, Building, Network, Upload, Database, 
  Activity, HelpCircle, Users, UserPlus, X, Bot
} from 'lucide-react';
import { PromptBuilder } from './PromptBuilder';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: string;
  language?: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  templates: Template[];
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'code',
    name: 'Code Artifacts',
    templates: [
      { id: 'js', name: 'JavaScript', description: 'JavaScript code snippet', icon: File, type: 'code', language: 'javascript' },
      { id: 'ts', name: 'TypeScript', description: 'TypeScript code snippet', icon: File, type: 'code', language: 'typescript' },
      { id: 'py', name: 'Python', description: 'Python code snippet', icon: File, type: 'code', language: 'python' },
      { id: 'java', name: 'Java', description: 'Java code snippet', icon: File, type: 'code', language: 'java' },
      { id: 'go', name: 'Go', description: 'Go code snippet', icon: File, type: 'code', language: 'go' },
    ]
  },
  {
    id: 'planning',
    name: 'Project Planning',
    templates: [
      { id: 'project', name: 'Project Specification', description: 'Define project scope', icon: Layout, type: 'project' },
      { id: 'sprint', name: 'Sprint Plan', description: 'Plan development cycles', icon: ListTodo, type: 'Sprint' },
      { id: 'objectives', name: 'Objectives', description: 'Set project goals', icon: Target, type: 'Objectives' },
    ]
  },
  {
    id: 'business',
    name: 'Business Plans',
    templates: [
      { id: 'marketing', name: 'Marketing Strategy', description: 'Plan marketing tactics', icon: Target, type: 'Marketing' },
      { id: 'funding', name: 'Fundraising', description: 'Secure investment', icon: DollarSign, type: 'Funding' },
      { id: 'budget', name: 'Budget', description: 'Financial projections', icon: PieChart, type: 'Budget' },
      { id: 'shares', name: 'Shares', description: 'Equity distribution', icon: BarChart3, type: 'Shares' },
      { id: 'startup', name: 'Startup', description: 'Company formation', icon: Building, type: 'Startup' },
    ]
  }
];

export function TemplateModal({ isOpen, onClose, onSelect }: TemplateModalProps) {
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search) return templateCategories;
    
    const searchTerm = search.toLowerCase();
    return templateCategories.map(category => ({
      ...category,
      templates: category.templates.filter(template => 
        template.name.toLowerCase().includes(searchTerm) || 
        template.description.toLowerCase().includes(searchTerm)
      )
    })).filter(category => category.templates.length > 0);
  }, [search]);

  const handleSelect = (template: Template) => {
    if (template.type === 'code' || template.type === 'project') {
      setSelectedTemplate(template);
      setGeneratedPrompt('');
    } else {
      onSelect(template);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl flex flex-col h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center shrink-0">
            <h2 className="text-xl font-semibold">Create New Artifact</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8 pb-6">
              {selectedTemplate ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                      <X className="h-4 w-4 mr-2" />
                      Back to templates
                    </Button>
                  </div>
                  <PromptBuilder
                    template={selectedTemplate}
                    onPromptChange={setGeneratedPrompt}
                  />
                </div>
              ) : (
                filteredCategories.map(category => (
                  <div key={category.id}>
                    <h3 className="text-lg font-medium mb-3">{category.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {category.templates.map(template => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center justify-start text-center gap-2"
                          onClick={() => handleSelect(template)}
                        >
                          <div className="h-8 w-8 text-muted-foreground">
                            <template.icon className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium">No templates found</h3>
                  <p className="text-muted-foreground">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t shrink-0 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {selectedTemplate && (
              <Button 
                onClick={() => {
                  onSelect({
                    ...selectedTemplate,
                    description: generatedPrompt || selectedTemplate.description
                  });
                }}
                disabled={!generatedPrompt}
              >
                Create {selectedTemplate.name}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
