interface DirectionsResponse {
  routes: {
    geometry: any; // GeoJSON geometry object
    duration: number;
    distance: number;
    duration_traffic?: number;
    legs: Array<{
      duration: number;
      distance: number;
      annotation?: {
        congestion?: string[];
        maxspeed?: number[];
      };
      steps: Array<{
        instruction: string;
        duration: number;
        distance: number;
        maneuver: {
          type: string;
          modifier?: string;
        };
      }>;
    }>;
    weight?: number;
    weight_name?: string;
  }[];
  waypoints: Array<{
    location: [number, number];
    name: string;
  }>;
}

interface GeocodingResponse {
  features: Array<{
    place_name: string;
    center: [number, number];
    properties: {
      category?: string;
    };
    context: Array<{
      id: string;
      text: string;
    }>;
  }>;
}

interface MatrixResponse {
  durations: number[][];
  distances: number[][];
  destinations: Array<{
    location: [number, number];
    name: string;
  }>;
  sources: Array<{
    location: [number, number];
    name: string;
  }>;
}

class MapboxService {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    console.log('🔑 MapboxService initialized with token:', accessToken ? 'Present' : 'Missing');
  }

  async getDirections(
    coordinates: Array<[number, number]>,
    profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' = 'driving-traffic',
    alternatives: boolean = true
  ): Promise<DirectionsResponse> {
    const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
    const params = new URLSearchParams({
      geometries: 'geojson',
      overview: 'full',
      steps: 'true',
      access_token: this.accessToken
    });

    if (alternatives) {
      params.append('alternatives', 'true');
      params.append('max_alternatives', '2');
    }

    if (profile === 'driving' || profile === 'driving-traffic') {
      params.append('annotations', 'congestion,maxspeed,duration,distance');
    }

    const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinatesString}?${params}`;

    console.log('🛣️ Mapbox Directions API call:', {
      profile,
      coordinates: coordinates.length,
      url: url.replace(this.accessToken, 'TOKEN_HIDDEN')
    });

    try {
      const response = await fetch(url);
      
      console.log('📡 Mapbox Directions response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mapbox Directions API HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Mapbox Directions API HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Mapbox Directions response received:', {
        code: data.code,
        routes: data.routes?.length || 0,
        message: data.message
      });
      
      if (data.code !== 'Ok') {
        console.error('❌ Mapbox Directions API error:', {
          code: data.code,
          message: data.message
        });
        throw new Error(`Mapbox Directions API error: ${data.code} - ${data.message || 'Unknown API error'}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Mapbox Directions fetch error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Mapbox Directions API. Please check your internet connection.');
      }
      throw error;
    }
  }

  async geocodeForward(query: string, proximity?: [number, number]): Promise<GeocodingResponse> {
    // Enhance query for Ukrainian cities to prioritize Ukraine results
    const enhancedQuery = this.enhanceUkrainianCityQuery(query);
    
    const params = new URLSearchParams({
      access_token: this.accessToken,
      limit: '5',
      types: 'place,locality,neighborhood,address',
      country: 'ua' // Prioritize Ukrainian results
    });

    if (proximity) {
      params.append('proximity', proximity.join(','));
    } else {
      // Default proximity to Ukraine center
      params.append('proximity', '31.1656,48.3794');
    }

    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(enhancedQuery)}.json?${params}`;

    console.log('🌍 Mapbox Geocoding API call:', {
      query: enhancedQuery,
      originalQuery: query,
      url: url.replace(this.accessToken, 'TOKEN_HIDDEN')
    });

    try {
      const response = await fetch(url);
      
      console.log('📡 Mapbox Geocoding response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mapbox Geocoding API HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Mapbox Geocoding API HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Mapbox Geocoding response received:', {
        query: enhancedQuery,
        features: data.features?.length || 0,
        firstResult: data.features?.[0]?.place_name
      });
      
      return data;
    } catch (error) {
      console.error('❌ Mapbox Geocoding fetch error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Mapbox Geocoding API. Please check your internet connection.');
      }
      throw error;
    }
  }

  private enhanceUkrainianCityQuery(query: string): string {
    // Map of common Ukrainian city names to include Ukraine in the query
    const ukrainianCityMappings: Record<string, string> = {
      'Dnipro': 'Dnipro Ukraine',
      'Дніпро': 'Дніпро Україна',
      'Kyiv': 'Kyiv Ukraine',
      'Київ': 'Київ Україна',
      'Lviv': 'Lviv Ukraine',
      'Львів': 'Львів Україна',
      'Odesa': 'Odesa Ukraine',
      'Одеса': 'Одеса Україна',
      'Kharkiv': 'Kharkiv Ukraine',
      'Харків': 'Харків Україна'
    };

    // Check if the query is a known Ukrainian city
    const enhancedQuery = ukrainianCityMappings[query] || query;
    
    // If it doesn't already contain "Ukraine" or "Україна", and it's likely a Ukrainian city
    if (!enhancedQuery.toLowerCase().includes('ukraine') && 
        !enhancedQuery.toLowerCase().includes('україна') &&
        enhancedQuery === query) {
      return `${query} Ukraine`;
    }
    
    return enhancedQuery;
  }

  async geocodeReverse(coordinates: [number, number]): Promise<GeocodingResponse> {
    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${coordinates.join(',')}.json?access_token=${this.accessToken}&types=place,locality`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox Reverse Geocoding API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMatrix(
    coordinates: Array<[number, number]>,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<MatrixResponse> {
    const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
    const url = `${this.baseUrl}/directions-matrix/v1/mapbox/${profile}/${coordinatesString}?access_token=${this.accessToken}`;

    console.log('Fetching matrix from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox Matrix API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Matrix response:', data);
    return data;
  }

  calculateTrafficBasedSafetyScore(route: any): number {
    let baseScore = 75;
    
    if (route.legs && route.legs[0]?.annotation?.congestion) {
      const congestionData = route.legs[0].annotation.congestion;
      const totalSegments = congestionData.length;
      const heavyTrafficSegments = congestionData.filter((level: string) => 
        level === 'heavy' || level === 'severe'
      ).length;
      
      const trafficPenalty = (heavyTrafficSegments / totalSegments) * 15;
      baseScore -= trafficPenalty;
    }
    
    if (route.distance) {
      const distancePenalty = Math.min(route.distance / 1000 * 0.05, 8);
      baseScore -= distancePenalty;
    }
    
    if (route.duration_traffic && route.duration) {
      const trafficDelay = (route.duration_traffic - route.duration) / route.duration;
      if (trafficDelay > 0.2) {
        baseScore -= trafficDelay * 10;
      }
    }
    
    const variation = (Math.random() - 0.5) * 10;
    
    return Math.max(60, Math.min(95, Math.round(baseScore + variation)));
  }

  analyzeRouteQuality(route: any): {
    trafficLevel: 'light' | 'moderate' | 'heavy';
    roadQuality: 'excellent' | 'good' | 'fair';
    estimatedDelay: number;
  } {
    let trafficLevel: 'light' | 'moderate' | 'heavy' = 'light';
    let roadQuality: 'excellent' | 'good' | 'fair' = 'good';
    let estimatedDelay = 0;

    if (route.legs && route.legs[0]?.annotation?.congestion) {
      const congestionData = route.legs[0].annotation.congestion;
      const heavyCount = congestionData.filter((level: string) => level === 'heavy' || level === 'severe').length;
      const moderateCount = congestionData.filter((level: string) => level === 'moderate').length;
      
      if (heavyCount > congestionData.length * 0.3) {
        trafficLevel = 'heavy';
      } else if (moderateCount > congestionData.length * 0.4) {
        trafficLevel = 'moderate';
      }
    }

    if (route.duration_traffic && route.duration) {
      estimatedDelay = Math.round((route.duration_traffic - route.duration) / 60);
    }

    if (route.legs && route.legs[0]?.annotation?.maxspeed) {
      const speeds = route.legs[0].annotation.maxspeed;
      const avgSpeed = speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length;
      
      if (avgSpeed >= 80) {
        roadQuality = 'excellent';
      } else if (avgSpeed >= 50) {
        roadQuality = 'good';
      } else {
        roadQuality = 'fair';
      }
    }

    return { trafficLevel, roadQuality, estimatedDelay };
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }
}

// Updated singleton instance that fetches token from Supabase
let mapboxService: MapboxService | null = null;

export const getMapboxService = async (): Promise<MapboxService> => {
  if (!mapboxService) {
    try {
      console.log('🔄 Fetching Mapbox token from Supabase...');
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Supabase function error: ${error.message || 'Unknown error'}`);
      }
      
      if (!data?.token) {
        console.error('❌ No token in Supabase response:', data);
        throw new Error('Mapbox token not found in Supabase response. Please check your Supabase secrets configuration.');
      }
      
      console.log('✅ Successfully retrieved Mapbox token from Supabase');
      mapboxService = new MapboxService(data.token);
    } catch (error) {
      console.error('❌ Error initializing Mapbox service:', error);
      throw new Error(`Failed to initialize Mapbox service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  return mapboxService;
};

export default MapboxService;
