
import React from 'react';
import { RouteData, RouteInputTranslations } from '@/types/route';
import RouteDetailsHeader from './RouteDetailsHeader';
import SafetyAlertsSection from './SafetyAlertsSection';
import RouteStatusInfo from './RouteStatusInfo';

interface RouteDetailsProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
  language: 'en' | 'ua';
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  routeData,
  translations,
  language
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

  const hourUnit = language === 'en' ? 'H' : 'год';
  const minuteUnit = language === 'en' ? 'M' : 'хв';
  const kmUnit = language === 'en' ? 'km' : 'км';

  // Format duration from hours to hours and minutes
  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);

    if (hours === 0) {
      return `${minutes}${minuteUnit}`;
    } else if (minutes === 0) {
      return `${hours}${hourUnit}`;
    } else {
      return `${hours}${hourUnit} ${minutes}${minuteUnit}`;
    }
  };

  // Service-formatted strings arrive with English units ("489.6 km", "6h 7m") — localize them for ua
  const localizeUnits = (value: string) =>
    language === 'ua'
      ? value.replace(/\bkm\b/g, 'км').replace(/(\d)h\b/g, '$1год').replace(/(\d)m\b/g, '$1хв')
      : value;

  const distance = localizeUnits(routeData.distanceFormatted || `${routeData.distance} ${kmUnit}`);
  const duration = localizeUnits(routeData.durationFormatted || formatDuration(routeData.duration || 0));


  const travelInfoText = {
    en: 'Travel Information',
    ua: 'Інформація про подорож'
  };

  const willTakeText = {
    en: 'will take',
    ua: 'займе'
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <RouteDetailsHeader routeData={routeData} translations={translations} language={language} />

      {/* Travel Info - Weather Style */}
      <div className="mb-4 p-4 glass-card transition-colors duration-200 hover:bg-white/[0.07]">
        <div className="hud-label mb-2">{travelInfoText[language]}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-white hud-value">{distance}</span>
          <span className="text-sm text-white/40">{willTakeText[language]}</span>
          <span className="text-2xl font-semibold text-white hud-value">{duration}</span>
        </div>
      </div>

      {/* Active Threats Status - Show BEFORE Safety Alerts */}
      <RouteStatusInfo
        routeData={routeData}
        translations={translations}
        hasActiveThreats={hasActiveThreats}
        language={language}
      />

      {/* Safety Alerts Section - Show AFTER Active Threats */}
      <SafetyAlertsSection relevantAlerts={relevantAlerts} translations={translations} language={language} />
    </div>
  );
};

export default RouteDetails;
