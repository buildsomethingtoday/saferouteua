
export interface RouteInputTranslations {
  from: string;
  to: string;
  startCity: string;
  endCity: string;
  startPlaceholder: string;
  endPlaceholder: string;
  planRoute: string;
  alerts: string;
  statistics: string;
  searchPlaceholder: string;
  searching: string;
  distance: string;
  duration: string;
  routeInformation: string;
  safetyAlerts: string;
  alertsCount: string;
  live: string;
  estimated: string;
  weather: string;
  weatherConditions: {
    [key: string]: string;
  };
}

export interface RouteData {
  startCity: string;
  endCity: string;
  startCoords?: [number, number];
  endCoords?: [number, number];
  realRoute: boolean;
  weatherCondition?: string;
  temperature?: number;
  distance?: number;
  distanceFormatted?: string;
  duration?: number;
  durationFormatted?: string;
  safetyScore?: number;
  safetyAlerts?: AlertData[];
  geometry?: any;
  transportMode?: string;
  conflictRisk?: string;
  trafficLevel?: string;
  roadQuality?: string;
  estimatedDelay?: number;
  error?: string;
}

export interface AlertData {
  id: string;
  region_id: string;
  alert_type: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  location_oblast: string;
  coordinates?: [number, number];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}
