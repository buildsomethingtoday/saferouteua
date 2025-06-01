
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from 'lucide-react';
import TransportModeSelector from './route/TransportModeSelector';
import RouteForm from './route/RouteForm';
import RouteSearchButton from './route/RouteSearchButton';
import { useRouteSearch } from '../hooks/useRouteSearch';
import { RouteData, RouteInputTranslations } from '@/types/route';

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
  const [needsReturn, setNeedsReturn] = useState(false);
  const [transportMode, setTransportMode] = useState<'driving' | 'bus'>('driving');

  const translations: Record<'en' | 'ua', RouteInputTranslations> = {
    en: {
      title: 'Plan Your Route',
      startCity: 'Starting city',
      endCity: 'Destination city',
      startPlaceholder: 'Enter starting city (e.g., Kyiv, Lviv, Odesa)',
      endPlaceholder: 'Enter destination city (e.g., Chernivtsi, Zakarpattia)',
      returnRoute: 'Need return route?',
      findRoute: 'Find Route',
      searching: 'Finding route...',
      transportMode: 'Transportation',
      driving: 'Driving',
      bus: 'Bus',
      error: 'Error finding route. Please try again.'
    },
    ua: {
      title: 'Спланувати маршрут',
      startCity: 'Місто відправлення',
      endCity: 'Місто призначення',
      startPlaceholder: 'Введіть місто відправлення (напр., Київ, Львів, Одеса)',
      endPlaceholder: 'Введіть місто призначення (напр., Чернівці, Закарпаття)',
      returnRoute: 'Потрібен зворотний маршрут?',
      findRoute: 'Знайти маршрут',
      searching: 'Пошук маршруту...',
      transportMode: 'Транспорт',
      driving: 'Автомобіль',
      bus: 'Автобус',
      error: 'Помилка пошуку маршруту. Спробуйте ще раз.'
    }
  };

  const t = translations[language];
  const { handleRouteSearch } = useRouteSearch({ translations: t, setIsSearching, onRouteRequest });

  const onSearchClick = () => {
    handleRouteSearch(startCity, endCity, transportMode);
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          <span>{t.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TransportModeSelector
          transportMode={transportMode}
          onTransportModeChange={setTransportMode}
          translations={t}
        />

        <RouteForm
          startCity={startCity}
          endCity={endCity}
          needsReturn={needsReturn}
          language={language}
          translations={t}
          onStartCityChange={setStartCity}
          onEndCityChange={setEndCity}
          onNeedsReturnChange={setNeedsReturn}
        />

        <RouteSearchButton
          isSearching={isSearching}
          disabled={!startCity || !endCity || isSearching}
          translations={t}
          onClick={onSearchClick}
        />
      </CardContent>
    </Card>
  );
};

export default RouteInput;
