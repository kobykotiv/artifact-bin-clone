import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, File, Layout, Target, DollarSign, PieChart, BarChart3, Network, 
         ListTodo, Map, Database, Users, Activity, Building, HelpCircle, BookOpen, 
         Briefcase, Brain, Code, GitBranch, Globe, Monitor, Puzzle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: string;
  category: string;
  language?: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  templates: Template[];
}

interface TemplateBrowserModalProps {
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export function TemplateBrowserModal({ onClose, onSelectTemplate }: TemplateBrowserModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: TemplateCategory[] = [
    {
      id: 'code',
      name: 'Code Artifacts',
      templates: [
        { id: 'js', name: 'JavaScript', description: 'Create a JavaScript code snippet', icon: Code, type: 'code', category: 'code', language: 'javascript' },
        { id: 'ts', name: 'TypeScript', description: 'Create a TypeScript code snippet', icon: Code, type: 'code', category: 'code', language: 'typescript' },
        { id: 'py', name: 'Python', description: 'Create a Python code snippet', icon: Code, type: 'code', category: 'code', language: 'python' },
        { id: 'go', name: 'Go', description: 'Create a Go code snippet', icon: Code, type: 'code', category: 'code', language: 'go' },
        { id: 'rust', name: 'Rust', description: 'Create a Rust code snippet', icon: Code, type: 'code', category: 'code', language: 'rust' },
      ]
    },
    {
      id: 'planning',
      name: 'Project Planning',
      templates: [
        { id: 'project-spec', name: 'Project Specification', description: 'Define your project requirements', icon: Layout, type: 'project', category: 'planning' },
        { id: 'sprint', name: 'Sprint Planning', description: 'Plan development sprints', icon: ListTodo, type: 'Sprint', category: 'planning' },
        { id: 'roadmap', name: 'Product Roadmap', description: 'Map product evolution', icon: Map, type: 'Roadmap', category: 'planning' },
        { id: 'architecture', name: 'System Architecture', description: 'Design system structure', icon: Network, type: 'Architecture', category: 'planning' },
        { id: 'deployment', name: 'Deployment Guide', description: 'Plan release process', icon: GitBranch, type: 'Deployment', category: 'planning' },
      ]
    },
    {
      id: 'business',
      name: 'Business Planning',
      templates: [
        { id: 'marketing', name: 'Marketing Strategy', description: 'Plan marketing campaigns', icon: Target, type: 'Marketing', category: 'business' },
        { id: 'funding', name: 'Fundraising Plan', description: 'Plan investment rounds', icon: DollarSign, type: 'Funding', category: 'business' },
        { id: 'budget', name: 'Budget Planning', description: 'Financial projections', icon: PieChart, type: 'Budget', category: 'business' },
        { id: 'shares', name: 'Equity Structure', description: 'Plan share distribution', icon: BarChart3, type: 'Shares', category: 'business' },
        { id: 'startup', name: 'Startup Plan', description: 'Company formation plan', icon: Building, type: 'Startup', category: 'business' },
      ]
    },
    {
      id: 'research',
      name: 'Research & Analytics',
      templates: [
        { id: 'user-research', name: 'User Research', description: 'Document user insights', icon: Users, type: 'UserResearch', category: 'research' },
        { id: 'analytics', name: 'Analytics Setup', description: 'Plan tracking implementation', icon: Activity, type: 'Analytics', category: 'research' },
        { id: 'database', name: 'Database Schema', description: 'Design data models', icon: Database, type: 'Database', category: 'research' },
        { id: 'market', name: 'Market Analysis', description: 'Research market landscape', icon: Globe, type: 'Market', category: 'research' },
      ]
    },
    {
      id: 'product',
      name: 'Product Development',
      templates: [
        { id: 'feature', name: 'Feature Spec', description: 'Define feature requirements', icon: Puzzle, type: 'Feature', category: 'product' },
        { id: 'api', name: 'API Design', description: 'Plan API endpoints', icon: Monitor, type: 'API', category: 'product' },
        { id: 'objectives', name: 'Product Goals', description: 'Set product objectives', icon: Target, type: 'Objectives', category: 'product' },
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    templates: category.templates.filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.templates.length > 0);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-4 sm:inset-10 bg-background border rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Create New Artifact</h2>
            <p className="text-sm text-muted-foreground">Choose a template to get started</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-8">
            {filteredCategories.map(category => (
              <div key={category.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.templates.map(template => (
                    <button
                      key={template.id}
                      className="group relative flex flex-col gap-1 rounded-lg border p-3 hover:border-primary text-left"
                      onClick={() => onSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-2">
                        <template.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        <div className="flex-1">
                          <div className="font-medium leading-none mb-1">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No templates found matching your search</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
