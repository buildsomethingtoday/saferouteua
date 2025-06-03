
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

  const translations: RouteInputTranslations = {
    from: language === 'en' ? 'From' : 'Звідки',
    to: language === 'en' ? 'To' : 'Куди',
    startCity: language === 'en' ? 'From' : 'Звідки',
    endCity: language === 'en' ? 'To' : 'Куди',
    startPlaceholder: language === 'en' ? 'Enter starting city...' : 'Введіть місто відправлення...',
    endPlaceholder: language === 'en' ? 'Enter destination city...' : 'Введіть місто призначення...',
    planRoute: language === 'en' ? 'Plan Route' : 'Планувати маршрут',
    alerts: language === 'en' ? 'Alerts' : 'Сповіщення',
    statistics: language === 'en' ? 'Statistics' : 'Статистика',
    searchPlaceholder: language === 'en' ? 'Search cities...' : 'Пошук міст...',
    searching: language === 'en' ? 'Searching route...' : 'Пошук маршруту...',
    distance: language === 'en' ? 'Distance' : 'Відстань',
    duration: language === 'en' ? 'Duration' : 'Тривалість',
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
    },
    alertsByType: language === 'en' ? 'Alerts by Type' : 'Сповіщення за типом',
    alertsByRegion: language === 'en' ? 'Alerts by Region' : 'Сповіщення за регіоном',
    timeFilter: language === 'en' ? 'Time Period' : 'Період часу',
    last7Days: language === 'en' ? 'Last 7 Days' : 'Останні 7 днів',
    last30Days: language === 'en' ? 'Last 30 Days' : 'Останні 30 днів',
    last90Days: language === 'en' ? 'Last 90 Days' : 'Останні 90 днів',
    allTime: language === 'en' ? 'All Time' : 'Весь час',
    noData: language === 'en' ? 'No data available' : 'Дані відсутні',
    loadingStats: language === 'en' ? 'Loading statistics...' : 'Завантаження статистики...',
    // New statistics translations
    statisticsTitle: language === 'en' ? 'Statistics' : 'Статистика',
    syncData: language === 'en' ? 'Sync Data' : 'Синхронізувати дані',
    syncing: language === 'en' ? 'Syncing...' : 'Синхронізація...',
    syncCompleted: language === 'en' ? 'Sync Completed' : 'Синхронізація завершена',
    syncFailed: language === 'en' ? 'Sync Failed' : 'Помилка синхронізації',
    syncError: language === 'en' ? 'Sync Error' : 'Помилка синхронізації',
    totalAlerts: language === 'en' ? 'Total Alerts' : 'Всього сповіщень',
    activeAlerts: language === 'en' ? 'Active Alerts' : 'Активні сповіщення',
    averageDaily: language === 'en' ? 'Daily Average' : 'Щоденне середнє',
    alertsOverTime: language === 'en' ? 'Alerts Over Time' : 'Сповіщення за часом',
    attackTiming: language === 'en' ? 'Attack Timing' : 'Час атак',
    morning: language === 'en' ? 'Morning (6-12)' : 'Ранок (6-12)',
    afternoon: language === 'en' ? 'Afternoon (12-18)' : 'День (12-18)',
    evening: language === 'en' ? 'Evening (18-24)' : 'Вечір (18-24)',
    night: language === 'en' ? 'Night (0-6)' : 'Ніч (0-6)',
    noStatisticsData: language === 'en' ? 'No statistics data available' : 'Статистичні дані відсутні'
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

        <RouteInput 
          translations={translations} 
          language={language}
        />

        {routeData.startCity && routeData.endCity && (
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
