import React, { useState, useEffect } from 'react';
import RouteInput from './RouteInput';
import SafetyAlertsSection from './route/SafetyAlertsSection';
import RouteDetailsHeader from './route/RouteDetailsHeader';
import RouteStatusInfo from './route/RouteStatusInfo';
import { getAlertsService } from '@/services/alertsService';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface SafetyPanelProps {
  language?: 'en' | 'ua';
}

const SafetyPanel: React.FC<SafetyPanelProps> = ({ language = 'en' }) => {
  const [routeData, setRouteData] = useState<RouteData>({
    fromCity: '',
    toCity: '',
    realRoute: false,
    weatherCondition: 'clear',
    temperature: 20
  });
  const [relevantAlerts, setRelevantAlerts] = useState([]);
  const [hasActiveThreats, setHasActiveThreats] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (routeData.fromCity && routeData.toCity) {
        const alertsService = getAlertsService();
        const alerts = await alertsService.getAlertsForCities(routeData.fromCity, routeData.toCity);
        setRelevantAlerts(alerts);
        setHasActiveThreats(alerts.length > 0);
      } else {
        setRelevantAlerts([]);
        setHasActiveThreats(false);
      }
    };

    fetchAlerts();
  }, [routeData.fromCity, routeData.toCity]);

  const translations: RouteInputTranslations = {
    from: language === 'en' ? 'From' : 'Звідки',
    to: language === 'en' ? 'To' : 'Куди',
    planRoute: language === 'en' ? 'Plan Route' : 'Планувати маршрут',
    alerts: language === 'en' ? 'Alerts' : 'Сповіщення',
    statistics: language === 'en' ? 'Statistics' : 'Статистика',
    searchPlaceholder: language === 'en' ? 'Search cities...' : 'Пошук міст...',
    routeInformation: language === 'en' ? 'Route Information' : 'Інформація про маршрут',
    safetyAlerts: language === 'en' ? 'Safety Alerts' : 'Сповіщення безпеки',
    alertsCount: language === 'en' ? 'alerts' : 'сповіщень',
    live: language === 'en' ? 'Live' : 'Прямий ефір',
    estimated: language === 'en' ? 'Estimated' : 'Приблизно',
    weather: language === 'en' ? 'Weather' : 'Погода',
    weatherConditions: {
      clear: language === 'en' ? 'Clear' : 'Ясно',
      cloudy: language === 'en' ? 'Cloudy' : 'Хмарно',
      rainy: language === 'en' ? 'Rainy' : 'Дощ',
      snowy: language === 'en' ? 'Snowy' : 'Сніг'
    }
  };

  const handleRouteUpdate = (newRouteData: RouteData) => {
    setRouteData(newRouteData);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-300">
          {translations.routeInformation}
        </h1>

        <RouteInput translations={translations} onRouteUpdate={handleRouteUpdate} />

        {routeData.fromCity && routeData.toCity && (
          <div className="mt-6">
            <RouteDetailsHeader routeData={routeData} translations={translations} />
            <RouteStatusInfo routeData={routeData} translations={translations} hasActiveThreats={hasActiveThreats} />
            <SafetyAlertsSection relevantAlerts={relevantAlerts} translations={translations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyPanel;
