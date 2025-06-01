
import React from 'react';
import { MapPin, Shield, Cloud, Gauge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteDetailsProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  routeData,
  translations
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrafficBadgeVariant = (level: string) => {
    switch (level) {
      case 'light': return 'default';
      case 'moderate': return 'secondary';
      case 'heavy': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{translations.routeDetails}</h3>
        </div>
        <Badge variant={routeData.realRoute ? "default" : "secondary"} className="text-xs px-2 py-1">
          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`} />
          {routeData.realRoute ? translations.live : translations.estimated}
        </Badge>
      </div>

      {/* Distance and Duration Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{translations.distance}</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {routeData.distanceFormatted || `${routeData.distance} km`}
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{translations.duration}</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {routeData.durationFormatted || `${routeData.duration}h`}
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-3">
        {/* Safety Risk */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-black dark:text-white" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{translations.conflictRisk}</span>
          </div>
          <span className={`text-sm font-semibold ${getRiskColor(routeData.conflictRisk)}`}>
            {translations.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
          </span>
        </div>
        
        {/* Traffic Level */}
        {routeData.trafficLevel && (
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{translations.trafficLevel}</span>
            </div>
            <Badge variant={getTrafficBadgeVariant(routeData.trafficLevel)} className="text-xs">
              {translations.trafficLevels[routeData.trafficLevel] || routeData.trafficLevel}
            </Badge>
          </div>
        )}
        
        {/* Weather */}
        {routeData.weatherCondition && (
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{translations.weather}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {translations.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
              </div>
              {routeData.temperature !== undefined && (
                <div className="text-xs text-gray-600 dark:text-gray-400">{routeData.temperature}°C</div>
              )}
            </div>
          </div>
        )}
        
        {/* Estimated Delay */}
        {routeData.estimatedDelay > 0 && (
          <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-black dark:text-white" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delay</span>
            </div>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              +{routeData.estimatedDelay}min
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetails;
