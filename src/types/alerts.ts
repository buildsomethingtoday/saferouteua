
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

export interface RegionData {
  id: string;
  name: string;
  coordinates: [number, number];
  current_alert: boolean;
}
