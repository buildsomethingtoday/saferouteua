
export interface RouteData {
  startCity: string;
  endCity: string;
  startCoords?: [number, number];
  endCoords?: [number, number];
  safetyScore?: number;
  distance?: number;
  duration?: number;
  durationFormatted?: string;
  distanceFormatted?: string;
  geometry?: any;
  transportMode: 'driving';
  trafficLevel?: 'light' | 'moderate' | 'heavy';
  roadQuality?: 'excellent' | 'good' | 'fair';
  estimatedDelay?: number;
  weatherCondition?: string;
  temperature?: number;
  conflictRisk?: string;
  alternativeRoutes?: any[];
  realRoute?: boolean;
  error?: string;
}

export interface RouteInputTranslations {
  title: string;
  startCity: string;
  endCity: string;
  startPlaceholder: string;
  endPlaceholder: string;
  returnRoute: string;
  findRoute?: string; // Made optional since we're removing the button
  searching: string;
  error: string;
}
