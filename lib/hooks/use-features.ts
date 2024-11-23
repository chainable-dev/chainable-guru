import { FEATURES, FeatureKey } from '@/lib/features';

export function useFeature(feature: FeatureKey) {
  return FEATURES[feature];
} 