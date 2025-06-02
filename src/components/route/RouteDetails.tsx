
import React from 'react';
import { RouteData, RouteInputTranslations } from '@/types/route';
import RouteDetailsHeader from './RouteDetailsHeader';
import RouteStats from './RouteStats';
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
      
      <RouteStats routeData={routeData} translations={translations} />

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
