
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

    return rawAlerts.map(alert => ({
      id: alert.id,
      location_title: alert.location_title,
      location_oblast: alert.location_oblast,
      alert_type: alert.alert_type,
      started_at: alert.started_at,
      coordinates: this.oblastCenters[alert.location_oblast] || [31.1656, 48.3794],
      severity: this.mapAlertSeverity(alert.alert_type)
    }));
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
}

export const alertsMapService = new AlertsMapService();
