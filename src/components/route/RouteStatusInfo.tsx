
import React from 'react';
import { Shield, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteStatusInfoProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
  hasActiveThreats: boolean;
}

const RouteStatusInfo: React.FC<RouteStatusInfoProps> = ({ routeData, translations, hasActiveThreats }) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Active Threats Status */}
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white">Active Threats (72h)</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`text-sm font-semibold border-none ${hasActiveThreats ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {hasActiveThreats ? 'YES' : 'NO'}
          </Badge>
        </div>
      </div>
      
      {/* Weather */}
      {routeData.weatherCondition && (
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">{translations.weather}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-white">
              {translations.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
            </div>
            {routeData.temperature !== undefined && (
              <div className="text-xs text-gray-400">{routeData.temperature}°C</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteStatusInfo;
