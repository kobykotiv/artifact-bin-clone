// src/components/NotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Bell, 
  X, 
  Check, 
  Star, 
  MessageSquare, 
  GitFork, 
  Heart,
  Users,
  Code,
  Settings,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'fork' | 'collaboration' | 'mention' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');

  // Mock notifications for demo
  useEffect(() => {
    if (open) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          title: 'New Like',
          message: 'alice_dev liked your "React Calculator" artifact',
          timestamp: '2 minutes ago',
          isRead: false,
          actionUrl: '/artifact/demo-calculator'
        },
        {
          id: '2',
          type: 'comment',
          title: 'New Comment',
          message: 'bob_designer commented on "Game of Life": "Great implementation!"',
          timestamp: '5 minutes ago',
          isRead: false,
          actionUrl: '/artifact/demo-gol'
        },
        {
          id: '3',
          type: 'fork',
          title: 'Artifact Forked',
          message: 'charlie_dev forked your "Pong Game" artifact',
          timestamp: '10 minutes ago',
          isRead: true,
          actionUrl: '/artifact/demo-pong'
        },
        {
          id: '4',
          type: 'collaboration',
          title: 'Collaboration Invite',
          message: 'You were invited to collaborate on "Team Dashboard"',
          timestamp: '1 hour ago',
          isRead: false,
          actionUrl: '/collaborate/team-dashboard'
        },
        {
          id: '5',
          type: 'mention',
          title: 'You were mentioned',
          message: '@you mentioned in "React Best Practices" discussion',
          timestamp: '2 hours ago',
          isRead: false,
          actionUrl: '/discussion/react-best-practices'
        },
        {
          id: '6',
          type: 'system',
          title: 'System Update',
          message: 'New AI features are now available! Try the enhanced code completion.',
          timestamp: '1 day ago',
          isRead: true
        }
      ];
      setNotifications(mockNotifications);
    }
  }, [open]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'mentions':
        return notification.type === 'mention';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'fork': return <GitFork className="w-4 h-4 text-green-500" />;
      case 'collaboration': return <Users className="w-4 h-4 text-purple-500" />;
      case 'mention': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the relevant page
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'mentions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('mentions')}
          >
            Mentions ({notifications.filter(n => n.type === 'mention').length})
          </Button>
        </div>

        {/* Notifications list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications to show</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-6 text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark as read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Notification settings */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 text-sm">Notification Settings</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span>Push notifications</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span>Collaboration updates</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Marketing updates</span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for notification management
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show browser notification
    showNotification(notification.title, {
      body: notification.message,
      tag: notification.type
    });
  };

  return {
    notifications,
    addNotification,
    showNotification,
    permission
  };
}
