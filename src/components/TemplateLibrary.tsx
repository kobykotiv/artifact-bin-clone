import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  X, 
  File, 
  Layout, 
  Target, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Network, 
  ListTodo, 
  Map, 
  Database, 
  Users, 
  Activity, 
  Building, 
  BookOpen, 
  Brain, 
  Code, 
  GitBranch, 
  Globe, 
  Monitor, 
  Puzzle,
  Star,
  Download,
  Plus,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { CustomTemplateManager } from './CustomTemplateManager';
import { TemplateBrowserModal } from './TemplateBrowserModal';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: string;
  category: string;
  language?: string;
  tags?: string[];
  author?: string;
  downloads?: number;
  rating?: number;
  isPopular?: boolean;
  isNew?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const templateCategories = [
  {
    id: 'code',
    name: 'Code Artifacts',
    description: 'Ready-to-use code snippets and components',
    templates: [
      { 
        id: 'react-component', 
        name: 'React Component', 
        description: 'Modern React component with hooks', 
        icon: Code, 
        type: 'code', 
        category: 'code', 
        language: 'typescript',
        tags: ['react', 'hooks', 'typescript'],
        downloads: 1250,
        rating: 4.8,
        isPopular: true,
        difficulty: 'intermediate'
      },
      { 
        id: 'api-endpoint', 
        name: 'REST API Endpoint', 
        description: 'Express.js API endpoint with validation', 
        icon: Code, 
        type: 'code', 
        category: 'code', 
        language: 'javascript',
        tags: ['api', 'express', 'validation'],
        downloads: 890,
        rating: 4.6,
        difficulty: 'beginner'
      },
      { 
        id: 'python-script', 
        name: 'Python Data Script', 
        description: 'Data processing script with pandas', 
        icon: Code, 
        type: 'code', 
        category: 'code', 
        language: 'python',
        tags: ['python', 'data', 'pandas'],
        downloads: 654,
        rating: 4.5,
        difficulty: 'intermediate'
      },
    ]
  },
  {
    id: 'planning',
    name: 'Project Planning',
    description: 'Templates for project management and planning',
    templates: [
      { 
        id: 'project-spec', 
        name: 'Project Specification', 
        description: 'Comprehensive project requirements template', 
        icon: Layout, 
        type: 'document', 
        category: 'planning',
        tags: ['planning', 'requirements', 'documentation'],
        downloads: 2100,
        rating: 4.9,
        isPopular: true,
        difficulty: 'beginner'
      },
      { 
        id: 'sprint-planning', 
        name: 'Sprint Planning', 
        description: 'Agile sprint planning template', 
        icon: ListTodo, 
        type: 'document', 
        category: 'planning',
        tags: ['agile', 'sprint', 'planning'],
        downloads: 1800,
        rating: 4.7,
        difficulty: 'intermediate'
      },
      { 
        id: 'architecture-doc', 
        name: 'System Architecture', 
        description: 'Technical architecture documentation', 
        icon: Network, 
        type: 'document', 
        category: 'planning',
        tags: ['architecture', 'technical', 'documentation'],
        downloads: 1200,
        rating: 4.8,
        difficulty: 'advanced'
      },
    ]
  },
  {
    id: 'business',
    name: 'Business Planning',
    description: 'Business strategy and planning templates',
    templates: [
      { 
        id: 'business-plan', 
        name: 'Business Plan', 
        description: 'Complete business plan template', 
        icon: Building, 
        type: 'document', 
        category: 'business',
        tags: ['business', 'strategy', 'planning'],
        downloads: 3200,
        rating: 4.9,
        isPopular: true,
        isNew: true,
        difficulty: 'intermediate'
      },
      { 
        id: 'marketing-strategy', 
        name: 'Marketing Strategy', 
        description: 'Digital marketing campaign template', 
        icon: Target, 
        type: 'document', 
        category: 'business',
        tags: ['marketing', 'strategy', 'digital'],
        downloads: 2800,
        rating: 4.6,
        difficulty: 'intermediate'
      },
      { 
        id: 'funding-pitch', 
        name: 'Investor Pitch', 
        description: 'Investor pitch deck template', 
        icon: DollarSign, 
        type: 'document', 
        category: 'business',
        tags: ['funding', 'pitch', 'investors'],
        downloads: 1500,
        rating: 4.7,
        difficulty: 'advanced'
      },
    ]
  },
  {
    id: 'ai-prompts',
    name: 'AI Prompts',
    description: 'AI prompt templates for various use cases',
    templates: [
      { 
        id: 'code-review', 
        name: 'Code Review Prompt', 
        description: 'AI prompt for code review and analysis', 
        icon: Brain, 
        type: 'prompt', 
        category: 'ai-prompts',
        tags: ['ai', 'code-review', 'analysis'],
        downloads: 980,
        rating: 4.8,
        isNew: true,
        difficulty: 'intermediate'
      },
      { 
        id: 'content-creation', 
        name: 'Content Creation', 
        description: 'AI prompt for generating marketing content', 
        icon: Brain, 
        type: 'prompt', 
        category: 'ai-prompts',
        tags: ['ai', 'content', 'marketing'],
        downloads: 1200,
        rating: 4.5,
        difficulty: 'beginner'
      },
    ]
  }
];

export function TemplateLibrary({ isOpen, onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showCustomManager, setShowCustomManager] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const allTemplates = templateCategories.flatMap(cat => 
    cat.templates.map(template => ({ ...template, categoryName: cat.name }))
  );

  const filteredTemplates = allTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return b.isNew ? 1 : -1;
        default:
          return 0;
      }
    });

  const featuredTemplates = allTemplates.filter(t => t.isPopular || t.isNew).slice(0, 6);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl w-full h-auto max-h-[95vh] p-0 overflow-visible">
        <DialogHeader className="border-b pb-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Template Library</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and use community templates to accelerate your projects
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowCustomManager(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 pb-6" style={{minHeight: 0}}>
          <Tabs defaultValue="browse" className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="browse">Browse Templates</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="flex-1 flex flex-col overflow-auto">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search templates, tags, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {templateCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[120px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Templates Grid */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                  {filteredTemplates.map(template => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-200 group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <template.icon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm truncate">{template.name}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {template.categoryName}
                                </Badge>
                                {template.language && (
                                  <Badge variant="secondary" className="text-xs">
                                    {template.language}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {template.isNew && (
                              <Badge className="text-xs bg-green-500">NEW</Badge>
                            )}
                            {template.isPopular && (
                              <Badge className="text-xs bg-orange-500">POPULAR</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs mb-3 line-clamp-2">
                          {template.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              {template.downloads || 0}
                            </span>
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {template.rating || 0}
                            </span>
                          </div>
                          <Badge 
                            variant={template.difficulty === 'beginner' ? 'default' : 
                                   template.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {template.difficulty}
                          </Badge>
                        </div>

                        {template.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{template.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => onSelectTemplate(template)}
                          >
                            Use Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setPreviewTemplate(template)}
                          >
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No templates found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Featured Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuredTemplates.map(template => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-all">
                          <CardHeader>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <template.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <CardDescription>{template.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Download className="h-4 w-4 mr-1" />
                                  {template.downloads}
                                </span>
                                <span className="flex items-center">
                                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                                  {template.rating}
                                </span>
                              </div>
                              <Button size="sm" onClick={() => onSelectTemplate(template)}>
                                Use Template
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="my-templates" className="flex-1 overflow-hidden">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No custom templates yet</h3>
                <p className="text-muted-foreground mb-4">Create your own templates to reuse across projects</p>
                <Button onClick={() => setShowCustomManager(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Template Preview Modal */}
        {previewTemplate && (
          <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Template Preview: {previewTemplate.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">{previewTemplate.description}</p>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.tags?.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Template preview content would be displayed here...</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => onSelectTemplate(previewTemplate)}>
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Custom Template Manager */}
        <CustomTemplateManager
          isOpen={showCustomManager}
          onClose={() => setShowCustomManager(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
