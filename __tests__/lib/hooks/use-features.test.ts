import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeature } from '@/lib/hooks/use-features';
import { FEATURES } from '@/lib/features';

describe('useFeature', () => {
  it('should return correct feature flag value for ATTACHMENTS', () => {
    const { result } = renderHook(() => useFeature('ATTACHMENTS'));
    expect(result.current).toBe(FEATURES.ATTACHMENTS);
  });

  it('should return correct feature flag value for WEB_SEARCH', () => {
    const { result } = renderHook(() => useFeature('WEB_SEARCH'));
    expect(result.current).toBe(FEATURES.WEB_SEARCH);
  });
}); 