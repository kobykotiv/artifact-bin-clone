import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Code, 
  User, 
  Tag, 
  Star,
  Heart,
  GitFork,
  SortAsc,
  SortDesc,
  Download,
  Save,
  Share2 // Import Share2 icon
} from 'lucide-react';
import { type ArtifactData } from '@/lib/services/db';

export interface SearchFilters {
  query: string;
  languages: string[];
  tags: string[];
  users: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  sortBy: 'created' | 'updated' | 'title' | 'likes' | 'stars' | 'forks';
  sortOrder: 'asc' | 'desc';
  isPublic?: boolean;
  minLikes?: number;
  minStars?: number;
  minForks?: number;
}

interface SavedSearch {
  name: string;
  filters: SearchFilters;
}

interface AdvancedSearchProps {
  artifacts: ArtifactData[];
  onResultsChange: (results: ArtifactData[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string; // Add initialQuery prop
}

export function AdvancedSearch({ 
  artifacts, 
  onResultsChange, 
  onFiltersChange,
  placeholder = "Search artifacts by title, content, or tags...",
  className,
  initialQuery = '' // Destructure and provide default value
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(() => {
    // Initialize filters from URL search params
    const params = new URLSearchParams(window.location.search);
    return {
      query: params.get('query') || initialQuery,
      languages: params.get('languages')?.split(',') || [],
      tags: params.get('tags')?.split(',') || [],
      users: params.get('users')?.split(',') || [],
      dateRange: {
        from: params.get('from') ? new Date(params.get('from')!) : undefined,
        to: params.get('to') ? new Date(params.get('to')!) : undefined,
      },
      sortBy: (params.get('sortBy') as SearchFilters['sortBy']) || 'updated',
      sortOrder: (params.get('sortOrder') as SearchFilters['sortOrder']) || 'desc',
      isPublic: params.has('isPublic') ? params.get('isPublic') === 'true' : undefined,
      minLikes: params.has('minLikes') ? Number(params.get('minLikes')) : undefined,
      minStars: params.has('minStars') ? Number(params.get('minStars')) : undefined,
      minForks: params.has('minForks') ? Number(params.get('minForks')) : undefined,
    };
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedSearches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.languages.length) params.set('languages', filters.languages.join(','));
    if (filters.tags.length) params.set('tags', filters.tags.join(','));
    if (filters.users.length) params.set('users', filters.users.join(','));
    if (filters.dateRange.from) params.set('from', filters.dateRange.from.toISOString());
    if (filters.dateRange.to) params.set('to', filters.dateRange.to.toISOString());
    if (filters.sortBy !== 'updated') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
    if (filters.isPublic !== undefined) params.set('isPublic', String(filters.isPublic));
    if (filters.minLikes) params.set('minLikes', String(filters.minLikes));
    if (filters.minStars) params.set('minStars', String(filters.minStars));
    if (filters.minForks) params.set('minForks', String(filters.minForks));
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }, [filters]);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const languages = [...new Set(artifacts.map(a => a.language).filter(Boolean))];
    const tags = [...new Set(artifacts.flatMap(a => a.tags || []))];
    const users = [...new Set(artifacts.map(a => a.userId).filter(Boolean))];
    
    return { languages, tags, users };
  }, [artifacts]);

  // Semantic search function
  const performSemanticSearch = useCallback((query: string, artifact: ArtifactData): number => {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return 1;

    const searchableText = [
      artifact.title || '',
      artifact.description || '',
      artifact.content || '',
      ...(artifact.tags || [])
    ].join(' ').toLowerCase();

    let score = 0;
    let matchCount = 0;

    searchTerms.forEach(term => {
      // Exact matches in title get highest score
      if ((artifact.title || '').toLowerCase().includes(term)) {
        score += 10;
        matchCount++;
      }
      // Exact matches in tags get high score
      else if ((artifact.tags || []).some(tag => tag.toLowerCase().includes(term))) {
        score += 8;
        matchCount++;
      }
      // Exact matches in description get medium score
      else if ((artifact.description || '').toLowerCase().includes(term)) {
        score += 5;
        matchCount++;
      }
      // Partial matches in content get lower score
      else if (searchableText.includes(term)) {
        score += 2;
        matchCount++;
      }
      // Fuzzy matching for typos (basic)
      else if (searchableText.includes(term.slice(0, -1)) && term.length > 3) {
        score += 1;
        matchCount++;
      }
    });

    // Boost score if most terms match
    if (matchCount === searchTerms.length) {
      score *= 1.5;
    }

    return score;
  }, []);

  // Filter and search artifacts
  const filteredArtifacts = useMemo(() => {
    let results = [...artifacts];

    // Apply basic filters
    if (filters.languages.length > 0) {
      results = results.filter(a => filters.languages.includes(a.language || ''));
    }

    if (filters.tags.length > 0) {
      results = results.filter(a => 
        filters.tags.some(tag => (a.tags || []).includes(tag))
      );
    }

    if (filters.users.length > 0) {
      results = results.filter(a => filters.users.includes(a.userId || ''));
    }

    if (filters.isPublic !== undefined) {
      results = results.filter(a => Boolean(a.isPublic) === filters.isPublic);
    }

    if (filters.minLikes !== undefined) {
      results = results.filter(a => (a.likes || 0) >= filters.minLikes!);
    }

    if (filters.minStars !== undefined) {
      results = results.filter(a => (a.stars || 0) >= filters.minStars!);
    }

    if (filters.minForks !== undefined) {
      results = results.filter(a => (a.forks || 0) >= filters.minForks!);
    }

    // Date range filtering
    if (filters.dateRange.from || filters.dateRange.to) {
      results = results.filter(a => {
        const date = new Date(a.updatedAt || a.createdAt || '');
        const from = filters.dateRange.from;
        const to = filters.dateRange.to;
        
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      });
    }

    // Search query
    if (filters.query.trim()) {
      const scored = results.map(artifact => ({
        artifact,
        score: performSemanticSearch(filters.query, artifact)
      })).filter(item => item.score > 0);

      scored.sort((a, b) => b.score - a.score);
      results = scored.map(item => item.artifact);
    } else {
      // Sort when no search query
      results.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (filters.sortBy) {
          case 'title':
            aVal = (a.title || '').toLowerCase();
            bVal = (b.title || '').toLowerCase();
            break;
          case 'created':
            aVal = new Date(a.createdAt || '');
            bVal = new Date(b.createdAt || '');
            break;
          case 'updated':
            aVal = new Date(a.updatedAt || a.createdAt || '');
            bVal = new Date(b.updatedAt || b.createdAt || '');
            break;
          case 'likes':
            aVal = a.likes || 0;
            bVal = b.likes || 0;
            break;
          case 'stars':
            aVal = a.stars || 0;
            bVal = b.stars || 0;
            break;
          case 'forks':
            aVal = a.forks || 0;
            bVal = b.forks || 0;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
    }

    return results;
  }, [artifacts, filters, performSemanticSearch]);

  // Update results when filtered artifacts change
  React.useEffect(() => {
    onResultsChange(filteredArtifacts);
    onFiltersChange?.(filters);
  }, [filteredArtifacts, filters, onResultsChange, onFiltersChange]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleSearch = (query: string) => {
    updateFilters({ query });
    
    // Save to recent searches
    if (query.trim() && !recentSearches.includes(query)) {
      const newRecent = [query, ...recentSearches.slice(0, 9)];
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      languages: [],
      tags: [],
      users: [],
      dateRange: {},
      sortBy: 'updated',
      sortOrder: 'desc',
      isPublic: undefined,
      minLikes: undefined,
      minStars: undefined,
      minForks: undefined,
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredArtifacts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "artifacts.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSaveSearch = () => {
    const name = prompt("Enter a name for this search:");
    if (name && name.trim()) {
      const newSearch = { name, filters };
      const updatedSearches = [...savedSearches, newSearch];
      setSavedSearches(updatedSearches);
      localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    }
  };

  const handleShareSearch = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // You might want to show a toast notification here
      alert('Search URL copied to clipboard!');
    });
  };

  const handleDeleteSearch = (index: number) => {
    const updatedSearches = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
  };

  const hasActiveFilters = filters.languages.length > 0 || 
    filters.tags.length > 0 || 
    filters.users.length > 0 ||
    filters.isPublic !== undefined ||
    filters.minLikes !== undefined ||
    filters.minStars !== undefined ||
    filters.minForks !== undefined ||
    filters.dateRange.from ||
    filters.dateRange.to;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className="pl-9 pr-4"
            />
          </div>
          <Button
            variant={showAdvanced ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.values(filters).flat().filter(Boolean).length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} title="Clear filters">
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSaveSearch} title="Save search">
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShareSearch} title="Share search">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Recent searches */}
        {!filters.query && recentSearches.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-muted-foreground mr-2">Recent:</span>
            {recentSearches.slice(0, 5).map((search, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={() => handleSearch(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        )}

        {/* Saved searches */}
        {savedSearches.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-muted-foreground mr-2">Saved:</span>
            {savedSearches.map((search, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer text-xs group relative"
                onClick={() => setFilters(search.filters)}
              >
                {search.name}
                <X 
                  className="h-3 w-3 ml-2 cursor-pointer opacity-50 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSearch(i);
                  }}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      {showAdvanced && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Languages */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                Languages
              </Label>
              <Select
                value=""
                onValueChange={(lang) => {
                  if (!filters.languages.includes(lang)) {
                    updateFilters({ languages: [...filters.languages, lang] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add language" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.languages.map(lang => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => updateFilters({ 
                        languages: filters.languages.filter(l => l !== lang) 
                      })}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <Select
                value=""
                onValueChange={(tag) => {
                  if (!filters.tags.includes(tag)) {
                    updateFilters({ tags: [...filters.tags, tag] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add tag" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.tags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => updateFilters({ 
                        tags: filters.tags.filter(t => t !== tag) 
                      })}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Sort
              </Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="likes">Likes</SelectItem>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="forks">Forks</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                From Date
              </Label>
              <Input
                type="date"
                value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, from: e.target.value ? new Date(e.target.value) : undefined }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                To Date
              </Label>
              <Input
                type="date"
                value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, to: e.target.value ? new Date(e.target.value) : undefined }
                })}
              />
            </div>
          </div>

          <Separator />

          {/* Advanced numeric filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Min Likes
              </Label>
              <Input
                type="number"
                min="0"
                value={filters.minLikes || ''}
                onChange={(e) => updateFilters({ 
                  minLikes: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Min Stars
              </Label>
              <Input
                type="number"
                min="0"
                value={filters.minStars || ''}
                onChange={(e) => updateFilters({ 
                  minStars: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <GitFork className="h-4 w-4" />
                Min Forks
              </Label>
              <Input
                type="number"
                min="0"
                value={filters.minForks || ''}
                onChange={(e) => updateFilters({ 
                  minForks: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Public/Private filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public-only"
              checked={filters.isPublic === true}
              onCheckedChange={(checked) => updateFilters({ 
                isPublic: checked ? true : undefined 
              })}
            />
            <Label htmlFor="public-only" className="text-sm">Public artifacts only</Label>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredArtifacts.length} of {artifacts.length} artifacts
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
