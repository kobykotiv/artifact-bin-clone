import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Archive, 
  MoreHorizontal, 
  Folder, 
  FolderOpen,
  Edit,
  Trash2,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Bin {
  id: string;
  name: string;
  description?: string;
  artifactCount: number;
  visibility: 'public' | 'private' | 'team';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  collaborators?: number;
}

const mockBins: Bin[] = [
  {
    id: '1',
    name: 'Frontend Components',
    description: 'Reusable React components for the main application',
    artifactCount: 24,
    visibility: 'team',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    tags: ['react', 'components', 'ui'],
    collaborators: 3
  },
  {
    id: '2',
    name: 'API Templates',
    description: 'REST API endpoint templates and schemas',
    artifactCount: 18,
    visibility: 'private',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    tags: ['api', 'backend', 'templates'],
    collaborators: 1
  },
  {
    id: '3',
    name: 'Documentation',
    description: 'Project documentation and guides',
    artifactCount: 12,
    visibility: 'public',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
    tags: ['docs', 'guides', 'help'],
    collaborators: 5
  },
];

export function BinsPage() {
  const [bins, setBins] = useState<Bin[]>(mockBins);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    description: '',
    visibility: 'private' as const,
    tags: ''
  });

  const filteredBins = bins.filter(bin =>
    bin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bin.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateBin = async () => {
    const bin: Bin = {
      id: Date.now().toString(),
      name: newBin.name,
      description: newBin.description,
      artifactCount: 0,
      visibility: newBin.visibility,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      tags: newBin.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      collaborators: 1
    };

    try {
      const response = await fetch('/api/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bin)
      });

      if (response.ok) {
        setBins([...bins, bin]);
        setNewBin({ name: '', description: '', visibility: 'private', tags: '' });
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Failed to create bin:', error);
    }
  };

  const getVisibilityIcon = (visibility: Bin['visibility']) => {
    switch (visibility) {
      case 'public': return Globe;
      case 'team': return Users;
      case 'private': return Lock;
    }
  };

  const getVisibilityColor = (visibility: Bin['visibility']) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bins</h1>
          <p className="text-muted-foreground">Organize your artifacts into collections</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Bin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bin</DialogTitle>
              <DialogDescription>
                Create a new bin to organize your artifacts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newBin.name}
                  onChange={(e) => setNewBin({ ...newBin, name: e.target.value })}
                  placeholder="Enter bin name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBin.description}
                  onChange={(e) => setNewBin({ ...newBin, description: e.target.value })}
                  placeholder="Describe this bin"
                />
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={newBin.visibility} onValueChange={(value: any) => setNewBin({ ...newBin, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newBin.tags}
                  onChange={(e) => setNewBin({ ...newBin, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <Button onClick={handleCreateBin} className="w-full">
                Create Bin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBins.map((bin) => {
          const VisibilityIcon = getVisibilityIcon(bin.visibility);
          
          return (
            <Card key={bin.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{bin.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                {bin.description && (
                  <CardDescription>{bin.description}</CardDescription>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{bin.artifactCount} artifacts</span>
                  <span>{bin.collaborators} collaborators</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {bin.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {bin.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{bin.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Badge className={`text-xs ${getVisibilityColor(bin.visibility)}`}>
                    <VisibilityIcon className="mr-1 h-3 w-3" />
                    {bin.visibility}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated {new Date(bin.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBins.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No bins found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first bin to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Bin
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default BinsPage;
