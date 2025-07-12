import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Filter } from 'lucide-react';
import { AdvancedSearch, type SearchFilters } from './AdvancedSearch'; // Import AdvancedSearch
import { type ArtifactData } from '@/lib/services/db'; // Assuming ArtifactData is defined here or in a shared types file

interface SearchAndFilterProps {
  artifacts: ArtifactData[]; // Full list of artifacts
  onResultsChange: (results: ArtifactData[]) => void; // Callback for filtered results
  placeholder?: string;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  artifacts,
  onResultsChange,
  placeholder = 'Search artifacts...',
}) => {
  const [basicSearchQuery, setBasicSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Note: Debouncing for basicSearchQuery will now be handled within AdvancedSearch

  return (
    <div className="flex flex-col gap-3 w-full py-2 px-1">
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Input
            value={basicSearchQuery}
            onChange={e => setBasicSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
            aria-label="Search"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          variant={showAdvancedFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          title="Advanced filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showAdvancedFilters && (
        <AdvancedSearch 
          artifacts={artifacts}
          onResultsChange={onResultsChange}
          initialQuery={basicSearchQuery} // Pass basic query to AdvancedSearch
        />
      )}

      {/* Removed: Tag, Language, and Sort filters are now handled by AdvancedSearch */}
      {/* Removed: Display of selected tags/languages as badges */}
    </div>
  );
};
