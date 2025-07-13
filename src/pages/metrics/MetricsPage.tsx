import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download, 
  Heart, 
  Share2,
  Users,
  Clock,
  Target
} from 'lucide-react';

interface MetricsData {
  overview: {
    totalViews: number;
    totalDownloads: number;
    totalLikes: number;
    totalShares: number;
  };
  topArtifacts: Array<{
    id: string;
    name: string;
    views: number;
    downloads: number;
    likes: number;
  }>;
  timeRange: string;
}

const mockMetrics: MetricsData = {
  overview: {
    totalViews: 1248,
    totalDownloads: 342,
    totalLikes: 89,
    totalShares: 23
  },
  topArtifacts: [
    { id: '1', name: 'React Auth Hook', views: 234, downloads: 67, likes: 23 },
    { id: '2', name: 'API Guidelines', views: 189, downloads: 45, likes: 18 },
    { id: '3', name: 'UI Components', views: 156, downloads: 34, likes: 12 }
  ],
  timeRange: '30d'
};

export function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData>(mockMetrics);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/metrics/overview?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Views',
      value: metrics.overview.totalViews,
      icon: Eye,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Downloads',
      value: metrics.overview.totalDownloads,
      icon: Download,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Likes',
      value: metrics.overview.totalLikes,
      icon: Heart,
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Shares',
      value: metrics.overview.totalShares,
      icon: Share2,
      change: '+5%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics</h1>
          <p className="text-muted-foreground">Analytics and insights for your artifacts</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      {stat.change} from last period
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Top Artifacts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Artifacts</CardTitle>
              <CardDescription>Your most popular artifacts in the selected time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topArtifacts.map((artifact, index) => (
                  <div key={artifact.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{artifact.name}</h4>
                      </div>
                    </div>
                    <div className="flex space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{artifact.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{artifact.downloads}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{artifact.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Artifact Analytics</h3>
            <p className="text-muted-foreground">
              Detailed analytics for individual artifacts coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Engagement Metrics</h3>
            <p className="text-muted-foreground">
              User engagement and interaction analytics coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Growth Analytics</h3>
            <p className="text-muted-foreground">
              Growth trends and forecasting coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MetricsPage;
