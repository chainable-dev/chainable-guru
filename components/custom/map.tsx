'use client';

import { useMemo } from 'react';
import { SuggestionComponent } from './suggestion';
import type { Suggestion } from '@/lib/schemas/suggestions';

interface MapLocation {
  latitude: number;
  longitude: number;
  name: string;
  type: 'standard' | 'topographical' | 'satellite';
}

interface MapProps {
  location?: MapLocation;
  onSuggestionApply?: (text: string) => void;
}

export const Map = ({ location, onSuggestionApply }: MapProps) => {
  const mapSuggestions: Suggestion[] = useMemo(() => [
    {
      id: `map-view-${Date.now()}`,
      document_id: 'map',
      document_created_at: new Date().toISOString(),
      original_text: '',
      suggested_text: 'Switch to satellite view',
      description: 'Change map type',
      user_id: '',
      is_resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `map-nearby-${Date.now()}`,
      document_id: 'map',
      document_created_at: new Date().toISOString(),
      original_text: '',
      suggested_text: 'Show nearby restaurants',
      description: 'Find places',
      user_id: '',
      is_resolved: false,
      created_at: new Date().toISOString(),
    }
  ], []);

  if (!location) {
    return (
      <div className="w-full max-w-[400px] h-[300px] rounded-xl bg-muted animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <div className="w-full max-w-[400px] bg-blue-500/10 rounded-xl p-4">
        <div className="h-[300px] rounded-lg bg-muted">
          Map View: {location?.name} ({location?.latitude}, {location?.longitude})
        </div>
      </div>

      <div className="absolute -right-8 flex flex-col gap-2">
        {mapSuggestions.map((suggestion) => (
          <SuggestionComponent
            key={suggestion.id}
            chatId="map"
            suggestion={suggestion}
            onApply={() => {
              onSuggestionApply?.(suggestion.suggested_text);
            }}
          />
        ))}
      </div>
    </div>
  );
}; 