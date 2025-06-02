export interface RouteInputTranslations {
  from: string;
  to: string;
  planRoute: string;
  alerts: string;
  statistics: string; // Add this new field
  searchPlaceholder: string;
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
  realRoute: boolean;
  weatherCondition?: string;
  temperature?: number;
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
