import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuthContext } from '@/lib/context/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  LayoutGrid, 
  FileText, 
  Settings, 
  Users, 
  Library, 
  Zap,
  HelpCircle,
  Search,
  Bell
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface GlobalNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onTemplateLibraryOpen?: () => void;
  onSettingsOpen?: () => void;
}

export function GlobalNavbar({ 
  currentPage = 'dashboard', 
  onNavigate,
  onTemplateLibraryOpen,
  onSettingsOpen 
}: GlobalNavbarProps) {
  const { authState } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Main workspace' },
    { id: 'gallery', label: 'Gallery', icon: LayoutGrid, description: 'Public artifacts' },
    { id: 'my-work', label: 'My Work', icon: FileText, description: 'Your artifacts' },
    { id: 'templates', label: 'Templates', icon: Library, description: 'Browse templates', onClick: onTemplateLibraryOpen },
    { id: 'community', label: 'Community', icon: Users, description: 'Connect with others' },
  ];

  const quickActions = [
    { label: 'AI Assistant', icon: Zap, onClick: () => {} },
    { label: 'Search', icon: Search, onClick: () => {} },
    { label: 'Help', icon: HelpCircle, onClick: () => {} },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block">ArtifactBin</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => item.onClick ? item.onClick() : onNavigate?.(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.id === 'templates' && (
                      <Badge variant="secondary" className="text-xs ml-1">NEW</Badge>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Actions - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-1">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.onClick}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <UserAvatar username={authState.user?.email || "Guest"} size={32} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {authState.user?.email || "Guest User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {authState.user?.role || "guest"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettingsOpen}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTemplateLibraryOpen}>
                  <Library className="mr-2 h-4 w-4" />
                  Template Library
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open('/docs', '_blank')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Documentation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => authState.logout?.()}
                  className="text-red-600 focus:text-red-600"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      item.onClick ? item.onClick() : onNavigate?.(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start flex items-center space-x-3 px-3 py-2 transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                    {item.id === 'templates' && (
                      <Badge variant="secondary" className="text-xs ml-auto">NEW</Badge>
                    )}
                  </Button>
                );
              })}
              
              {/* Mobile Quick Actions */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-3">Quick Actions</div>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        action.onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-gray-600 hover:text-gray-900"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
