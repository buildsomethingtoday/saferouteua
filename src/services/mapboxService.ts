
interface DirectionsResponse {
  routes: {
    geometry: string;
    duration: number;
    distance: number;
    legs: Array<{
      duration: number;
      distance: number;
      steps: Array<{
        instruction: string;
        duration: number;
        distance: number;
      }>;
    }>;
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
  }

  async getDirections(
    coordinates: Array<[number, number]>,
    profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' = 'driving-traffic'
  ): Promise<DirectionsResponse> {
    const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
    const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinatesString}?geometries=geojson&overview=full&steps=true&access_token=${this.accessToken}`;

    console.log('Fetching directions from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox Directions API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Directions response:', data);
    return data;
  }

  async geocodeForward(query: string, proximity?: [number, number]): Promise<GeocodingResponse> {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      country: 'ua', // Focus on Ukraine
      limit: '5',
      types: 'place,locality,neighborhood,address'
    });

    if (proximity) {
      params.append('proximity', proximity.join(','));
    }

    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;

    console.log('Geocoding query:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Geocoding response:', data);
    return data;
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

  calculateSafetyScore(route: any, conflictZones: Array<[number, number]>): number {
    // Basic safety scoring algorithm
    // In a real implementation, this would use actual conflict data
    const baseScore = 85;
    const distancePenalty = Math.min(route.distance / 1000 * 0.1, 10);
    const randomVariation = Math.random() * 20 - 10;
    
    return Math.max(60, Math.min(95, baseScore - distancePenalty + randomVariation));
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

// Create a singleton instance with the access token
let mapboxService: MapboxService | null = null;

export const getMapboxService = (): MapboxService => {
  if (!mapboxService) {
    const accessToken = 'pk.eyJ1Ijoic2hlaWtoaW1yYW4wMSIsImEiOiJjbWJkZDY3enUxNXN1MnFuNnI0bzZwZXc0In0.fb4W6ahWd3Ook2vguHozPA';
    mapboxService = new MapboxService(accessToken);
  }
  return mapboxService;
};

export default MapboxService;
