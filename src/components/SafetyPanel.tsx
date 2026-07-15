
import React, { useState, useEffect } from 'react';
import RouteInput from './RouteInput';
import SafetyAlertsSection from './route/SafetyAlertsSection';
import RouteDetailsHeader from './route/RouteDetailsHeader';
import RouteStatusInfo from './route/RouteStatusInfo';
import { getAlertsService } from '@/services/alertsService';
import { RouteData, RouteInputTranslations } from '@/types/route';
import { getRouteInputTranslations } from '@/data/translations';

interface SafetyPanelProps {
  language?: 'en' | 'ua';
}

const SafetyPanel: React.FC<SafetyPanelProps> = ({ language = 'en' }) => {
  const [routeData, setRouteData] = useState<RouteData>({
    startCity: '',
    endCity: '',
    realRoute: false,
    weatherCondition: 'clear',
    temperature: 20
  });
  const [relevantAlerts, setRelevantAlerts] = useState([]);
  const [hasActiveThreats, setHasActiveThreats] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (routeData.startCity && routeData.endCity) {
        const alertsService = getAlertsService();
        const alerts = await alertsService.getAlertsForCities(routeData.startCity, routeData.endCity);
        setRelevantAlerts(alerts);
        setHasActiveThreats(alerts.length > 0);
      } else {
        setRelevantAlerts([]);
        setHasActiveThreats(false);
      }
    };

    fetchAlerts();
  }, [routeData.startCity, routeData.endCity]);

  const translations: RouteInputTranslations = getRouteInputTranslations(language);

  const handleRouteUpdate = (newRouteData: RouteData) => {
    setRouteData(newRouteData);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-300">
          {translations.routeInformation}
        </h1>

        <RouteInput 
          translations={translations} 
          language={language}
        />

        {routeData.startCity && routeData.endCity && (
          <div className="mt-6">
            <RouteDetailsHeader routeData={routeData} translations={translations} language={language} />
            <RouteStatusInfo routeData={routeData} translations={translations} hasActiveThreats={hasActiveThreats} language={language} />
            <SafetyAlertsSection relevantAlerts={relevantAlerts} translations={translations} language={language} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyPanel;
