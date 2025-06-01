
import { AlertData, RegionData } from '@/types/alerts';

export class AlertsDataProcessor {
  static processRegionsData(rawData: any): RegionData[] {
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map(region => ({
      id: region.id || region.region_id || Math.random().toString(),
      name: region.name || region.region_name || 'Unknown Region',
      coordinates: AlertsDataProcessor.extractCoordinates(region),
      current_alert: region.alert_status === 'active' || region.current_alert || false
    }));
  }

  static processAlertsData(rawData: any): AlertData[] {
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map(alert => ({
      id: alert.id || Math.random().toString(),
      region_id: alert.region_id || alert.regionId || '',
      alert_type: alert.type || alert.alert_type || 'unknown',
      start_time: alert.start_time || alert.startTime || new Date().toISOString(),
      end_time: alert.end_time || alert.endTime,
      location_name: alert.location || alert.location_name || 'Unknown Location',
      location_oblast: alert.oblast || alert.location_oblast || alert.region_name || '',
      coordinates: AlertsDataProcessor.extractCoordinates(alert),
      severity: AlertsDataProcessor.mapSeverity(alert.severity || alert.level)
    }));
  }

  static extractCoordinates(item: any): [number, number] {
    if (item.coordinates && Array.isArray(item.coordinates)) {
      return [item.coordinates[0], item.coordinates[1]];
    }
    if (item.lng && item.lat) {
      return [item.lng, item.lat];
    }
    if (item.longitude && item.latitude) {
      return [item.longitude, item.latitude];
    }
    // Default to center of Ukraine if no coordinates
    return [31.1656, 48.3794];
  }

  static mapSeverity(severity: any): 'low' | 'moderate' | 'high' | 'critical' {
    if (typeof severity === 'string') {
      const lower = severity.toLowerCase();
      if (lower.includes('critical') || lower.includes('urgent')) return 'critical';
      if (lower.includes('high') || lower.includes('severe')) return 'high';
      if (lower.includes('moderate') || lower.includes('medium')) return 'moderate';
    }
    return 'low';
  }
}
