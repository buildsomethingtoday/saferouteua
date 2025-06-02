
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
      // Get recent alerts from the last 72 hours
      const recentAlerts = await alertsService.getRecentAlerts(72);
      
      // Transform to match the expected format
      const transformedAlerts: AlertItem[] = recentAlerts.map(alert => ({
        id: parseInt(alert.id),
        location_title: alert.location_name,
        location_type: 'city',
        started_at: alert.start_time,
        finished_at: alert.end_time || undefined,
        alert_type: alert.alert_type,
        location_oblast: alert.location_oblast,
        location_raion: alert.location_raion || undefined,
        notes: alert.notes || undefined
      }));
      
      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    fetchAlerts();
  };

  return {
    alerts,
    isLoading,
    onRefresh
  };
};
