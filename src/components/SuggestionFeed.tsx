import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus } from 'lucide-react';
import { generateBatch } from '@/lib/utils/promptGenerator';

interface SuggestionFeedProps {
  onSuggestionSelect: (suggestion: string) => void;
}

export function SuggestionFeed({ onSuggestionSelect }: SuggestionFeedProps) {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string }>>([]);

  const addMoreSuggestions = useCallback(() => {
    const newSuggestions = generateBatch(5).map(text => ({
      id: crypto.randomUUID(),
      text
    }));
    setSuggestions(prev => [...prev, ...newSuggestions]);
  }, []);

  // Initialize feed
  useEffect(() => {
    addMoreSuggestions();
  }, [addMoreSuggestions]);

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      addMoreSuggestions();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow" onScroll={handleScroll}>
        <div className="p-4 space-y-3">
          {suggestions.map(({ id, text }) => (
            <div
              key={id}
              className="group border rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm leading-relaxed">{text}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onSuggestionSelect(text)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Use this idea
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={addMoreSuggestions}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          More Ideas
        </Button>
      </div>
    </div>
  );
}
