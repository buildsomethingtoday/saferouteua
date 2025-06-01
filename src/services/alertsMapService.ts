

export interface AlertMapData {
  id: number;
  location_title: string;
  location_oblast: string;
  alert_type: string;
  started_at: string;
  coordinates?: [number, number];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export class AlertsMapService {
  // Ukrainian oblast approximate centers for map visualization
  private oblastCenters: { [key: string]: [number, number] } = {
    'Київська область': [30.5234, 50.4501],
    'Харківська область': [36.2310, 49.9935],
    'Дніпропетровська область': [35.0462, 48.4647],
    'Луганська область': [38.5045, 48.5740],
    'Донецька область': [37.8036, 48.0159],
    'Запорізька область': [35.1396, 47.8388],
    'Херсонська область': [32.6178, 46.6554],
    'Миколаївська область': [31.9946, 46.9750],
    'Одеська область': [30.7326, 46.4825],
    'Вінницька область': [28.4682, 49.2331],
    'Житомирська область': [28.6587, 50.2547],
    'Закарпатська область': [22.7183, 48.6208],
    'Івано-Франківська область': [24.7111, 48.9226],
    'Кіровоградська область': [32.2623, 48.5132],
    'Львівська область': [24.0232, 49.8397],
    'Полтавська область': [34.5514, 49.5883],
    'Рівненська область': [26.2518, 50.6199],
    'Сумська область': [34.8000, 50.9077],
    'Тернопільська область': [25.5948, 49.5535],
    'Хмельницька область': [26.9871, 49.4229],
    'Черкаська область': [32.0617, 49.4444],
    'Чернівецька область': [25.9358, 48.2920],
    'Чернігівська область': [31.2893, 51.4982],
    'Автономна Республіка Крим': [34.1018, 44.9480],
  };

  processAlertsForMap(rawAlerts: any[]): AlertMapData[] {
    if (!Array.isArray(rawAlerts)) return [];

    console.log('Processing alerts for map:', rawAlerts.length, 'alerts');
    
    // Filter to only show active alerts from the last 72 hours
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    
    const recentActiveAlerts = rawAlerts.filter(alert => {
      const alertDate = new Date(alert.started_at);
      return !alert.finished_at && alertDate >= seventyTwoHoursAgo;
    });
    
    console.log('Recent active alerts (last 72 hours, finished_at is null):', recentActiveAlerts.length);

    return recentActiveAlerts.map(alert => ({
      id: alert.id,
      location_title: alert.location_title,
      location_oblast: alert.location_oblast,
      alert_type: alert.alert_type,
      started_at: alert.started_at,
      coordinates: this.getCoordinatesForAlert(alert),
      severity: this.mapAlertSeverity(alert.alert_type)
    }));
  }

  private getCoordinatesForAlert(alert: any): [number, number] {
    // First try to get coordinates from the alert data itself
    if (alert.coordinates && Array.isArray(alert.coordinates) && alert.coordinates.length >= 2) {
      return [alert.coordinates[0], alert.coordinates[1]];
    }

    // Fall back to oblast centers
    const coords = this.oblastCenters[alert.location_oblast];
    if (coords) {
      return coords;
    }

    // Default to center of Ukraine if no coordinates found
    console.log('No coordinates found for alert:', alert.location_title, alert.location_oblast);
    return [31.1656, 48.3794];
  }

  private mapAlertSeverity(alertType: string): 'low' | 'moderate' | 'high' | 'critical' {
    switch (alertType) {
      case 'air_raid': return 'critical';
      case 'artillery_shelling': return 'high';
      case 'urban_fights': return 'high';
      case 'chemical': return 'critical';
      case 'nuclear': return 'critical';
      default: return 'moderate';
    }
  }

  getAlertColor(alertType: string): string {
    switch (alertType) {
      case 'air_raid': return '#DC2626'; // red-600
      case 'artillery_shelling': return '#EA580C'; // orange-600
      case 'urban_fights': return '#9333EA'; // purple-600
      case 'chemical': return '#7C2D12'; // red-900
      case 'nuclear': return '#450A0A'; // red-950
      default: return '#EAB308'; // yellow-500
    }
  }

  filterAlertsByRegion(alerts: AlertMapData[], regionName: string): AlertMapData[] {
    if (!regionName) return alerts;
    
    return alerts.filter(alert => 
      alert.location_oblast.toLowerCase().includes(regionName.toLowerCase()) ||
      alert.location_title.toLowerCase().includes(regionName.toLowerCase())
    );
  }

  calculateRegionRiskLevel(alerts: AlertMapData[]): 'safe' | 'caution' | 'danger' | 'critical' {
    if (alerts.length === 0) return 'safe';
    
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'danger';
    if (alerts.length > 1) return 'caution';
    return 'safe';
  }

  calculateRouteSafetyScore(alerts: AlertMapData[], allAlerts?: any[]): { score: number; status: string; description: string } {
    const now = new Date();
    
    // Check for attacks in different time periods
    const last72Hours = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    const last5Days = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get recent attacks from last 72 hours (current active alerts)
    const recentAttacks = alerts.filter(alert => {
      const alertDate = new Date(alert.started_at);
      return alertDate >= last72Hours;
    });

    // Check for critical attack types in last 72 hours
    const hasCriticalAttacks = recentAttacks.some(alert => 
      alert.alert_type === 'air_raid' || 
      alert.alert_type === 'artillery_shelling' || 
      alert.alert_type === 'urban_fights'
    );

    const hasAirRaid = recentAttacks.some(alert => alert.alert_type === 'air_raid');
    const hasArtillery = recentAttacks.some(alert => alert.alert_type === 'artillery_shelling');
    const hasUrbanFights = recentAttacks.some(alert => alert.alert_type === 'urban_fights');

    // If there are critical attacks in last 72 hours
    if (hasCriticalAttacks) {
      let score = 15; // Start very low for recent attacks
      let status = 'DANGER';
      let description = 'Active threats detected in area';

      if (hasAirRaid) {
        score = Math.max(5, score - 10);
        status = 'CRITICAL';
        description = 'Air raid alerts active - seek shelter immediately';
      }
      
      if (hasArtillery) {
        score = Math.max(10, score - 8);
        status = hasAirRaid ? 'CRITICAL' : 'DANGER';
        description = hasAirRaid ? description : 'Artillery attacks reported - avoid area';
      }

      if (hasUrbanFights) {
        score = Math.max(12, score - 6);
        if (!hasAirRaid && !hasArtillery) {
          status = 'DANGER';
          description = 'Urban combat reported - high risk area';
        }
      }

      return { score, status, description };
    }

    // If using allAlerts data, check for attacks in last 5 days
    if (allAlerts && Array.isArray(allAlerts)) {
      const attacksLast5Days = allAlerts.filter(alert => {
        const alertDate = new Date(alert.started_at);
        return alertDate >= last5Days && (
          alert.alert_type === 'air_raid' || 
          alert.alert_type === 'artillery_shelling' || 
          alert.alert_type === 'urban_fights'
        );
      });

      if (attacksLast5Days.length > 0) {
        return {
          score: 35,
          status: 'CAUTION',
          description: 'Recent attacks in area - exercise caution'
        };
      }

      // Check for attacks in last 30 days
      const attacksLast30Days = allAlerts.filter(alert => {
        const alertDate = new Date(alert.started_at);
        return alertDate >= last30Days && (
          alert.alert_type === 'air_raid' || 
          alert.alert_type === 'artillery_shelling' || 
          alert.alert_type === 'urban_fights'
        );
      });

      if (attacksLast30Days.length > 0) {
        return {
          score: 65,
          status: 'MODERATE',
          description: 'Some recent activity - stay alert'
        };
      }
    }

    // No recent significant attacks
    return {
      score: 85,
      status: 'SAFE',
      description: 'No recent threats detected'
    };
  }

  // Get alerts from last 5 days for pin hover information
  getRecentAlertsForLocation(allAlerts: any[], coordinates: [number, number]): any[] {
    if (!allAlerts || !Array.isArray(allAlerts)) return [];

    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));

    return allAlerts.filter(alert => {
      const alertDate = new Date(alert.started_at);
      const alertCoords = this.getCoordinatesForAlert(alert);
      
      // Check if it's within last 5 days and roughly same location
      const isRecent = alertDate >= fiveDaysAgo;
      const isSameLocation = Math.abs(alertCoords[0] - coordinates[0]) < 0.1 && 
                            Math.abs(alertCoords[1] - coordinates[1]) < 0.1;
      
      return isRecent && isSameLocation;
    }).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }
}

export const alertsMapService = new AlertsMapService();

