
import { cityToOblastMapping } from '@/data/cityOblastData';
import { OblastInfo } from '@/types/cityMapping';

/**
 * Find oblast information for a given city name
 */
export function findOblastForCity(cityName: string): OblastInfo | null {
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Direct lookup
  if (cityToOblastMapping[normalizedCity]) {
    return {
      oblastUA: cityToOblastMapping[normalizedCity].oblastUA,
      oblastEN: cityToOblastMapping[normalizedCity].oblastEN
    };
  }
  
  // Search in aliases
  for (const [cityKey, cityData] of Object.entries(cityToOblastMapping)) {
    if (cityData.aliases.some(alias => 
      alias.toLowerCase() === normalizedCity || 
      normalizedCity.includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(normalizedCity)
    )) {
      return {
        oblastUA: cityData.oblastUA,
        oblastEN: cityData.oblastEN
      };
    }
  }
  
  return null;
}
