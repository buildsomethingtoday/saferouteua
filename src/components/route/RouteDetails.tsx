
import React from 'react';
import { MapPin, Shield, Cloud, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations } from '@/types/route';
import { doesAlertMatchCity, findOblastForCity } from '@/utils/cityOblastMapping';

interface RouteDetailsProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  routeData,
  translations
}) => {
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

  // Enhanced threat detection logic
  console.log('🎯 RouteDetails - Analyzing threats for route:', {
    startCity: routeData.startCity,
    endCity: routeData.endCity,
    totalAlerts: routeData.safetyAlerts?.length || 0
  });

  const relevantAlerts = routeData.safetyAlerts || [];
  console.log('📊 All alerts for analysis:', relevantAlerts.map(alert => ({
    id: alert.id,
    location: alert.location_name,
    oblast: alert.location_oblast,
    type: alert.alert_type,
    severity: alert.severity
  })));

  // Check for threats that affect the destination city specifically
  const destinationThreats = relevantAlerts.filter(alert => {
    const endCity = routeData.endCity || '';
    
    console.log('🔍 Checking destination threat for:', endCity, 'against alert:', {
      alertId: alert.id,
      alertLocation: alert.location_name,
      alertOblast: alert.location_oblast
    });
    
    const matchesDestination = doesAlertMatchCity(
      alert.location_name || '', 
      alert.location_oblast || '', 
      endCity
    );
    
    if (matchesDestination) {
      console.log('✅ Destination threat found:', {
        endCity,
        alertLocation: alert.location_name,
        alertOblast: alert.location_oblast,
        severity: alert.severity
      });
    }
    
    return matchesDestination;
  });

  // Check for threats that affect either start or end city (route threats)
  const routeThreats = relevantAlerts.filter(alert => {
    const startCity = routeData.startCity || '';
    const endCity = routeData.endCity || '';
    
    const matchesStart = doesAlertMatchCity(
      alert.location_name || '', 
      alert.location_oblast || '', 
      startCity
    );
    
    const matchesEnd = doesAlertMatchCity(
      alert.location_name || '', 
      alert.location_oblast || '', 
      endCity
    );
    
    return matchesStart || matchesEnd;
  });

  const hasDestinationThreats = destinationThreats.length > 0;
  const hasRouteThreats = routeThreats.length > 0;
  const finalHasThreats = hasDestinationThreats || hasRouteThreats;
  
  console.log('🎯 Final threat analysis result:', {
    endCity: routeData.endCity,
    destinationThreatsCount: destinationThreats.length,
    routeThreatsCount: routeThreats.length,
    hasDestinationThreats,
    hasRouteThreats,
    finalHasThreats,
    destinationThreatDetails: destinationThreats.map(alert => ({
      location: alert.location_name,
      oblast: alert.location_oblast,
      severity: alert.severity
    })),
    routeThreatDetails: routeThreats.map(alert => ({
      location: alert.location_name,
      oblast: alert.location_oblast,
      severity: alert.severity
    }))
  });

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-300 mr-2">Route Information</span>
        </div>
        <Badge variant={routeData.realRoute ? "default" : "secondary"} className={`text-xs px-3 py-1 relative ${routeData.realRoute ? 'bg-green-600' : 'bg-blue-600'} text-white border-none`}>
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

      {/* Distance and Duration Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 bg-gray-800 rounded-xl">
          <div className="text-sm font-medium text-blue-400 mb-1">{translations.distance}</div>
          <div className="text-2xl font-semibold text-blue-400">
            {routeData.distanceFormatted || `${routeData.distance} km`}
          </div>
        </div>
        <div className="text-center p-4 bg-gray-800 rounded-xl">
          <div className="text-sm font-medium text-blue-400 mb-1">{translations.duration}</div>
          <div className="text-2xl font-semibold text-blue-400">
            {routeData.durationFormatted || `${routeData.duration}h`}
          </div>
        </div>
      </div>

      {/* Safety Alerts Section - show if there are any route threats */}
      {finalHasThreats && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                {translations.safetyAlerts || 'Safety Alerts'}
              </span>
            </div>
            <Badge className="bg-red-600 text-white text-xs border-none">
              {routeThreats.length} {translations.alertsCount || 'alerts'}
            </Badge>
          </div>
          <div className="space-y-2">
            {routeThreats.slice(0, 3).map((alert, index) => (
              <div key={alert.id || index} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate">{alert.location_name}</span>
                <Badge className={`text-xs ${getStatusBadgeStyle(alert.severity)}`}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
            {routeThreats.length > 3 && (
              <div className="text-xs text-gray-400 text-center">
                +{routeThreats.length - 3} more alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="space-y-3">
        {/* Active Threats Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Active Threats (72h)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`text-sm font-semibold border-none ${finalHasThreats ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
              {finalHasThreats ? 'YES' : 'NO'}
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
    </div>
  );
};

export default RouteDetails;
