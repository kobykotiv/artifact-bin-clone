// src/components/CollaborationWorkspace.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { UserAvatar } from './UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { CommentSystem } from './CommentSystem';
import { 
  Users, 
  MessageSquare, 
  Eye, 
  Edit3, 
  Clock, 
  Wifi, 
  WifiOff,
  Share,
  Crown,
  Settings
} from 'lucide-react';

interface CollaborationUser {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'editing';
  role: 'owner' | 'editor' | 'viewer';
  lastSeen: string;
  cursor?: { x: number; y: number };
}

interface CollaborationWorkspaceProps {
  artifactId: string;
  open: boolean;
  onClose: () => void;
}

export function CollaborationWorkspace({ artifactId, open, onClose }: CollaborationWorkspaceProps) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock real-time collaboration data
  useEffect(() => {
    if (open) {
      const mockUsers: CollaborationUser[] = [
        {
          id: 'user1',
          username: 'alice_dev',
          status: 'editing',
          role: 'owner',
          lastSeen: 'now',
          cursor: { x: 150, y: 200 }
        },
        {
          id: 'user2',
          username: 'bob_designer',
          status: 'online',
          role: 'editor',
          lastSeen: '2 minutes ago'
        },
        {
          id: 'user3',
          username: 'charlie_reviewer',
          status: 'online',
          role: 'viewer',
          lastSeen: '5 minutes ago'
        },
        {
          id: 'user4',
          username: 'david_pm',
          status: 'offline',
          role: 'viewer',
          lastSeen: '1 hour ago'
        }
      ];
      setUsers(mockUsers);

      // Simulate real-time updates
      const interval = setInterval(() => {
        setUsers(prev => prev.map(user => ({
          ...user,
          cursor: user.status === 'editing' ? {
            x: Math.random() * 300 + 50,
            y: Math.random() * 200 + 100
          } : user.cursor
        })));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'editing': return 'bg-blue-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3" />;
      case 'editor': return <Edit3 className="w-3 h-3" />;
      case 'viewer': return <Eye className="w-3 h-3" />;
      default: return null;
    }
  };

  const inviteUser = () => {
    const email = prompt('Enter email address to invite:');
    if (email) {
      // Mock invite
      alert(`Invitation sent to ${email}!`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaboration Workspace
                <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Disconnected
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowComments(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comments
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
            {/* Live Users Panel */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Active Users ({users.filter(u => u.status !== 'offline').length})</span>
                  <Button size="sm" variant="outline" onClick={inviteUser}>
                    <Share className="w-3 h-3 mr-1" />
                    Invite
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded border">
                    <div className="relative">
                      <UserAvatar username={user.username} />
                      <div 
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{user.username}</span>
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {user.lastSeen}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                    <UserAvatar username="alice_dev" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">alice_dev</span> started editing the component
                      </p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                    <UserAvatar username="bob_designer" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">bob_designer</span> added a comment
                      </p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                    <UserAvatar username="charlie_reviewer" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">charlie_reviewer</span> joined the workspace
                      </p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Cursors Visualization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Live Collaboration View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-32 bg-muted/20 rounded border-dashed border-2 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Code Editor Preview Area
                </div>
                {users
                  .filter(user => user.status === 'editing' && user.cursor)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="absolute pointer-events-none transition-all duration-500"
                      style={{
                        left: user.cursor!.x,
                        top: user.cursor!.y,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        {user.username}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      <CommentSystem 
        artifactId={artifactId}
        open={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collaboration Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Sharing & Permissions</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Allow public viewing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Allow comments from viewers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Require approval for new collaborators</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Email notifications for comments</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Real-time collaboration alerts</span>
                </label>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
