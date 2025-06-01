
import { supabase } from '@/integrations/supabase/client';
import { findOblastForCity, doesAlertMatchCity } from '@/utils/cityOblastMapping';
import { AlertData, RegionData } from '@/types/alerts';
import { AlertsDataProcessor } from '@/utils/alertsProcessing';
import { AlertsCalculator } from '@/utils/alertsCalculations';

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

      return AlertsDataProcessor.processRegionsData(data.data);
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

      return AlertsDataProcessor.processAlertsData(data.data);
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
      const distance = AlertsCalculator.calculateDistance(coords, alert.coordinates);
      return distance <= radiusKm;
    });
  }

  async getAlertsForRoute(startCoords: [number, number], endCoords: [number, number]): Promise<AlertData[]> {
    const allAlerts = await this.getActiveAlerts();
    
    // Get alerts along the route path (simplified - within 25km of start or end)
    return allAlerts.filter(alert => {
      if (!alert.coordinates) return false;
      const distanceToStart = AlertsCalculator.calculateDistance(startCoords, alert.coordinates);
      const distanceToEnd = AlertsCalculator.calculateDistance(endCoords, alert.coordinates);
      return distanceToStart <= 25 || distanceToEnd <= 25;
    });
  }

  async getAlertsForCities(startCity: string, endCity: string): Promise<AlertData[]> {
    console.log('🔍 Getting alerts for cities:', { startCity, endCity });
    
    const allAlerts = await this.getActiveAlerts();
    console.log('📊 Total active alerts found:', allAlerts.length);
    
    // Filter to only active alerts from the last 72 hours
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    
    const recentAlerts = allAlerts.filter(alert => {
      const alertDate = new Date(alert.start_time);
      const isActive = !alert.end_time;
      const isRecent = alertDate >= seventyTwoHoursAgo;
      return isActive && isRecent;
    });
    
    console.log('📊 Recent active alerts (72h):', recentAlerts.length);
    console.log('📋 Recent alerts details:', recentAlerts.map(alert => ({
      id: alert.id,
      location: alert.location_name,
      oblast: alert.location_oblast,
      type: alert.alert_type,
      severity: alert.severity
    })));
    
    const routeAlerts = recentAlerts.filter(alert => {
      const alertLocation = alert.location_name?.toLowerCase() || '';
      const alertOblast = alert.location_oblast?.toLowerCase() || '';
      
      console.log('🔍 Checking alert:', {
        alertId: alert.id,
        alertLocation: alert.location_name,
        alertOblast: alert.location_oblast,
        startCity,
        endCity
      });
      
      // Check if alert matches start city
      const matchesStartCity = doesAlertMatchCity(alert.location_name || '', alert.location_oblast || '', startCity);
      
      // Check if alert matches end city  
      const matchesEndCity = doesAlertMatchCity(alert.location_name || '', alert.location_oblast || '', endCity);
      
      if (matchesStartCity || matchesEndCity) {
        console.log('✅ Alert matches route:', {
          alertLocation: alert.location_name,
          alertOblast: alert.location_oblast,
          startCity,
          endCity,
          matchesStart: matchesStartCity,
          matchesEnd: matchesEndCity,
          alertType: alert.alert_type,
          severity: alert.severity
        });
        return true;
      }
      
      console.log('❌ Alert does not match route');
      return false;
    });
    
    console.log('📊 Final route-specific alerts found:', routeAlerts.length);
    console.log('📋 Final alerts details:', routeAlerts.map(alert => ({
      id: alert.id,
      location: alert.location_name,
      oblast: alert.location_oblast,
      type: alert.alert_type,
      severity: alert.severity
    })));
    
    return routeAlerts;
  }

  calculateRouteSafetyScore(alerts: AlertData[]): number {
    return AlertsCalculator.calculateRouteSafetyScore(alerts);
  }
}

export const getAlertsService = () => new AlertsService();
