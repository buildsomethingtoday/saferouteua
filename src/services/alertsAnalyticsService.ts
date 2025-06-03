
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export class AlertsAnalyticsService {
  async getStatistics(timeRange: string, region: string = 'all') {
    const days = this.getTimeRangeDays(timeRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    try {
      // Build base query
      let query = supabase
        .from('alerts')
        .select('*')
        .gte('start_time', startDate.toISOString());

      // Add region filter if specified
      if (region !== 'all') {
        query = query.eq('location_oblast', region);
      }

      const { data: alerts, error } = await query;

      if (error) {
        console.error('Error fetching alerts for statistics:', error);
        return null;
      }

      console.log('📊 Analytics - Raw alerts data:', alerts?.length || 0);

      return this.processStatistics(alerts || [], days);
    } catch (error) {
      console.error('Error in getStatistics:', error);
      return null;
    }
  }

  private getTimeRangeDays(timeRange: string): number {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  }

  private processStatistics(alerts: any[], days: number) {
    const now = new Date();
    const activeAlerts = alerts.filter(alert => !alert.end_time);
    
    // Time-based data
    const timeData = this.generateTimeData(alerts, days);
    
    // Attack timing data (6-hour breakdown)
    const timingData = this.generateTimingData(alerts);
    
    // Region data
    const regions = [...new Set(alerts.map(alert => alert.location_oblast))].sort();
    
    // Calculate daily average
    const dailyAverage = Math.round(alerts.length / Math.max(days, 1));

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      dailyAverage,
      timeData,
      timingData,
      regions
    };
  }

  private generateTimeData(alerts: any[], days: number) {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const count = alerts.filter(alert => {
        const alertDate = new Date(alert.start_time);
        return alertDate >= dayStart && alertDate <= dayEnd;
      }).length;
      
      data.push({
        date: format(date, 'MMM dd'),
        count
      });
    }
    
    return data;
  }

  private generateTimingData(alerts: any[]) {
    let morningCount = 0;    // 6AM - 12PM
    let afternoonCount = 0;  // 12PM - 6PM
    let eveningCount = 0;    // 6PM - 12AM
    let nightCount = 0;      // 12AM - 6AM

    alerts.forEach(alert => {
      const alertDate = new Date(alert.start_time);
      const hour = alertDate.getHours();

      if (hour >= 6 && hour < 12) {
        morningCount++;
      } else if (hour >= 12 && hour < 18) {
        afternoonCount++;
      } else if (hour >= 18 && hour < 24) {
        eveningCount++;
      } else {
        nightCount++;
      }
    });

    const total = alerts.length;
    if (total === 0) {
      return { morning: 0, afternoon: 0, evening: 0, night: 0 };
    }

    return {
      morning: Math.round((morningCount / total) * 100),
      afternoon: Math.round((afternoonCount / total) * 100),
      evening: Math.round((eveningCount / total) * 100),
      night: Math.round((nightCount / total) * 100)
    };
  }

  async syncAlertsData() {
    // This method can be used to sync data from the external API to our database
    // For now, we'll just return a placeholder
    console.log('📊 Analytics - Sync alerts data called');
    return { synced: 0 };
  }
}

export const alertsAnalyticsService = new AlertsAnalyticsService();
