import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertData, RouteInputTranslations } from '@/types/route';
import { localizeLocation } from '@/utils/localizeLocation';
interface SafetyAlertsSectionProps {
  relevantAlerts: AlertData[];
  translations: RouteInputTranslations;
  language: 'en' | 'ua';
}
const SafetyAlertsSection: React.FC<SafetyAlertsSectionProps> = ({
  relevantAlerts,
  translations,
  language
}) => {
  const highAlertActivityText = {
    en: 'High alert activity detected on this route',
    ua: 'Виявлено високу активність сповіщень на цьому маршруті'
  };
  const getSeverityBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-600 text-white border-none';
      case 'moderate':
        return 'bg-orange-600 text-white border-none';
      case 'high':
      case 'critical':
        return 'bg-red-600 text-white border-none';
      default:
        return 'bg-gray-600 text-white border-none';
    }
  };
  if (relevantAlerts.length === 0) {
    return null;
  }
  return <div className="mb-4 glass-danger px-[6px] py-[6px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="hud-label !text-red-300/90">
            {translations.safetyAlerts}
          </span>
        </div>
        <Badge variant="outline" className="border-red-400/40 bg-red-500/15 text-red-300 text-xs px-3 py-1">
          <span className="hud-value mr-1">{relevantAlerts.length}</span> {translations.alertsCount}
        </Badge>
      </div>
      
      {/* Show ALL alerts */}
      <div className="space-y-2">
        {relevantAlerts.map((alert, index) => <div key={alert.id || index} className="flex items-center justify-between text-xs py-2 px-3 bg-red-500/10 backdrop-blur-sm rounded-lg border border-red-500/30">
            <span className="text-gray-200 flex-1 truncate pr-2">
              {localizeLocation(alert.location_name, language)}
            </span>
            <Badge className={`text-xs ${getSeverityBadgeStyle(alert.severity)}`}>
              {translations.severity[alert.severity] || alert.severity}
            </Badge>
          </div>)}
      </div>
      
      {/* Additional info if there are many alerts */}
      {relevantAlerts.length > 5 && <div className="text-xs text-red-300 text-center mt-2 pt-2 border-t border-red-700/50">
          {highAlertActivityText[language]}
        </div>}
    </div>;
};
export default SafetyAlertsSection;