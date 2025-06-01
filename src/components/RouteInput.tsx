
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, ArrowRight } from 'lucide-react';
import { useRouteSearch } from '../hooks/useRouteSearch';
import { RouteData, RouteInputTranslations } from '@/types/route';
import CityAutocomplete from './CityAutocomplete';

interface RouteInputProps {
  language: 'en' | 'ua';
  onRouteRequest: (data: RouteData) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

const RouteInput: React.FC<RouteInputProps> = ({ 
  language, 
  onRouteRequest, 
  isSearching, 
  setIsSearching 
}) => {
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');

  const translations: Record<'en' | 'ua', RouteInputTranslations> = {
    en: {
      title: 'Plan Your Route',
      startCity: 'From',
      endCity: 'To',
      startPlaceholder: 'Starting city',
      endPlaceholder: 'Destination city',
      returnRoute: 'Need return route?',
      searching: 'Finding route...',
      error: 'Error finding route. Please try again.'
    },
    ua: {
      title: 'Спланувати маршрут',
      startCity: 'Звідки',
      endCity: 'Куди',
      startPlaceholder: 'Місто відправлення',
      endPlaceholder: 'Місто призначення',
      returnRoute: 'Потрібен зворотний маршрут?',
      searching: 'Пошук маршруту...',
      error: 'Помилка пошуку маршруту. Спробуйте ще раз.'
    }
  };

  const t = translations[language];
  const { handleRouteSearch } = useRouteSearch({ translations: t, setIsSearching, onRouteRequest });

  // Auto-trigger route search when both cities are selected
  useEffect(() => {
    if (startCity && endCity && !isSearching) {
      console.log('Triggering route search for:', startCity, 'to', endCity);
      const timer = setTimeout(() => {
        handleRouteSearch(startCity, endCity, 'driving');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [startCity, endCity, isSearching, handleRouteSearch]);

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Navigation className="w-5 h-5 text-blue-500" />
          <span>{t.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cities in One Row */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.startCity}
            </label>
            <CityAutocomplete
              value={startCity}
              onChange={setStartCity}
              placeholder={t.startPlaceholder}
              language={language}
            />
          </div>
          
          <div className="flex items-center justify-center mt-5">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.endCity}
            </label>
            <CityAutocomplete
              value={endCity}
              onChange={setEndCity}
              placeholder={t.endPlaceholder}
              language={language}
            />
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-blue-700">{t.searching}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteInput;
