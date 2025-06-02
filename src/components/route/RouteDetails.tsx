
import React from 'react';
import { RouteData, RouteInputTranslations } from '@/types/route';
import RouteDetailsHeader from './RouteDetailsHeader';
import SafetyAlertsSection from './SafetyAlertsSection';
import RouteStatusInfo from './RouteStatusInfo';

interface RouteDetailsProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  routeData,
  translations
}) => {
  console.log('🎯 RouteDetails - Starting threat analysis:', {
    startCity: routeData.startCity,
    endCity: routeData.endCity,
    totalAlerts: routeData.safetyAlerts?.length || 0,
    alerts: routeData.safetyAlerts?.map(alert => ({
      id: alert.id,
      location: alert.location_name,
      oblast: alert.location_oblast,
      type: alert.alert_type,
      severity: alert.severity
    })) || []
  });

  const relevantAlerts = routeData.safetyAlerts || [];
  
  // SIMPLIFIED: If we have ANY safety alerts for this route, there are threats
  const hasActiveThreats = relevantAlerts.length > 0;
  
  console.log('🎯 SIMPLIFIED threat analysis result:', {
    alertsCount: relevantAlerts.length,
    hasActiveThreats,
    alertDetails: relevantAlerts.map(alert => ({
      id: alert.id,
      location: alert.location_name,
      oblast: alert.location_oblast,
      severity: alert.severity
    }))
  });

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <RouteDetailsHeader routeData={routeData} translations={translations} />
      
      {/* Compact Distance & Duration */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-600">
          <div className="text-sm text-blue-400 mb-1">{translations.distance}</div>
          <div className="text-xl font-bold text-blue-400">
            {routeData.distanceFormatted || `${routeData.distance} km`}
          </div>
        </div>
        
        <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-600">
          <div className="text-sm text-purple-400 mb-1">{translations.duration}</div>
          <div className="text-xl font-bold text-purple-400">
            {routeData.durationFormatted || `${routeData.duration}h`}
          </div>
        </div>
      </div>

      <SafetyAlertsSection relevantAlerts={relevantAlerts} translations={translations} />

      <RouteStatusInfo 
        routeData={routeData} 
        translations={translations} 
        hasActiveThreats={hasActiveThreats} 
      />
    </div>
  );
};

export default RouteDetails;
