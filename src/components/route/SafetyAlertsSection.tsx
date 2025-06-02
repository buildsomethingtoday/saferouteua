
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations, AlertData } from '@/types/route';

interface SafetyAlertsSectionProps {
  relevantAlerts: AlertData[];
  translations: RouteInputTranslations;
}

const SafetyAlertsSection: React.FC<SafetyAlertsSectionProps> = ({ relevantAlerts, translations }) => {
  const getStatusBadgeStyle = (level: string) => {
    switch (level) {
      case 'low':
      case 'light': 
        return 'bg-green-600 text-white border-none';
      case 'moderate': 
        return 'bg-yellow-600 text-white border-none';
      case 'high':
      case 'heavy': 
        return 'bg-red-600 text-white border-none';
      case 'critical':
        return 'bg-red-800 text-white border-none';
      default: 
        return 'bg-gray-600 text-white border-none';
    }
  };

  if (relevantAlerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium text-red-400">
            {translations.safetyAlerts || 'Safety Alerts'}
          </span>
        </div>
        <Badge className="bg-red-600 text-white text-xs border-none">
          {relevantAlerts.length} {translations.alertsCount || 'alerts'}
        </Badge>
      </div>
      <div className="space-y-2">
        {relevantAlerts.slice(0, 3).map((alert, index) => (
          <div key={alert.id || index} className="flex items-center justify-between text-xs">
            <span className="text-gray-300 truncate">{alert.location_name}</span>
            <Badge className={`text-xs ${getStatusBadgeStyle(alert.severity)}`}>
              {alert.severity}
            </Badge>
          </div>
        ))}
        {relevantAlerts.length > 3 && (
          <div className="text-xs text-gray-400 text-center">
            +{relevantAlerts.length - 3} more alerts
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyAlertsSection;
