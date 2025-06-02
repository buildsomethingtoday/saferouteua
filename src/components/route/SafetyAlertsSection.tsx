import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertData, RouteInputTranslations } from '@/types/route';
interface SafetyAlertsSectionProps {
  relevantAlerts: AlertData[];
  translations: RouteInputTranslations;
}
const SafetyAlertsSection: React.FC<SafetyAlertsSectionProps> = ({
  relevantAlerts,
  translations
}) => {
  // Extract language from translations to determine which language to use
  const language = translations.live === 'Live' ? 'en' : 'ua';
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
  return <div className="mb-4 p-4 bg-red-900/30 border-2 border-red-600 rounded-xl px-[6px] py-[6px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium text-red-400">
            {translations.safetyAlerts || 'Safety Alerts'}
          </span>
        </div>
        <Badge className="bg-red-600 text-white text-xs border-none px-3 py-1">
          {relevantAlerts.length} {translations.alertsCount || 'alerts'}
        </Badge>
      </div>
      
      {/* Show ALL alerts */}
      <div className="space-y-2">
        {relevantAlerts.map((alert, index) => <div key={alert.id || index} className="flex items-center justify-between text-xs py-2 px-3 bg-red-900/20 rounded-lg border border-red-700/50">
            <span className="text-gray-200 flex-1 truncate pr-2">
              {alert.location_name}
            </span>
            <Badge className={`text-xs ${getSeverityBadgeStyle(alert.severity)}`}>
              {alert.severity}
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