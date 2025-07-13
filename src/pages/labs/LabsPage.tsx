import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Beaker, 
  Cpu, 
  Bot, 
  Zap, 
  Brain, 
  Sparkles, 
  Rocket, 
  TestTube,
  Database,
  Network,
  Eye,
  Settings2
} from 'lucide-react';

interface ExperimentalFeature {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'performance' | 'ui' | 'integration' | 'beta';
  status: 'experimental' | 'beta' | 'preview' | 'deprecated';
  enabled: boolean;
  completionPercentage: number;
  risks: string[];
  benefits: string[];
  lastUpdated: string;
}

const LabsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [features, setFeatures] = useState<ExperimentalFeature[]>([
    {
      id: 'ai-code-generation',
      name: 'AI Code Generation',
      description: 'Generate artifacts using advanced AI models with custom prompts and templates.',
      category: 'ai',
      status: 'beta',
      enabled: false,
      completionPercentage: 85,
      risks: ['May generate unexpected code', 'Resource intensive'],
      benefits: ['Faster development', 'Creative suggestions'],
      lastUpdated: '2025-07-10'
    },
    {
      id: 'realtime-collaboration',
      name: 'Real-time Collaboration',
      description: 'Collaborate on artifacts in real-time with live cursors and instant synchronization.',
      category: 'integration',
      status: 'experimental',
      enabled: false,
      completionPercentage: 60,
      risks: ['Potential data conflicts', 'Increased server load'],
      benefits: ['Seamless teamwork', 'Instant feedback'],
      lastUpdated: '2025-07-08'
    },
    {
      id: 'smart-search',
      name: 'AI-Powered Smart Search',
      description: 'Search artifacts using natural language queries with semantic understanding.',
      category: 'ai',
      status: 'preview',
      enabled: true,
      completionPercentage: 75,
      risks: ['Query misinterpretation'],
      benefits: ['Intuitive search', 'Better discovery'],
      lastUpdated: '2025-07-12'
    },
    {
      id: 'performance-mode',
      name: 'Performance Mode',
      description: 'Enhanced performance optimizations for large artifact collections.',
      category: 'performance',
      status: 'beta',
      enabled: false,
      completionPercentage: 90,
      risks: ['Potential compatibility issues'],
      benefits: ['Faster loading', 'Better responsiveness'],
      lastUpdated: '2025-07-09'
    },
    {
      id: 'voice-commands',
      name: 'Voice Commands',
      description: 'Control the application using voice commands and speech recognition.',
      category: 'ui',
      status: 'experimental',
      enabled: false,
      completionPercentage: 40,
      risks: ['Privacy concerns', 'Accuracy limitations'],
      benefits: ['Hands-free operation', 'Accessibility'],
      lastUpdated: '2025-07-05'
    },
    {
      id: 'blockchain-storage',
      name: 'Blockchain Storage',
      description: 'Store artifacts on blockchain for immutable version history.',
      category: 'integration',
      status: 'experimental',
      enabled: false,
      completionPercentage: 30,
      risks: ['High gas costs', 'Complexity'],
      benefits: ['Immutable history', 'Decentralization'],
      lastUpdated: '2025-07-01'
    }
  ]);

  const categoryIcons = {
    ai: Bot,
    performance: Zap,
    ui: Eye,
    integration: Network,
    beta: TestTube
  };

  const statusColors = {
    experimental: 'bg-orange-100 text-orange-800',
    beta: 'bg-blue-100 text-blue-800',
    preview: 'bg-green-100 text-green-800',
    deprecated: 'bg-gray-100 text-gray-800'
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Beaker className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Labs</h1>
            <p className="text-gray-600">Experimental features and upcoming functionality</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <TestTube className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Warning:</strong> These features are experimental and may be unstable. 
            Use at your own risk in production environments.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <div className="text-sm font-medium text-gray-600">Active Features</div>
            </div>
            <div className="text-2xl font-bold">{enabledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium text-gray-600">In Development</div>
            </div>
            <div className="text-2xl font-bold">{features.filter(f => f.status === 'experimental').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium text-gray-600">AI Features</div>
            </div>
            <div className="text-2xl font-bold">{features.filter(f => f.category === 'ai').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-600" />
              <div className="text-sm font-medium text-gray-600">Performance</div>
            </div>
            <div className="text-2xl font-bold">{features.filter(f => f.category === 'performance').length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search experimental features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="ai">AI Features</option>
                  <option value="performance">Performance</option>
                  <option value="ui">User Interface</option>
                  <option value="integration">Integrations</option>
                  <option value="beta">Beta Features</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="grid gap-6">
            {filteredFeatures.map((feature) => {
              const CategoryIcon = categoryIcons[feature.category] || Settings2;
              
              return (
                <Card key={feature.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CategoryIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <Badge className={statusColors[feature.status]}>
                              {feature.status}
                            </Badge>
                          </div>
                          <CardDescription>{feature.description}</CardDescription>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Updated: {feature.lastUpdated}</span>
                            <span>Progress: {feature.completionPercentage}%</span>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <Progress value={feature.completionPercentage} className="h-2" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2">Risks</h4>
                        <ul className="space-y-1">
                          {feature.risks.map((risk, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
              <CardDescription>
                Help us improve experimental features by sharing your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feature-select">Feature</Label>
                <select id="feature-select" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                  <option>Select a feature...</option>
                  {features.map(feature => (
                    <option key={feature.id} value={feature.id}>{feature.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <select id="feedback-type" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>General Feedback</option>
                  <option>Performance Issue</option>
                </select>
              </div>
              <div>
                <Label htmlFor="feedback-message">Message</Label>
                <Textarea
                  id="feedback-message"
                  placeholder="Tell us about your experience with this experimental feature..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <Button>Submit Feedback</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Roadmap</CardTitle>
              <CardDescription>
                Upcoming experimental features and their expected timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full -ml-6 border-2 border-white"></div>
                    <h3 className="font-medium">Q3 2025</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• AI Code Generation (Beta)</li>
                    <li>• Performance Mode (Stable)</li>
                    <li>• Smart Search (General Availability)</li>
                  </ul>
                </div>
                
                <div className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full -ml-6 border-2 border-white"></div>
                    <h3 className="font-medium">Q4 2025</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Real-time Collaboration (Beta)</li>
                    <li>• Voice Commands (Alpha)</li>
                    <li>• Advanced Analytics</li>
                  </ul>
                </div>
                
                <div className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full -ml-6 border-2 border-white"></div>
                    <h3 className="font-medium">Q1 2026</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Blockchain Storage (Experimental)</li>
                    <li>• Mobile App Integration</li>
                    <li>• Advanced AI Workflows</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LabsPage;
