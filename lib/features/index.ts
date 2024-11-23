import { useSettingsStore } from '@/lib/stores/settings-store'

export const FEATURES = {
  ATTACHMENTS: process.env.NEXT_PUBLIC_FEATURE_ATTACHMENTS === 'true',
  WEB_SEARCH: process.env.NEXT_PUBLIC_FEATURE_WEB_SEARCH === 'true',
} as const;

export type FeatureKey = keyof typeof FEATURES; 

export function useFeatures() {
  const { webSearch, attachments } = useSettingsStore()
  
  return {
    ATTACHMENTS: FEATURES.ATTACHMENTS && attachments,
    WEB_SEARCH: FEATURES.WEB_SEARCH && webSearch,
  }
} 