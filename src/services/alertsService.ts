
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
      console.log('🔄 AlertsService - Fetching active alerts from API...');
      
      const { data, error } = await supabase.functions.invoke('explore-alerts-api', {
        body: { endpoint: 'alerts' }
      });

      if (error) {
        console.error('❌ Error fetching alerts:', error);
        return [];
      }

      console.log('📡 AlertsService - Raw API response:', data);
      
      // The API response structure is { alerts: [...] }
      const alertsArray = data.data?.alerts || data.data || [];
      console.log('📊 AlertsService - Extracted alerts array:', alertsArray);
      
      const processedAlerts = AlertsDataProcessor.processAlertsData(alertsArray);
      console.log('✅ AlertsService - Processed alerts:', processedAlerts.length);
      
      return processedAlerts;
    } catch (error) {
      console.error('❌ Error in getActiveAlerts:', error);
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
    console.log('🔍 AlertsService - Getting alerts for cities:', { startCity, endCity });
    
    const allAlerts = await this.getActiveAlerts();
    console.log('📊 AlertsService - Total active alerts found:', allAlerts.length);
    
    // Filter to only active alerts from the last 72 hours
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    
    console.log('⏰ AlertsService - Filtering for last 72 hours. Current time:', now.toISOString());
    console.log('⏰ AlertsService - 72 hours ago:', seventyTwoHoursAgo.toISOString());
    
    const recentAlerts = allAlerts.filter(alert => {
      try {
        const alertDate = new Date(alert.start_time);
        const isActive = !alert.end_time || alert.end_time === null;
        const isRecent = alertDate >= seventyTwoHoursAgo;
        
        console.log('🕐 Alert time check:', {
          alertId: alert.id,
          alertLocation: alert.location_name,
          startTime: alert.start_time,
          alertDate: alertDate.toISOString(),
          endTime: alert.end_time,
          isActive,
          isRecent,
          included: isActive && isRecent
        });
        
        return isActive && isRecent;
      } catch (dateError) {
        console.warn('⚠️ Error parsing alert date:', alert.start_time, dateError);
        return false;
      }
    });
    
    console.log('📊 AlertsService - Recent active alerts (72h):', recentAlerts.length);
    console.log('📋 AlertsService - Recent alerts details:', recentAlerts.map(alert => ({
      id: alert.id,
      location: alert.location_name,
      oblast: alert.location_oblast,
      type: alert.alert_type,
      severity: alert.severity,
      startTime: alert.start_time
    })));
    
    const routeAlerts = recentAlerts.filter(alert => {
      console.log('🔍 AlertsService - Checking alert against cities:', {
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
      
      const matches = matchesStartCity || matchesEndCity;
      
      if (matches) {
        console.log('✅ AlertsService - Alert matches route:', {
          alertLocation: alert.location_name,
          alertOblast: alert.location_oblast,
          startCity,
          endCity,
          matchesStart: matchesStartCity,
          matchesEnd: matchesEndCity,
          alertType: alert.alert_type,
          severity: alert.severity
        });
      } else {
        console.log('❌ AlertsService - Alert does not match route');
      }
      
      return matches;
    });
    
    console.log('📊 AlertsService - Final route-specific alerts found:', routeAlerts.length);
    console.log('📋 AlertsService - Final alerts details:', routeAlerts.map(alert => ({
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
