import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Archive, 
  Upload, 
  Eye, 
  Search, 
  Share, 
  Plug, 
  BarChart3, 
  Users, 
  Settings, 
  FlaskConical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, description: 'Overview and quick actions' },
  { path: '/bins', label: 'Bins', icon: Archive, description: 'Manage artifact collections' },
  { path: '/upload', label: 'Upload', icon: Upload, description: 'Add new artifacts' },
  { path: '/viewer', label: 'Viewer', icon: Eye, description: 'Browse and view artifacts' },
  { path: '/search', label: 'Search', icon: Search, description: 'Find specific artifacts' },
  { path: '/sharing', label: 'Sharing', icon: Share, description: 'Share and collaborate' },
  { path: '/integrations', label: 'Integrations', icon: Plug, description: 'Connect external services', badge: 'New' },
  { path: '/metrics', label: 'Metrics', icon: BarChart3, description: 'Analytics and insights' },
  { path: '/users', label: 'Users', icon: Users, description: 'User management' },
  { path: '/settings', label: 'Settings', icon: Settings, description: 'App configuration' },
  { path: '/labs', label: 'Labs', icon: FlaskConical, description: 'Experimental features', badge: 'Beta' },
];

interface NavigationProps {
  variant?: 'sidebar' | 'horizontal';
  collapsed?: boolean;
}

export function Navigation({ variant = 'sidebar', collapsed = false }: NavigationProps) {
  const location = useLocation();

  if (variant === 'horizontal') {
    return (
      <nav className="flex space-x-1 p-2 bg-background border-b">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={`flex flex-col space-y-1 p-2 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200`}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link key={item.path} to={item.path}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={`w-full justify-start ${collapsed ? 'px-2' : 'px-3'}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && (
                <>
                  <span className="ml-2">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

export default Navigation;
