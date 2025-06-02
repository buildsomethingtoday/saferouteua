
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
    console.log('🔧 AlertsDataProcessor - Processing raw alerts data:', rawData);
    
    if (!Array.isArray(rawData)) {
      console.log('❌ AlertsDataProcessor - Raw data is not an array:', typeof rawData);
      return [];
    }
    
    console.log('📊 AlertsDataProcessor - Processing', rawData.length, 'raw alerts');
    
    const processedAlerts = rawData.map((alert, index) => {
      console.log(`🔧 Processing alert ${index}:`, {
        id: alert.id,
        location_title: alert.location_title,
        location_oblast: alert.location_oblast,
        started_at: alert.started_at,
        finished_at: alert.finished_at,
        alert_type: alert.alert_type
      });
      
      const processedAlert: AlertData = {
        id: String(alert.id || Math.random().toString()),
        region_id: String(alert.location_oblast_uid || alert.region_id || alert.id || ''),
        alert_type: alert.alert_type || 'unknown',
        start_time: alert.started_at || alert.start_time || new Date().toISOString(),
        end_time: alert.finished_at || alert.end_time || undefined,
        location_name: alert.location_title || alert.location_name || 'Unknown Location',
        location_oblast: alert.location_oblast || alert.oblast || alert.region_name || '',
        coordinates: AlertsDataProcessor.extractCoordinates(alert),
        severity: AlertsDataProcessor.mapSeverity(alert.severity || alert.level || alert.alert_type)
      };
      
      console.log(`✅ Processed alert ${index}:`, processedAlert);
      return processedAlert;
    });
    
    console.log('📊 AlertsDataProcessor - Processed', processedAlerts.length, 'alerts successfully');
    return processedAlerts;
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
      // Map alert types to severity levels
      if (lower.includes('urban_fights') || lower.includes('artillery_shelling')) return 'high';
      if (lower.includes('air_raid')) return 'moderate';
    }
    return 'low';
  }
}
