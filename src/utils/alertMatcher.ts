
import { cityToOblastMapping } from '@/data/cityOblastData';

/**
 * Enhanced function to check if an alert location matches a city
 */
export function doesAlertMatchCity(alertLocation: string, alertOblast: string, cityName: string): boolean {
  console.log('🔍 Checking alert match:', { alertLocation, alertOblast, cityName });
  
  const normalizedAlertLocation = alertLocation.toLowerCase().trim();
  const normalizedAlertOblast = alertOblast.toLowerCase().trim();
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Special handling for "м. Київ м. Київ" format
  if (normalizedAlertLocation.includes('м. київ') && normalizedCity === 'kyiv') {
    console.log('✅ Special Kyiv match found');
    return true;
  }
  
  // Check if alert location directly mentions the city
  if (normalizedAlertLocation.includes(normalizedCity)) {
    console.log('✅ Direct city name match');
    return true;
  }
  
  // Check city aliases
  const cityData = Object.entries(cityToOblastMapping).find(([key, data]) => 
    key === normalizedCity || data.aliases.some(alias => alias.toLowerCase() === normalizedCity)
  );
  
  if (cityData) {
    const [cityKey, data] = cityData;
    
    // Check if alert location mentions any alias of the city
    if (data.aliases.some(alias => normalizedAlertLocation.includes(alias.toLowerCase()))) {
      console.log('✅ City alias match found');
      return true;
    }
    
    // Check if alert is in the same oblast as the city
    if (normalizedAlertOblast.includes(data.oblastUA.toLowerCase()) || 
        normalizedAlertOblast.includes(data.oblastEN.toLowerCase())) {
      console.log('✅ Oblast match found');
      return true;
    }
  }
  
  // Special case for major cities by oblast matching
  if (normalizedCity === 'kyiv' && normalizedAlertOblast.includes('київ')) {
    console.log('✅ Kyiv oblast match');
    return true;
  }
  
  if (normalizedCity === 'dnipro' && normalizedAlertOblast.includes('дніпропетровськ')) {
    console.log('✅ Dnipro oblast match');
    return true;
  }
  
  console.log('❌ No match found');
  return false;
}
