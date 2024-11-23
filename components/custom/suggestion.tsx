'use client';

import { useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/button';

type UISuggestion = {
  id: string;
  title: string;
  description: string;
  code?: string;
  diff?: string;
};

export const Suggestion = ({
  suggestion,
  onApply,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width } = useWindowSize();

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border bg-background/95">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 mt-1 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">{suggestion.title}</h3>
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <X className="h-4 w-4" /> : 'View'}
          </Button>
          <Button size="sm" onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
      {isExpanded && suggestion.code && (
        <pre className="p-4 rounded bg-muted font-mono text-sm overflow-x-auto">
          <code>{suggestion.code}</code>
        </pre>
      )}
    </div>
  );
};
