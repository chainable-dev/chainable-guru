import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BetterTooltip } from '@/components/ui/tooltip';

interface WebSearchProps {
  onSearch: (query: string) => void;
}

export function WebSearch({ onSearch }: WebSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <BetterTooltip content="Web Search">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Web Search</span>
        </Button>
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 flex w-64">
            <Input
              type="text"
              placeholder="Enter search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow"
            />
            <Button onClick={handleSearch} className="ml-2">
              Search
            </Button>
          </div>
        )}
      </div>
    </BetterTooltip>
  );
} 