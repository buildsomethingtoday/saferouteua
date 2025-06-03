
import { cityToOblastMapping } from '@/data/cityOblastData';

/**
 * Enhanced function to check if an alert location matches a city
 */
export function doesAlertMatchCity(alertLocation: string, alertOblast: string, cityName: string): boolean {
  console.log('🔍 AlertMatcher - Checking match:', { 
    alertLocation, 
    alertOblast, 
    cityName,
    alertLocationLower: alertLocation.toLowerCase(),
    alertOblastLower: alertOblast.toLowerCase(),
    cityNameLower: cityName.toLowerCase()
  });
  
  const normalizedAlertLocation = alertLocation.toLowerCase().trim();
  const normalizedAlertOblast = alertOblast.toLowerCase().trim();
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Step 1: Direct city name matching (highest priority)
  if (normalizedAlertLocation.includes(normalizedCity)) {
    console.log('✅ Direct city name match found');
    return true;
  }
  
  // Step 2: Check if city name is in alert location with Ukrainian variations
  const cityVariations = [
    normalizedCity,
    normalizedCity.replace('kyiv', 'київ'),
    normalizedCity.replace('kiev', 'київ'),
    normalizedCity.replace('dnipro', 'дніпро'),
    normalizedCity.replace('kharkiv', 'харків'),
    normalizedCity.replace('lviv', 'львів'),
    normalizedCity.replace('odesa', 'одеса'),
    normalizedCity.replace('odessa', 'одеса'),
    normalizedCity.replace('zaporizhzhia', 'запоріжжя'),
    normalizedCity.replace('poltava', 'полтава'),
    normalizedCity.replace('sumy', 'суми'),
    normalizedCity.replace('chernihiv', 'чернігів')
  ];
  
  // Special handling for Odesa/Odessa variations
  if (normalizedCity === 'odesa' || normalizedCity === 'odessa') {
    cityVariations.push('одеса', 'одесса', 'м. одеса', 'м. одесса');
    console.log('🏙️ Added Odesa variations:', cityVariations);
  }
  
  for (const variation of cityVariations) {
    if (normalizedAlertLocation.includes(variation)) {
      console.log('✅ City variation match found:', variation);
      return true;
    }
  }
  
  // Step 3: Oblast-level matching for major cities
  const cityOblastKeywords = {
    'kyiv': ['київська область', 'kyivska oblast', 'київська', 'kyivska', 'м. київ', 'kyiv'],
    'dnipro': ['дніпропетровська область', 'dnipropetrovska oblast', 'дніпропетровська', 'dnipropetrovska'],
    'kharkiv': ['харківська область', 'kharkivska oblast', 'харківська', 'kharkivska'],
    'odesa': ['одеська область', 'odeska oblast', 'одеська', 'odeska', 'одесская область'],
    'odessa': ['одеська область', 'odeska oblast', 'одеська', 'odeska', 'одесская область'],
    'lviv': ['львівська область', 'lvivska oblast', 'львівська', 'lvivska'],
    'zaporizhzhia': ['запорізька область', 'zaporizka oblast', 'запорізька', 'zaporizka'],
    'poltava': ['полтавська область', 'poltavska oblast', 'полтавська', 'poltavska'],
    'sumy': ['сумська область', 'sumska oblast', 'сумська', 'sumska'],
    'chernihiv': ['чернігівська область', 'chernihivska oblast', 'чернігівська', 'chernihivska']
  };
  
  const oblastVariations = cityOblastKeywords[normalizedCity] || [];
  
  // Check if alert oblast matches any variation
  for (const variation of oblastVariations) {
    if (normalizedAlertOblast.includes(variation) || normalizedAlertLocation.includes(variation)) {
      console.log('✅ Oblast variation match found:', variation);
      return true;
    }
  }
  
  // Step 4: Use city-oblast mapping data
  const cityData = Object.entries(cityToOblastMapping).find(([key, data]) => 
    key === normalizedCity || data.aliases.some(alias => alias.toLowerCase() === normalizedCity)
  );
  
  if (cityData) {
    const [cityKey, data] = cityData;
    console.log('🏙️ Found city data:', { cityKey, oblastUA: data.oblastUA, oblastEN: data.oblastEN });
    
    // Check aliases
    if (data.aliases.some(alias => normalizedAlertLocation.includes(alias.toLowerCase()))) {
      console.log('✅ City alias match found');
      return true;
    }
    
    // Check oblast matching
    const cityOblastUA = data.oblastUA.toLowerCase();
    const cityOblastEN = data.oblastEN.toLowerCase();
    
    if (normalizedAlertOblast.includes(cityOblastUA) || 
        normalizedAlertOblast.includes(cityOblastEN) ||
        normalizedAlertLocation.includes(cityOblastUA) || 
        normalizedAlertLocation.includes(cityOblastEN)) {
      console.log('✅ City data oblast match found');
      return true;
    }
    
    // Handle oblast name variations
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
  
  console.log('❌ No match found for:', { normalizedCity, normalizedAlertLocation, normalizedAlertOblast });
  return false;
}
