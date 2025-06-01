
import { supabase } from '@/integrations/supabase/client';

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

export interface RegionData {
  id: string;
  name: string;
  coordinates: [number, number];
  current_alert: boolean;
}

export class AlertsService {
  async getRegions(): Promise<RegionData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('explore-alerts-api', {
        body: { endpoint: 'regions' }
      });

      if (error) {
        console.error('Error fetching regions:', error);
        return [];
      }

      return this.processRegionsData(data.data);
    } catch (error) {
      console.error('Error in getRegions:', error);
      return [];
    }
  }

  async getActiveAlerts(): Promise<AlertData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('explore-alerts-api', {
        body: { endpoint: 'alerts' }
      });

      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }

      return this.processAlertsData(data.data);
    } catch (error) {
      console.error('Error in getActiveAlerts:', error);
      return [];
    }
  }

  async getAlertsForCoordinates(coords: [number, number], radiusKm: number = 50): Promise<AlertData[]> {
    const allAlerts = await this.getActiveAlerts();
    
    // Filter alerts within radius of coordinates
    return allAlerts.filter(alert => {
      if (!alert.coordinates) return false;
      const distance = this.calculateDistance(coords, alert.coordinates);
      return distance <= radiusKm;
    });
  }

  async getAlertsForRoute(startCoords: [number, number], endCoords: [number, number]): Promise<AlertData[]> {
    const allAlerts = await this.getActiveAlerts();
    
    // Get alerts along the route path (simplified - within 25km of start or end)
    return allAlerts.filter(alert => {
      if (!alert.coordinates) return false;
      const distanceToStart = this.calculateDistance(startCoords, alert.coordinates);
      const distanceToEnd = this.calculateDistance(endCoords, alert.coordinates);
      return distanceToStart <= 25 || distanceToEnd <= 25;
    });
  }

  calculateRouteSafetyScore(alerts: AlertData[]): number {
    if (alerts.length === 0) return 95;

    let score = 100;
    alerts.forEach(alert => {
      switch (alert.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'moderate':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(score, 10); // Minimum score of 10
  }

  private processRegionsData(rawData: any): RegionData[] {
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map(region => ({
      id: region.id || region.region_id || Math.random().toString(),
      name: region.name || region.region_name || 'Unknown Region',
      coordinates: this.extractCoordinates(region),
      current_alert: region.alert_status === 'active' || region.current_alert || false
    }));
  }

  private processAlertsData(rawData: any): AlertData[] {
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map(alert => ({
      id: alert.id || Math.random().toString(),
      region_id: alert.region_id || alert.regionId || '',
      alert_type: alert.type || alert.alert_type || 'unknown',
      start_time: alert.start_time || alert.startTime || new Date().toISOString(),
      end_time: alert.end_time || alert.endTime,
      location_name: alert.location || alert.location_name || 'Unknown Location',
      coordinates: this.extractCoordinates(alert),
      severity: this.mapSeverity(alert.severity || alert.level)
    }));
  }

  private extractCoordinates(item: any): [number, number] {
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

  private mapSeverity(severity: any): 'low' | 'moderate' | 'high' | 'critical' {
    if (typeof severity === 'string') {
      const lower = severity.toLowerCase();
      if (lower.includes('critical') || lower.includes('urgent')) return 'critical';
      if (lower.includes('high') || lower.includes('severe')) return 'high';
      if (lower.includes('moderate') || lower.includes('medium')) return 'moderate';
    }
    return 'low';
  }

  private calculateDistance(coords1: [number, number], coords2: [number, number]): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coords2[1] - coords1[1]);
    const dLon = this.deg2rad(coords2[0] - coords1[0]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coords1[1])) * Math.cos(this.deg2rad(coords2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const getAlertsService = () => new AlertsService();
