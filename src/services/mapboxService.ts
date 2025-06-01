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
    console.log('🔑 MapboxService initialized with token:', accessToken ? 'Token present' : 'No token');
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

    // Add traffic annotations for driving profiles
    if (profile === 'driving' || profile === 'driving-traffic') {
      params.append('annotations', 'congestion,maxspeed,duration,distance');
    }

    const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinatesString}?${params}`;

    console.log('🛣️ Fetching directions from URL:', url.replace(this.accessToken, 'TOKEN_HIDDEN'));

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mapbox API Error Response:', errorText);
        throw new Error(`Mapbox Directions API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Raw Mapbox directions response received, routes count:', data.routes?.length || 0);
      
      if (data.code !== 'Ok') {
        console.error('❌ Mapbox API returned error code:', data.code, data.message);
        throw new Error(`Mapbox API error: ${data.code} - ${data.message || 'Unknown error'}`);
      }
      
      return data;
    } catch (fetchError) {
      console.error('❌ Network error fetching directions:', fetchError);
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`);
    }
  }

  async geocodeForward(query: string, proximity?: [number, number]): Promise<GeocodingResponse> {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      country: 'ua',
      limit: '5',
      types: 'place,locality,neighborhood,address'
    });

    if (proximity) {
      params.append('proximity', proximity.join(','));
    }

    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;

    console.log('🌍 Geocoding query URL:', url.replace(this.accessToken, 'TOKEN_HIDDEN'));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Geocoding API Error:', errorText);
        throw new Error(`Mapbox Geocoding API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Geocoding response received, features count:', data.features?.length || 0);
      return data;
    } catch (fetchError) {
      console.error('❌ Network error in geocoding:', fetchError);
      throw new Error(`Geocoding network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`);
    }
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
    
    // Use real traffic data if available
    if (route.legs && route.legs[0]?.annotation?.congestion) {
      const congestionData = route.legs[0].annotation.congestion;
      const totalSegments = congestionData.length;
      const heavyTrafficSegments = congestionData.filter((level: string) => 
        level === 'heavy' || level === 'severe'
      ).length;
      
      // Lower score for heavy traffic areas
      const trafficPenalty = (heavyTrafficSegments / totalSegments) * 15;
      baseScore -= trafficPenalty;
    }
    
    // Consider route distance (longer routes may be less safe)
    if (route.distance) {
      const distancePenalty = Math.min(route.distance / 1000 * 0.05, 8);
      baseScore -= distancePenalty;
    }
    
    // Use traffic duration vs normal duration
    if (route.duration_traffic && route.duration) {
      const trafficDelay = (route.duration_traffic - route.duration) / route.duration;
      if (trafficDelay > 0.2) { // More than 20% delay
        baseScore -= trafficDelay * 10;
      }
    }
    
    // Add some realistic variation
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
      estimatedDelay = Math.round((route.duration_traffic - route.duration) / 60); // in minutes
    }

    // Analyze road quality based on speed limits
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
      
      if (error || !data?.token) {
        console.warn('⚠️ Could not fetch token from Supabase, error:', error);
        throw new Error('Failed to get Mapbox token from Supabase');
      } else {
        console.log('✅ Successfully retrieved Mapbox token from Supabase');
        mapboxService = new MapboxService(data.token);
      }
    } catch (error) {
      console.error('❌ Error fetching token from Supabase:', error);
      throw new Error(`Failed to initialize Mapbox service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  return mapboxService;
};

export default MapboxService;
