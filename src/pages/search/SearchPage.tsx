import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  User,
  Tag,
  FileText,
  Code,
  Image,
  Archive,
  Eye,
  Download,
  Share2
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'code' | 'document' | 'image' | 'template' | 'archive';
  description?: string;
  content?: string;
  author: string;
  createdAt: string;
  tags: string[];
  downloads: number;
  views: number;
  bin?: string;
  relevanceScore: number;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'React Authentication Hook',
    type: 'code',
    description: 'Custom hook for handling user authentication with JWT',
    author: 'John Doe',
    createdAt: '2024-01-20',
    tags: ['react', 'auth', 'hooks', 'jwt'],
    downloads: 89,
    views: 234,
    bin: 'frontend',
    relevanceScore: 0.95
  },
  {
    id: '2',
    title: 'API Design Guidelines',
    type: 'document',
    description: 'Best practices for designing RESTful APIs',
    author: 'Jane Smith',
    createdAt: '2024-01-18',
    tags: ['api', 'rest', 'guidelines', 'backend'],
    downloads: 45,
    views: 156,
    bin: 'docs',
    relevanceScore: 0.87
  },
  // Add more mock results...
];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    author: '',
    dateRange: '30d',
    tags: '',
    bin: 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const searchTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'code', label: 'Code', icon: Code },
    { value: 'document', label: 'Documents', icon: FileText },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'template', label: 'Templates', icon: Archive },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'downloads', label: 'Downloads' },
    { value: 'views', label: 'Views' },
    { value: 'title', label: 'Title' },
  ];

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, filters, sortBy, sortOrder]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        q: query,
        type: filters.type,
        author: filters.author,
        dateRange: filters.dateRange,
        tags: filters.tags,
        bin: filters.bin,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/search?${searchParams}`);
      if (response.ok) {
        const searchResults = await response.json();
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Use mock data for demonstration
      setResults(mockResults.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase()) ||
        r.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ));
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'code': return Code;
      case 'document': return FileText;
      case 'image': return Image;
      default: return Archive;
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
        part
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find artifacts across your workspace</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artifacts, content, tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 text-lg py-3"
        />
      </div>

      {/* Filters and Sort */}
      <Tabs defaultValue="filters" className="w-full">
        <TabsList>
          <TabsTrigger value="filters">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="advanced">Advanced Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="filters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {searchTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Author"
              value={filters.author}
              onChange={(e) => setFilters({...filters, author: e.target.value})}
            />

            <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Tags (comma-separated)"
              value={filters.tags}
              onChange={(e) => setFilters({...filters, tags: e.target.value})}
            />

            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>Use advanced operators to refine your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Content contains:</label>
                  <Input placeholder="Search within content" />
                </div>
                <div>
                  <label className="text-sm font-medium">File name:</label>
                  <Input placeholder="Exact file name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Language:</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Programming language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Size range:</label>
                  <div className="flex space-x-2">
                    <Input placeholder="Min (KB)" type="number" />
                    <Input placeholder="Max (KB)" type="number" />
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Search operators:</p>
                <ul className="space-y-1">
                  <li><code className="bg-muted px-1 rounded">title:"exact title"</code> - Search exact title</li>
                  <li><code className="bg-muted px-1 rounded">author:username</code> - Filter by author</li>
                  <li><code className="bg-muted px-1 rounded">tag:react</code> - Filter by tag</li>
                  <li><code className="bg-muted px-1 rounded">type:code</code> - Filter by type</li>
                  <li><code className="bg-muted px-1 rounded">created:>2024-01-01</code> - Date range</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {!loading && query && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>

          <div className="space-y-3">
            {results.map((result) => {
              const TypeIcon = getTypeIcon(result.type);
              
              return (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <TypeIcon className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg">
                            {highlightText(result.title, query)}
                          </h3>
                          {result.description && (
                            <p className="text-muted-foreground mt-1">
                              {highlightText(result.description, query)}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {result.author}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(result.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {result.views} views
                            </span>
                            <span className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              {result.downloads} downloads
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.slice(0, 5).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {highlightText(tag, query)}
                              </Badge>
                            ))}
                            {result.tags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.tags.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Suggestions:</p>
            <ul className="mt-2 space-y-1">
              <li>• Check for typos in your search query</li>
              <li>• Try broader search terms</li>
              <li>• Remove some filters</li>
              <li>• Search for tags or authors</li>
            </ul>
          </div>
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Start searching</h3>
          <p className="text-muted-foreground">
            Enter a search term to find artifacts, code, and documents
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
