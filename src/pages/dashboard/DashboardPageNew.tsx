import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  TrendingUp, 
  Activity, 
  Archive, 
  Users, 
  Eye,
  Upload,
  Share,
  Star,
  Clock,
  AlertTriangle,
  Database,
  FileText,
  Image,
  Download,
  Settings,
  Bell,
  Search,
  Calendar,
  BarChart3,
  Zap,
  GitBranch,
  ExternalLink,
  Pin,
  Filter,
  RefreshCw,
  HardDrive,
  Wifi,
  Shield,
  PieChart
} from 'lucide-react';
import { useAuthContext } from '@/lib/context/AuthContext';

// Enhanced Dashboard Component with comprehensive features
interface DashboardStats {
  totalArtifacts: number;
  totalBins: number;
  totalUsers: number;
  recentActivity: number;
  storageUsed: number;
  storageQuota: number;
  uploadsThisWeek: number;
  uploadsThisMonth: number;
  sharedWithMe: number;
  expiringArtifacts: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'view' | 'share' | 'create' | 'edit' | 'delete';
  description: string;
  timestamp: string;
  user?: string;
  avatar?: string;
  artifactId?: string;
}

interface PinnedBin {
  id: string;
  name: string;
  description: string;
  artifactCount: number;
  lastUpdated: string;
  owner: string;
  isShared: boolean;
  visibility: 'private' | 'team' | 'public';
}

interface ExpiringArtifact {
  id: string;
  name: string;
  type: string;
  expiresAt: string;
  daysLeft: number;
  size: number;
}

interface SharedItem {
  id: string;
  name: string;
  type: 'bin' | 'artifact';
  owner: string;
  permission: 'read' | 'write' | 'admin';
  sharedAt: string;
}

interface FileTypeStats {
  type: string;
  count: number;
  size: number;
  icon: React.ComponentType;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  activityCount: number;
  lastActive: string;
}

interface IntegrationStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  activity: number;
}

// Mock data - in real app this would come from API
const mockStats: DashboardStats = {
  totalArtifacts: 142,
  totalBins: 23,
  totalUsers: 8,
  recentActivity: 15,
  storageUsed: 2.4, // GB
  storageQuota: 10, // GB
  uploadsThisWeek: 7,
  uploadsThisMonth: 28,
  sharedWithMe: 5,
  expiringArtifacts: 3
};

const mockActivity: RecentActivity[] = [
  { id: '1', type: 'upload', description: 'React Authentication Hook uploaded', timestamp: '2 minutes ago', user: 'John Smith', avatar: 'john' },
  { id: '2', type: 'view', description: 'API Template Collection viewed', timestamp: '5 minutes ago', user: 'Sarah Chen', avatar: 'sarah' },
  { id: '3', type: 'create', description: 'New bin "Frontend Components" created', timestamp: '1 hour ago', user: 'Mike Johnson', avatar: 'mike' },
  { id: '4', type: 'share', description: 'Authentication templates shared with team', timestamp: '2 hours ago', user: 'Lisa Wang', avatar: 'lisa' },
  { id: '5', type: 'edit', description: 'Database schema artifact updated', timestamp: '3 hours ago', user: 'Alex Rodriguez', avatar: 'alex' },
  { id: '6', type: 'upload', description: 'CI/CD pipeline configuration uploaded', timestamp: '4 hours ago', user: 'Emma Brown', avatar: 'emma' },
];

const mockPinnedBins: PinnedBin[] = [
  { id: '1', name: 'Frontend Components', description: 'Reusable React components', artifactCount: 24, lastUpdated: '2 hours ago', owner: 'You', isShared: false, visibility: 'private' },
  { id: '2', name: 'API Templates', description: 'REST API endpoints and schemas', artifactCount: 18, lastUpdated: '1 day ago', owner: 'Development Team', isShared: true, visibility: 'team' },
  { id: '3', name: 'Documentation', description: 'Project docs and guides', artifactCount: 12, lastUpdated: '3 days ago', owner: 'You', isShared: true, visibility: 'public' },
];

const mockExpiringArtifacts: ExpiringArtifact[] = [
  { id: '1', name: 'temporary-logs-2024.zip', type: 'archive', expiresAt: '2024-01-25', daysLeft: 2, size: 45.2 },
  { id: '2', name: 'screenshot-debug.png', type: 'image', expiresAt: '2024-01-27', daysLeft: 4, size: 2.1 },
  { id: '3', name: 'test-database-dump.sql', type: 'database', expiresAt: '2024-01-30', daysLeft: 7, size: 128.5 },
];

const mockSharedItems: SharedItem[] = [
  { id: '1', name: 'Design System', type: 'bin', owner: 'Design Team', permission: 'read', sharedAt: '2024-01-15' },
  { id: '2', name: 'API Documentation', type: 'artifact', owner: 'Backend Team', permission: 'write', sharedAt: '2024-01-18' },
  { id: '3', name: 'Testing Scripts', type: 'bin', owner: 'QA Team', permission: 'read', sharedAt: '2024-01-20' },
];

const mockFileTypes: FileTypeStats[] = [
  { type: 'JavaScript', count: 45, size: 12.3, icon: FileText },
  { type: 'Images', count: 32, size: 8.7, icon: Image },
  { type: 'Archives', count: 18, size: 24.1, icon: Archive },
  { type: 'Documents', count: 25, size: 5.2, icon: FileText },
  { type: 'Databases', count: 8, size: 15.8, icon: Database },
];

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'John Smith', avatar: 'john', activityCount: 12, lastActive: '5 minutes ago' },
  { id: '2', name: 'Sarah Chen', avatar: 'sarah', activityCount: 8, lastActive: '1 hour ago' },
  { id: '3', name: 'Mike Johnson', avatar: 'mike', activityCount: 6, lastActive: '2 hours ago' },
];

const mockIntegrations: IntegrationStatus[] = [
  { name: 'GitHub CI/CD', status: 'active', lastSync: '10 minutes ago', activity: 5 },
  { name: 'Slack Notifications', status: 'active', lastSync: '1 hour ago', activity: 12 },
  { name: 'AWS S3 Backup', status: 'inactive', lastSync: '2 days ago', activity: 0 },
  { name: 'API Webhooks', status: 'error', lastSync: '1 day ago', activity: 0 },
];

const quickActions = [
  { label: 'Upload Artifact', icon: Upload, action: '/upload', variant: 'default' as const, description: 'Add new files or code' },
  { label: 'Create Bin', icon: Archive, action: '/bins', variant: 'outline' as const, description: 'Organize artifacts' },
  { label: 'Browse Gallery', icon: Eye, action: '/viewer', variant: 'outline' as const, description: 'View all artifacts' },
  { label: 'Share Collection', icon: Share, action: '/sharing', variant: 'outline' as const, description: 'Collaborate with team' },
];

export function DashboardPage() {
  const { authState } = useAuthContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activityFilter, setActivityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const storagePercentage = (mockStats.storageUsed / mockStats.storageQuota) * 100;
  const isStorageWarning = storagePercentage > 80;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    // In a real app, this would use react-router navigation
    console.log(`Navigate to: ${action}`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload;
      case 'view': return Eye;
      case 'share': return Share;
      case 'create': return Plus;
      case 'edit': return Settings;
      case 'delete': return AlertTriangle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            Welcome back, {authState.user?.name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your artifacts and bins
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2 relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                {notifications}
              </Badge>
            )}
          </Button>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications Banner */}
      {isStorageWarning && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">Storage Warning</p>
              <p className="text-sm text-orange-700">
                You're using {storagePercentage.toFixed(1)}% of your storage quota. Consider cleaning up old artifacts.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage Storage
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  className="h-auto p-4 flex flex-col items-center gap-3"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Artifacts</p>
                <p className="text-2xl font-bold">{mockStats.totalArtifacts}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{mockStats.uploadsThisWeek} this week
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bins</p>
                <p className="text-2xl font-bold">{mockStats.totalBins}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockStats.sharedWithMe} shared with you
                </p>
              </div>
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{mockStats.storageUsed}GB</p>
                <div className="mt-2">
                  <Progress value={storagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockStats.storageQuota - mockStats.storageUsed}GB remaining
                  </p>
                </div>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockCollaborators.length} active today
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity & Pinned Bins */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </div>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="mine">My Activity</SelectItem>
                  <SelectItem value="team">Team Activity</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {mockActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              by {activity.user} • {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pinned Bins */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Pinned Bins
              </CardTitle>
              <CardDescription>Quick access to your most important collections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPinnedBins.map((bin) => (
                  <div key={bin.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Archive className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{bin.name}</p>
                          {bin.isShared && <Share className="h-3 w-3 text-muted-foreground" />}
                          <Badge variant={bin.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                            {bin.visibility}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{bin.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {bin.artifactCount} artifacts • Updated {bin.lastUpdated} • by {bin.owner}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Widgets */}
        <div className="space-y-6">
          {/* File Types Distribution */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                File Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFileTypes.map((fileType) => {
                  const Icon = fileType.icon;
                  return (
                    <div key={fileType.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{fileType.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{fileType.count}</p>
                        <p className="text-xs text-muted-foreground">{fileType.size}MB</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Artifacts */}
          {mockStats.expiringArtifacts > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Clock className="h-5 w-5" />
                  Expiring Soon
                </CardTitle>
                <CardDescription>Artifacts that will be deleted soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockExpiringArtifacts.map((artifact) => (
                    <div key={artifact.id} className="flex items-center justify-between p-2 border border-orange-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{artifact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(artifact.size * 1024 * 1024)} • {artifact.daysLeft} days left
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Extend
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shared with Me */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Shared with Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSharedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === 'bin' ? <Archive className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">by {item.owner}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.permission}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Collaborators */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.lastActive}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {collaborator.activityCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockIntegrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {integration.lastSync}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        integration.status === 'active' ? 'bg-green-500' :
                        integration.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-xs ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
