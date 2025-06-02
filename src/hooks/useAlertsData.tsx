
import { useState, useEffect } from 'react';
import { getAlertsService } from '@/services/alertsService';

interface AlertItem {
  id: number;
  location_title: string;
  location_type: string;
  started_at: string;
  finished_at?: string;
  alert_type: string;
  location_oblast: string;
  location_raion?: string;
  notes?: string;
}

export const useAlertsData = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const alertsService = getAlertsService();
      // Get active alerts from the API
      const activeAlerts = await alertsService.getActiveAlerts();
      
      console.log('🔄 useAlertsData - Fetched active alerts:', activeAlerts.length);
      
      // Filter to only alerts from the last 72 hours that are still active
      const now = new Date();
      const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
      
      const recentActiveAlerts = activeAlerts.filter(alert => {
        try {
          const alertDate = new Date(alert.start_time);
          const isActive = !alert.end_time || alert.end_time === null;
          const isRecent = alertDate >= seventyTwoHoursAgo;
          return isActive && isRecent;
        } catch (dateError) {
          console.warn('⚠️ Error parsing alert date:', alert.start_time, dateError);
          return false;
        }
      });
      
      console.log('📊 useAlertsData - Recent active alerts (72h):', recentActiveAlerts.length);
      
      // Transform to match the expected format
      const transformedAlerts: AlertItem[] = recentActiveAlerts.map(alert => ({
        id: parseInt(alert.id),
        location_title: alert.location_name,
        location_type: 'alert', // Use a more generic type since alerts can be for different location types
        started_at: alert.start_time,
        finished_at: alert.end_time || undefined,
        alert_type: alert.alert_type,
        location_oblast: alert.location_oblast,
        location_raion: undefined, // This field doesn't exist in the API response
        notes: alert.notes || undefined
      }));
      
      console.log('✅ useAlertsData - Transformed alerts:', transformedAlerts.length);
      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('❌ useAlertsData - Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    console.log('🔄 useAlertsData - Manual refresh triggered');
    fetchAlerts();
  };

  return {
    alerts,
    isLoading,
    onRefresh
  };
};
