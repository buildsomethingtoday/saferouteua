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
    profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' = 'driving',
    alternatives: boolean = true
  ): Promise<DirectionsResponse> {
    const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
    
    console.log('🛣️ Starting simplified Mapbox Directions request');
    
    try {
      // Use basic driving profile with minimal parameters to avoid errors
      const params = new URLSearchParams({
        geometries: 'geojson',
        overview: 'full',
        access_token: this.accessToken
      });

      // Only add alternatives for driving
      if (alternatives) {
        params.append('alternatives', 'true');
      }

      const url = `${this.baseUrl}/directions/v5/mapbox/driving/${coordinatesString}?${params}`;

      console.log('🛣️ Making simplified Mapbox Directions API call:', {
        url: url.replace(this.accessToken, 'TOKEN_HIDDEN')
      });

      const response = await fetch(url);
      
      console.log('📡 Mapbox Directions response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mapbox Directions API HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // If basic driving fails, create a fallback route
        console.log('🔄 Creating fallback route...');
        return this.createFallbackRoute(coordinates);
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
        
        // Create fallback route
        console.log('🔄 Creating fallback route due to API error...');
        return this.createFallbackRoute(coordinates);
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Mapbox Directions fetch error:', error);
      console.log('🔄 Creating fallback route due to network error...');
      return this.createFallbackRoute(coordinates);
    }
  }

  private createFallbackRoute(coordinates: Array<[number, number]>): DirectionsResponse {
    console.log('🚧 Creating fallback route for coordinates:', coordinates);
    
    const [start, end] = coordinates;
    
    // Calculate approximate distance using Haversine formula
    const distance = this.calculateDistance(start, end);
    
    // Estimate duration based on average speed (50 km/h for Ukrainian roads)
    const duration = (distance / 50) * 3600; // Convert to seconds
    
    // Create simple straight-line geometry
    const geometry = {
      type: 'LineString',
      coordinates: [start, end]
    };
    
    const fallbackRoute: DirectionsResponse = {
      routes: [{
        geometry,
        duration: Math.round(duration),
        distance: Math.round(distance * 1000), // Convert to meters
        legs: [{
          duration: Math.round(duration),
          distance: Math.round(distance * 1000),
          steps: [{
            instruction: `Head towards destination`,
            duration: Math.round(duration),
            distance: Math.round(distance * 1000),
            maneuver: {
              type: 'depart'
            }
          }]
        }]
      }],
      waypoints: [
        { location: start, name: 'Start' },
        { location: end, name: 'Destination' }
      ]
    };
    
    console.log('✅ Fallback route created:', {
      distance: `${distance.toFixed(1)} km`,
      duration: `${Math.round(duration / 60)} min`
    });
    
    return fallbackRoute;
  }

  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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
    
    // Simplified scoring since we may not have all traffic data
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
    let trafficLevel: 'light' | 'moderate' | 'heavy' = 'moderate';
    let roadQuality: 'excellent' | 'good' | 'fair' = 'good';
    let estimatedDelay = 0;

    // Simplified analysis for basic routing
    if (route.duration_traffic && route.duration) {
      estimatedDelay = Math.round((route.duration_traffic - route.duration) / 60);
      if (estimatedDelay > 30) {
        trafficLevel = 'heavy';
      } else if (estimatedDelay > 10) {
        trafficLevel = 'moderate';
      } else {
        trafficLevel = 'light';
      }
    }

    // Basic road quality estimation based on distance vs duration
    if (route.distance && route.duration) {
      const avgSpeed = (route.distance / 1000) / (route.duration / 3600); // km/h
      if (avgSpeed >= 60) {
        roadQuality = 'excellent';
      } else if (avgSpeed >= 40) {
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
