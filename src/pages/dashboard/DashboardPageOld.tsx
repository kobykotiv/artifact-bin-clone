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

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [activities, setActivities] = useState<RecentActivity[]>(mockActivity);

  useEffect(() => {
    // Fetch real data from API
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/activity')
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(activityData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'upload': return Upload;
      case 'view': return Eye;
      case 'share': return Share;
      case 'create': return Plus;
      default: return Activity;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'upload': return 'bg-green-100 text-green-800';
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'share': return 'bg-purple-100 text-purple-800';
      case 'create': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artifacts</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArtifacts}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bins</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBins}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active collaborators
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Actions today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.path} to={action.path}>
                  <Button variant={action.variant} className="w-full justify-start">
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user && `by ${activity.user} • `}{activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
