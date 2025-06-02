
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
    
    // Type-based data
    const typeData = this.generateTypeData(alerts);
    
    // Severity-based data
    const severityData = this.generateSeverityData(alerts);
    
    // Region data
    const regions = [...new Set(alerts.map(alert => alert.location_oblast))].sort();
    
    // Calculate daily average
    const dailyAverage = Math.round(alerts.length / Math.max(days, 1));

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      dailyAverage,
      timeData,
      typeData,
      severityData,
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

  private generateTypeData(alerts: any[]) {
    const typeCounts: { [key: string]: number } = {};
    
    alerts.forEach(alert => {
      const type = alert.alert_type || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private generateSeverityData(alerts: any[]) {
    const severityCounts: { [key: string]: number } = {};
    
    alerts.forEach(alert => {
      const severity = alert.severity || 'unknown';
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });
    
    return Object.entries(severityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  async syncAlertsData() {
    // This method can be used to sync data from the external API to our database
    // For now, we'll just return a placeholder
    console.log('📊 Analytics - Sync alerts data called');
    return { synced: 0 };
  }
}

export const alertsAnalyticsService = new AlertsAnalyticsService();
