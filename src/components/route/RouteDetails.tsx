
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
      case 'low': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'low':
      case 'light': 
        return 'bg-green-600 text-white border-none';
      case 'moderate': 
        return 'bg-yellow-600 text-white border-none';
      case 'high':
      case 'heavy': 
        return 'bg-red-600 text-white border-none';
      default: 
        return 'bg-gray-600 text-white border-none';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-300 mr-2">Route Information</span>
          <Badge variant={routeData.realRoute ? "default" : "secondary"} className={`text-xs px-3 py-1 relative ${routeData.realRoute ? 'bg-black' : 'bg-blue-600'} text-white`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`}>
              {routeData.realRoute && (
                <>
                  <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </>
              )}
            </div>
            {routeData.realRoute ? 'Live Data' : translations.estimated}
          </Badge>
        </div>
      </div>

      {/* Distance and Duration Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 bg-gray-800 rounded-xl">
          <div className="text-sm font-medium text-blue-400 mb-1">{translations.distance}</div>
          <div className="text-2xl font-bold text-blue-400">
            {routeData.distanceFormatted || `${routeData.distance} km`}
          </div>
        </div>
        <div className="text-center p-4 bg-gray-800 rounded-xl">
          <div className="text-sm font-medium text-blue-400 mb-1">{translations.duration}</div>
          <div className="text-2xl font-bold text-blue-400">
            {routeData.durationFormatted || `${routeData.duration}h`}
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-3">
        {/* Safety Risk */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">{translations.conflictRisk}</span>
          </div>
          <Badge className={`text-sm font-semibold ${getBadgeStyle(routeData.conflictRisk)}`}>
            {translations.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
          </Badge>
        </div>
        
        {/* Traffic Level */}
        {routeData.trafficLevel && (
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Gauge className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white">{translations.trafficLevel}</span>
            </div>
            <Badge className={`text-sm font-semibold ${getBadgeStyle(routeData.trafficLevel)}`}>
              {translations.trafficLevels[routeData.trafficLevel] || routeData.trafficLevel}
            </Badge>
          </div>
        )}
        
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
        
        {/* Estimated Delay */}
        {routeData.estimatedDelay > 0 && (
          <div className="flex items-center justify-between p-3 bg-orange-900 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white">Delay</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">
              +{routeData.estimatedDelay}min
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetails;
