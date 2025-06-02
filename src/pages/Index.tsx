
import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import LanguageToggle from '../components/LanguageToggle';
import MobileNavBar from '../components/MobileNavBar';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useIsMobile } from '../hooks/use-mobile';
import { RouteInputTranslations } from '@/types/route';

const Index = () => {
  const detectedLanguage = useLanguageDetection();
  const [language, setLanguage] = useState<'en' | 'ua'>(detectedLanguage);
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [focusAlert, setFocusAlert] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLanguage(detectedLanguage);
  }, [detectedLanguage]);

  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked in Index:', alert);
    setFocusAlert(alert);
  };

  // Create translations object based on current language
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
    loadingStats: language === 'en' ? 'Loading statistics...' : 'Завантаження статистики...'
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900">
        <MobileNavBar language={language} onLanguageChange={setLanguage} />
        
        {/* Mobile Layout - Full screen route input with top padding for navbar */}
        <div className="pt-16 p-4 min-h-screen">
          <RouteInput 
            translations={translations}
            language={language}
            onRouteRequest={setRouteData}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            routeData={routeData}
            selectedRegion={selectedRegion}
            onAlertClick={handleAlertClick}
          />
        </div>
      </div>
    );
  }

  // Desktop Layout - Increased card width from w-96 to w-[420px]
  return (
    <div className="min-h-screen relative">
      <InteractiveMap 
        language={language}
        routeData={routeData}
        isSearching={isSearching}
        onRegionSelect={setSelectedRegion}
        focusAlert={focusAlert}
      />

      <div className="absolute top-4 left-4 z-40 w-[420px] max-w-[calc(100vw-2rem)]">
        <RouteInput 
          translations={translations}
          language={language}
          onRouteRequest={setRouteData}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          routeData={routeData}
          selectedRegion={selectedRegion}
          onAlertClick={handleAlertClick}
        />
      </div>

      <div className="absolute bottom-4 right-4 z-40">
        <LanguageToggle 
          language={language} 
          onLanguageChange={setLanguage} 
        />
      </div>
    </div>
  );
};

export default Index;
