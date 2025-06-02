
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

  // Format duration from hours to hours and minutes
  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (hours === 0) {
      return `${minutes}M`;
    } else if (minutes === 0) {
      return `${hours}H`;
    } else {
      return `${hours}H ${minutes}M`;
    }
  };

  const distance = routeData.distanceFormatted || `${routeData.distance} km`;
  const duration = routeData.durationFormatted || formatDuration(routeData.duration || 0);

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <RouteDetailsHeader routeData={routeData} translations={translations} />
      
      {/* Travel Info - Weather Style */}
      <div className="mb-4 p-4 bg-gray-800/60 rounded-xl border border-gray-600">
        <div className="text-sm text-gray-400 mb-2">Travel Information</div>
        <div className="text-lg font-semibold text-white">
          {distance} will take {duration}
        </div>
      </div>

      {/* Active Threats Status - Show BEFORE Safety Alerts */}
      <RouteStatusInfo 
        routeData={routeData} 
        translations={translations} 
        hasActiveThreats={hasActiveThreats} 
      />

      {/* Safety Alerts Section - Show AFTER Active Threats */}
      <SafetyAlertsSection relevantAlerts={relevantAlerts} translations={translations} />
    </div>
  );
};

export default RouteDetails;
