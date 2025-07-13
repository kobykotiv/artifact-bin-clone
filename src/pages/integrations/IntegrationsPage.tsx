import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  Github, 
  GitBranch, 
  MessageSquare, 
  Database, 
  Cloud,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'available' | 'connected' | 'error' | 'coming-soon';
  category: 'version-control' | 'communication' | 'storage' | 'deployment';
  settings?: Record<string, any>;
  lastSync?: string;
}

const availableIntegrations: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync with GitHub repositories and import code',
    icon: Github,
    status: 'available',
    category: 'version-control'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Connect GitLab projects and CI/CD pipelines',
    icon: GitBranch,
    status: 'connected',
    category: 'version-control',
    settings: { repo: 'user/project', branch: 'main' },
    lastSync: '2024-01-20T10:30:00Z'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Share artifacts and get notifications in Slack',
    icon: MessageSquare,
    status: 'connected',
    category: 'communication',
    settings: { channel: '#dev-team', notifications: true },
    lastSync: '2024-01-20T15:45:00Z'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync with Notion databases and pages',
    icon: Database,
    status: 'coming-soon',
    category: 'storage'
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Store artifacts in Amazon S3 buckets',
    icon: Cloud,
    status: 'available',
    category: 'storage'
  }
];

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const categories = [
    { id: 'all', name: 'All Integrations' },
    { id: 'version-control', name: 'Version Control' },
    { id: 'communication', name: 'Communication' },
    { id: 'storage', name: 'Storage' },
    { id: 'deployment', name: 'Deployment' }
  ];

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === 'all' || integration.category === selectedCategory
  );

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'error': return AlertCircle;
      case 'coming-soon': return Clock;
      default: return Plug;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'coming-soon': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'coming-soon': return <Badge className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
    }
  };

  const handleConnect = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/connect`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, status: 'connected' as const, lastSync: new Date().toISOString() }
              : integration
          )
        );
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, status: 'available' as const, settings: undefined, lastSync: undefined }
              : integration
          )
        );
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, lastSync: new Date().toISOString() }
              : integration
          )
        );
      }
    } catch (error) {
      console.error('Failed to sync integration:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect external services and automate workflows</p>
        </div>
        <Button onClick={() => setShowAddCustom(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Custom Integration
        </Button>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected ({integrations.filter(i => i.status === 'connected').length})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const IconComponent = integration.icon;
              const StatusIcon = getStatusIcon(integration.status);
              
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-8 w-8" />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(integration.status)}
                          </div>
                        </div>
                      </div>
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(integration.status)}`} />
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {integration.status === 'connected' && integration.settings && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Settings</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(integration.settings).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {integration.lastSync && (
                      <div className="text-xs text-muted-foreground">
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {integration.status === 'available' && (
                        <Button
                          className="flex-1"
                          onClick={() => handleConnect(integration.id)}
                        >
                          Connect
                        </Button>
                      )}
                      
                      {integration.status === 'connected' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {integration.status === 'coming-soon' && (
                        <Button disabled className="flex-1">
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {integrations
              .filter(integration => integration.status === 'connected')
              .map((integration) => {
                const IconComponent = integration.icon;
                
                return (
                  <Card key={integration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <IconComponent className="h-8 w-8" />
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                            {integration.lastSync && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last synced: {new Date(integration.lastSync).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                      
                      {integration.settings && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Configuration</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(integration.settings).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground capitalize">{key}: </span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhooks to receive real-time notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhooks/artifact-bin"
                  />
                </div>
                
                <div>
                  <Label>Events</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      'artifact.created',
                      'artifact.updated',
                      'artifact.deleted',
                      'collection.shared',
                      'user.invited'
                    ].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch id={event} />
                        <Label htmlFor={event} className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IntegrationsPage;
