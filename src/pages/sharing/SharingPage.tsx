import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Share2, 
  Users, 
  Link, 
  Mail, 
  Copy, 
  Eye, 
  Edit, 
  Trash2,
  Globe,
  Lock,
  UserPlus,
  QrCode,
  Download,
  Settings
} from 'lucide-react';

interface SharedCollection {
  id: string;
  name: string;
  description?: string;
  artifactCount: number;
  sharedWith: Array<{
    id: string;
    email: string;
    role: 'viewer' | 'editor' | 'admin';
    joinedAt: string;
  }>;
  visibility: 'public' | 'private' | 'link';
  shareLink?: string;
  createdAt: string;
  owner: {
    id: string;
    email: string;
  };
}

const mockCollections: SharedCollection[] = [
  {
    id: '1',
    name: 'React Components Library',
    description: 'Reusable UI components for React applications',
    artifactCount: 24,
    sharedWith: [
      { id: '1', email: 'alice@example.com', role: 'editor', joinedAt: '2024-01-15' },
      { id: '2', email: 'bob@example.com', role: 'viewer', joinedAt: '2024-01-18' },
    ],
    visibility: 'private',
    shareLink: 'https://artifact-bin.com/share/abc123',
    createdAt: '2024-01-10',
    owner: { id: 'user1', email: 'owner@example.com' }
  },
  {
    id: '2',
    name: 'API Documentation',
    description: 'Complete API reference and examples',
    artifactCount: 12,
    sharedWith: [
      { id: '3', email: 'charlie@example.com', role: 'viewer', joinedAt: '2024-01-20' },
    ],
    visibility: 'public',
    createdAt: '2024-01-12',
    owner: { id: 'user1', email: 'owner@example.com' }
  }
];

export function SharingPage() {
  const [collections, setCollections] = useState<SharedCollection[]>(mockCollections);
  const [activeTab, setActiveTab] = useState('owned');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<SharedCollection | null>(null);
  const [shareForm, setShareForm] = useState({
    emails: '',
    role: 'viewer' as 'viewer' | 'editor' | 'admin',
    message: ''
  });

  useEffect(() => {
    fetchSharedCollections();
  }, []);

  const fetchSharedCollections = async () => {
    try {
      const response = await fetch('/api/sharing/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections([...data.owned, ...data.shared]);
      }
    } catch (error) {
      console.error('Failed to fetch shared collections:', error);
    }
  };

  const handleShare = async (collectionId: string) => {
    try {
      const emails = shareForm.emails.split(',').map(e => e.trim()).filter(Boolean);
      const response = await fetch(`/api/artifacts/${collectionId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          role: shareForm.role,
          message: shareForm.message
        })
      });

      if (response.ok) {
        setShowShareDialog(false);
        setShareForm({ emails: '', role: 'viewer', message: '' });
        fetchSharedCollections(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to share collection:', error);
    }
  };

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // Show toast notification
  };

  const generateQRCode = (link: string) => {
    // Generate QR code for the share link
    console.log('Generate QR code for:', link);
  };

  const getVisibilityIcon = (visibility: SharedCollection['visibility']) => {
    switch (visibility) {
      case 'public': return Globe;
      case 'private': return Lock;
      case 'link': return Link;
    }
  };

  const getVisibilityColor = (visibility: SharedCollection['visibility']) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      case 'link': return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-orange-100 text-orange-800';
      case 'viewer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sharing</h1>
          <p className="text-muted-foreground">Manage shared collections and collaborate with others</p>
        </div>
        <Button onClick={() => setShowShareDialog(true)}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Collection
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="owned">
            <Users className="mr-2 h-4 w-4" />
            My Shared Collections
          </TabsTrigger>
          <TabsTrigger value="shared">
            <Share2 className="mr-2 h-4 w-4" />
            Shared with Me
          </TabsTrigger>
          <TabsTrigger value="public">
            <Globe className="mr-2 h-4 w-4" />
            Public Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owned" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {collections.filter(c => c.owner.id === 'user1').map((collection) => {
              const VisibilityIcon = getVisibilityIcon(collection.visibility);
              
              return (
                <Card key={collection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <Badge className={`text-xs ${getVisibilityColor(collection.visibility)}`}>
                          <VisibilityIcon className="mr-1 h-3 w-3" />
                          {collection.visibility}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedCollection(collection);
                            setShowShareDialog(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {collection.description && (
                      <CardDescription>{collection.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{collection.artifactCount} artifacts</span>
                      <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                    </div>

                    {collection.shareLink && (
                      <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                        <Link className="h-4 w-4 text-muted-foreground" />
                        <code className="flex-1 text-sm">{collection.shareLink}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyShareLink(collection.shareLink!)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => generateQRCode(collection.shareLink!)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Shared with {collection.sharedWith.length} people</span>
                      </div>
                      
                      <div className="space-y-2">
                        {collection.sharedWith.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{user.email}</span>
                              <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                                {user.role}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                Joined {new Date(user.joinedAt).toLocaleDateString()}
                              </span>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.filter(c => c.owner.id !== 'user1').map((collection) => {
              const VisibilityIcon = getVisibilityIcon(collection.visibility);
              const userRole = collection.sharedWith.find(u => u.id === 'current-user')?.role || 'viewer';
              
              return (
                <Card key={collection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <Badge className={`text-xs ${getRoleColor(userRole)}`}>
                        {userRole}
                      </Badge>
                    </div>
                    {collection.description && (
                      <CardDescription>{collection.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{collection.artifactCount} artifacts</span>
                      <div className="flex items-center space-x-1">
                        <VisibilityIcon className="h-3 w-3" />
                        <span>{collection.visibility}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {collection.owner.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>Owned by {collection.owner.email}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {userRole === 'editor' || userRole === 'admin' ? (
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Public Collections</h3>
            <p className="text-muted-foreground">
              Discover publicly shared artifact collections from the community
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Collection</DialogTitle>
            <DialogDescription>
              Invite people to collaborate on your collection
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="emails">Email addresses</Label>
              <Input
                id="emails"
                value={shareForm.emails}
                onChange={(e) => setShareForm({ ...shareForm, emails: e.target.value })}
                placeholder="Enter email addresses separated by commas"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={shareForm.role} onValueChange={(value: any) => setShareForm({ ...shareForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view artifacts</SelectItem>
                  <SelectItem value="editor">Editor - Can view and edit artifacts</SelectItem>
                  <SelectItem value="admin">Admin - Full access including sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Input
                id="message"
                value={shareForm.message}
                onChange={(e) => setShareForm({ ...shareForm, message: e.target.value })}
                placeholder="Add a personal message"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => selectedCollection && handleShare(selectedCollection.id)}
                className="flex-1"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Invitations
              </Button>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SharingPage;
