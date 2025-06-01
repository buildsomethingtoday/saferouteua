
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from 'lucide-react';
import { useRouteSearch } from '../hooks/useRouteSearch';
import { RouteData, RouteInputTranslations } from '@/types/route';
import RouteHeader from './route/RouteHeader';
import CityInputForm from './route/CityInputForm';
import RouteStatus from './route/RouteStatus';
import RouteDetails from './route/RouteDetails';

interface RouteInputProps {
  language: 'en' | 'ua';
  onRouteRequest: (data: RouteData) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  routeData?: RouteData | null;
}

const RouteInput: React.FC<RouteInputProps> = ({ 
  language,
  onRouteRequest, 
  isSearching, 
  setIsSearching,
  routeData
}) => {
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');
  const lastSearchRef = useRef<string>('');

  const translations: Record<'en' | 'ua', RouteInputTranslations> = {
    en: {
      title: 'Plan Your Route',
      startCity: 'From',
      endCity: 'To',
      startPlaceholder: 'Starting city',
      endPlaceholder: 'Destination city',
      returnRoute: 'Need return route?',
      findRoute: 'Find Route',
      searching: 'Finding route...',
      error: 'Error finding route. Please try again.',
      appTitle: 'SafeRoute UA',
      appSubtitle: 'Navigate Ukraine safely',
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      weather: 'Weather',
      conflictRisk: 'Safety Risk',
      trafficLevel: 'Traffic',
      live: 'Live',
      estimated: 'Est.',
      riskLevels: {
        low: 'Safe',
        moderate: 'Caution',
        high: 'Risk'
      },
      weatherConditions: {
        clear: 'Clear',
        cloudy: 'Cloudy',
        light_rain: 'Light rain'
      },
      trafficLevels: {
        light: 'Light',
        moderate: 'Moderate',
        heavy: 'Heavy'
      }
    },
    ua: {
      title: 'Спланувати маршрут',
      startCity: 'Звідки',
      endCity: 'Куди',
      startPlaceholder: 'Місто відправлення',
      endPlaceholder: 'Місто призначення',
      returnRoute: 'Потрібен зворотний маршрут?',
      findRoute: 'Знайти маршрут',
      searching: 'Пошук маршруту...',
      error: 'Помилка пошуку маршруту. Спробуйте ще раз.',
      appTitle: 'SafeRoute UA',
      appSubtitle: 'Безпечна навігація Україною',
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Час',
      weather: 'Погода',
      conflictRisk: 'Ризик безпеки',
      trafficLevel: 'Трафік',
      live: 'Онлайн',
      estimated: 'Оцін.',
      riskLevels: {
        low: 'Безпечно',
        moderate: 'Обережно',
        high: 'Ризик'
      },
      weatherConditions: {
        clear: 'Ясно',
        cloudy: 'Хмарно',
        light_rain: 'Невеликий дощ'
      },
      trafficLevels: {
        light: 'Легкий',
        moderate: 'Помірний',
        heavy: 'Важкий'
      }
    }
  };

  const t = translations[language];
  const { handleRouteSearch } = useRouteSearch({ translations: t, setIsSearching, onRouteRequest });

  // Automatically trigger route search when both cities are selected
  useEffect(() => {
    if (startCity && endCity && !isSearching) {
      const searchKey = `${startCity}-${endCity}`;
      
      // Prevent duplicate searches
      if (lastSearchRef.current === searchKey) {
        return;
      }
      
      // Small delay to avoid rapid API calls while typing
      const searchTimer = setTimeout(() => {
        console.log('🎯 Auto-triggering route search for:', startCity, 'to', endCity);
        lastSearchRef.current = searchKey;
        handleRouteSearch(startCity, endCity, 'driving');
      }, 500);

      return () => clearTimeout(searchTimer);
    }
  }, [startCity, endCity, handleRouteSearch, isSearching]);

  // Reset last search when cities change significantly
  useEffect(() => {
    if (!startCity || !endCity) {
      lastSearchRef.current = '';
      if (routeData) {
        console.log('🧹 Clearing route data due to empty cities');
        onRouteRequest(null);
      }
    }
  }, [startCity, endCity, routeData, onRouteRequest]);

  // Debug route data changes
  useEffect(() => {
    if (routeData) {
      console.log('📊 RouteInput received route data:', {
        hasError: !!routeData.error,
        realRoute: routeData.realRoute,
        startCity: routeData.startCity,
        endCity: routeData.endCity,
        error: routeData.error
      });
    }
  }, [routeData]);

  return (
    <Card className="bg-gray-900 border border-gray-700 shadow-xl text-white">
      <CardHeader className="pb-3">
        <RouteHeader translations={t} />
        
        <CardTitle className="flex items-center space-x-2 text-lg text-white">
          <Navigation className="w-5 h-5 text-blue-400" />
          <span>{t.title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CityInputForm
          startCity={startCity}
          endCity={endCity}
          language={language}
          translations={t}
          onStartCityChange={setStartCity}
          onEndCityChange={setEndCity}
        />

        <RouteStatus
          isSearching={isSearching}
          routeData={routeData}
          translations={t}
        />

        {routeData && !routeData.error && !isSearching && (
          <RouteDetails
            routeData={routeData}
            translations={t}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RouteInput;
