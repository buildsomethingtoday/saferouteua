
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
  
  // Get city data from our mapping
  const cityData = Object.entries(cityToOblastMapping).find(([key, data]) => 
    key === normalizedCity || data.aliases.some(alias => alias.toLowerCase() === normalizedCity)
  );
  
  if (cityData) {
    const [cityKey, data] = cityData;
    console.log('🏙️ Found city data:', { cityKey, oblastUA: data.oblastUA, oblastEN: data.oblastEN });
    
    // Check if alert location mentions any alias of the city
    if (data.aliases.some(alias => normalizedAlertLocation.includes(alias.toLowerCase()))) {
      console.log('✅ City alias match found');
      return true;
    }
    
    // ENHANCED: Check if alert is an oblast-level alert that covers this city
    const cityOblastUA = data.oblastUA.toLowerCase();
    const cityOblastEN = data.oblastEN.toLowerCase();
    
    // Check if the alert oblast matches the city's oblast
    if (normalizedAlertOblast.includes(cityOblastUA) || 
        normalizedAlertOblast.includes(cityOblastEN)) {
      console.log('✅ Oblast match found:', { alertOblast: normalizedAlertOblast, cityOblast: cityOblastUA });
      return true;
    }
    
    // Check if the alert location itself mentions the oblast
    if (normalizedAlertLocation.includes(cityOblastUA) || 
        normalizedAlertLocation.includes(cityOblastEN)) {
      console.log('✅ Oblast in location match found');
      return true;
    }
    
    // ENHANCED: Handle common oblast name variations
    if (cityOblastUA.includes('область') || cityOblastEN.includes('oblast')) {
      const oblastNameUA = cityOblastUA.replace(' область', '').trim();
      const oblastNameEN = cityOblastEN.replace(' oblast', '').trim();
      
      if (normalizedAlertOblast.includes(oblastNameUA) || 
          normalizedAlertOblast.includes(oblastNameEN) ||
          normalizedAlertLocation.includes(oblastNameUA) ||
          normalizedAlertLocation.includes(oblastNameEN)) {
        console.log('✅ Oblast name variation match found');
        return true;
      }
    }
  }
  
  // Special case handling for major cities
  if (normalizedCity === 'kyiv' && (normalizedAlertOblast.includes('київ') || normalizedAlertLocation.includes('київ'))) {
    console.log('✅ Kyiv special case match');
    return true;
  }
  
  if (normalizedCity === 'kharkiv' && (normalizedAlertOblast.includes('харків') || normalizedAlertLocation.includes('харків'))) {
    console.log('✅ Kharkiv special case match');
    return true;
  }
  
  if (normalizedCity === 'dnipro' && (normalizedAlertOblast.includes('дніпропетровськ') || normalizedAlertLocation.includes('дніпропетровськ'))) {
    console.log('✅ Dnipro special case match');
    return true;
  }
  
  console.log('❌ No match found');
  return false;
}
