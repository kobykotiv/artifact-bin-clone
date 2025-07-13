import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  Download, 
  Share2, 
  Code, 
  FileText, 
  Image, 
  Archive,
  Grid,
  List,
  Filter
} from 'lucide-react';

interface Artifact {
  id: string;
  name: string;
  type: 'code' | 'document' | 'image' | 'template' | 'archive';
  description?: string;
  content?: string;
  url?: string;
  size: number;
  createdAt: string;
  author: string;
  tags: string[];
  downloads: number;
  bin?: string;
}

const mockArtifacts: Artifact[] = [
  {
    id: '1',
    name: 'React Button Component',
    type: 'code',
    description: 'Reusable button component with variants',
    size: 2048,
    createdAt: '2024-01-20',
    author: 'John Doe',
    tags: ['react', 'component', 'ui'],
    downloads: 45,
    bin: 'frontend'
  },
  {
    id: '2',
    name: 'API Documentation',
    type: 'document',
    description: 'Complete REST API documentation',
    size: 15360,
    createdAt: '2024-01-18',
    author: 'Jane Smith',
    tags: ['api', 'docs', 'rest'],
    downloads: 23,
    bin: 'docs'
  },
  // Add more mock data...
];

export function ViewerPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>(mockArtifacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('recent');

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || artifact.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const sortedArtifacts = [...filteredArtifacts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'downloads':
        return b.downloads - a.downloads;
      case 'size':
        return b.size - a.size;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getTypeIcon = (type: Artifact['type']) => {
    switch (type) {
      case 'code': return Code;
      case 'document': return FileText;
      case 'image': return Image;
      case 'archive': return Archive;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Viewer</h1>
          <p className="text-muted-foreground">Browse and explore artifacts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artifacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="archive">Archive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="downloads">Most Downloaded</SelectItem>
            <SelectItem value="size">File Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedArtifacts.length} artifact{sortedArtifacts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Artifacts Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArtifacts.map((artifact) => {
            const TypeIcon = getTypeIcon(artifact.type);
            
            return (
              <Card key={artifact.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg truncate">{artifact.name}</CardTitle>
                  </div>
                  {artifact.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {artifact.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {artifact.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {artifact.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{artifact.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(artifact.size)}</span>
                    <span>{artifact.downloads} downloads</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {artifact.author}</span>
                    <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedArtifacts.map((artifact) => {
            const TypeIcon = getTypeIcon(artifact.type);
            
            return (
              <Card key={artifact.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{artifact.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {artifact.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {artifact.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{formatFileSize(artifact.size)}</div>
                        <div>{artifact.downloads} downloads</div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {sortedArtifacts.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No artifacts found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'No artifacts available to view'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ViewerPage;
