
// Re-export all types and functions for backward compatibility
export type { CityOblastMap, OblastInfo } from '@/types/cityMapping';
export { cityToOblastMapping } from '@/data/cityOblastData';
export { findOblastForCity } from '@/utils/oblastFinder';
export { doesAlertMatchCity } from '@/utils/alertMatcher';
