
import React from 'react';
import { MapPin, Shield, Cloud } from 'lucide-react';
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
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
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
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{translations.routeDetails}</span>
        </div>
        <Badge variant={routeData.realRoute ? "default" : "secondary"} className="text-xs px-2 py-0.5">
          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`} />
          {routeData.realRoute ? translations.live : translations.estimated}
        </Badge>
      </div>

      {/* Route Summary */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-xs text-blue-600 font-medium mb-1">{translations.distance}</div>
          <div className="text-lg font-bold text-gray-900">
            {routeData.distanceFormatted || `${routeData.distance} km`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-purple-600 font-medium mb-1">{translations.duration}</div>
          <div className="text-lg font-bold text-gray-900">
            {routeData.durationFormatted || `${routeData.duration}h`}
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-amber-500" />
            <span className="text-gray-600">{translations.conflictRisk}</span>
          </div>
          <span className={`font-medium ${getRiskColor(routeData.conflictRisk)}`}>
            {translations.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
          </span>
        </div>
        
        {routeData.trafficLevel && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{translations.trafficLevel}</span>
            <Badge variant={getTrafficBadgeVariant(routeData.trafficLevel)} className="text-xs px-1 py-0">
              {translations.trafficLevels[routeData.trafficLevel] || routeData.trafficLevel}
            </Badge>
          </div>
        )}
        
        {routeData.weatherCondition && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Cloud className="w-3 h-3 text-sky-500" />
              <span className="text-gray-600">{translations.weather}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-900 font-medium">
                {translations.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
              </span>
              {routeData.temperature !== undefined && (
                <div className="text-gray-600">{routeData.temperature}°C</div>
              )}
            </div>
          </div>
        )}
        
        {routeData.estimatedDelay > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span className="text-gray-600">Delay</span>
            </div>
            <span className="text-orange-600 font-medium">
              +{routeData.estimatedDelay}min
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetails;
