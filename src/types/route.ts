
export interface AlertData {
  id: string;
  region_id: string;
  alert_type: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  coordinates?: [number, number];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

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
  safetyAlerts?: AlertData[];
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
  findRoute: string;
  searching: string;
  error: string;
  appTitle: string;
  appSubtitle: string;
  routeDetails: string;
  distance: string;
  duration: string;
  weather: string;
  conflictRisk: string;
  trafficLevel: string;
  live: string;
  estimated: string;
  safetyAlerts: string;
  alertsCount: string;
  riskLevels: {
    low: string;
    moderate: string;
    high: string;
  };
  weatherConditions: {
    clear: string;
    cloudy: string;
    light_rain: string;
  };
  trafficLevels: {
    light: string;
    moderate: string;
    heavy: string;
  };
}
