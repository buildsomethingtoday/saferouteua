
import { AlertData } from '@/types/alerts';

export class AlertsCalculator {
  static calculateDistance(coords1: [number, number], coords2: [number, number]): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = AlertsCalculator.deg2rad(coords2[1] - coords1[1]);
    const dLon = AlertsCalculator.deg2rad(coords2[0] - coords1[0]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(AlertsCalculator.deg2rad(coords1[1])) * Math.cos(AlertsCalculator.deg2rad(coords2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  static calculateRouteSafetyScore(alerts: AlertData[]): number {
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
}
