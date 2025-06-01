
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, ArrowRight, Shield, MapPin, Clock, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouteSearch } from '../hooks/useRouteSearch';
import { RouteData, RouteInputTranslations } from '@/types/route';
import CityAutocomplete from './CityAutocomplete';

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
  const [hasTriggeredSearch, setHasTriggeredSearch] = useState(false);

  const translations: Record<'en' | 'ua', RouteInputTranslations> = {
    en: {
      title: 'Plan Your Route',
      startCity: 'From',
      endCity: 'To',
      startPlaceholder: 'Starting city',
      endPlaceholder: 'Destination city',
      returnRoute: 'Need return route?',
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

  // Auto-trigger route search when both cities are selected (only once)
  useEffect(() => {
    if (startCity && endCity && !isSearching && !hasTriggeredSearch) {
      console.log('🎯 Triggering route search for:', startCity, 'to', endCity);
      setHasTriggeredSearch(true);
      const timer = setTimeout(() => {
        handleRouteSearch(startCity, endCity, 'driving');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [startCity, endCity, isSearching, hasTriggeredSearch, handleRouteSearch]);

  // Reset search trigger when cities are cleared
  useEffect(() => {
    if (!startCity || !endCity) {
      setHasTriggeredSearch(false);
    }
  }, [startCity, endCity]);

  // Ukraine flag emoji component
  const UkraineFlag = () => (
    <span className="text-lg" role="img" aria-label="Ukraine flag">🇺🇦</span>
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrafficBadgeVariant = (level: string) => {
    switch (level) {
      case 'light': return 'default';
      case 'moderate': return 'secondary';
      case 'heavy': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
      {/* Header with SafeRoute UA branding */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-yellow-400 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h1 className="text-sm font-bold text-gray-900">{t.appTitle}</h1>
                <UkraineFlag />
              </div>
              <p className="text-xs text-gray-600">{t.appSubtitle}</p>
            </div>
          </div>
        </div>
        
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

        {/* Error State */}
        {routeData?.error && !isSearching && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-sm font-medium text-red-700">Route Error</span>
            </div>
            <p className="text-sm text-red-600">{routeData.error}</p>
            <p className="text-xs text-red-500 mt-1">
              Please check your internet connection and try again, or try different city names.
            </p>
          </div>
        )}

        {/* Route Details - Only show when route data exists and no error */}
        {routeData && !routeData.error && !isSearching && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Route Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{t.routeDetails}</span>
              </div>
              <Badge variant={routeData.realRoute ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`} />
                {routeData.realRoute ? t.live : t.estimated}
              </Badge>
            </div>

            {/* Route Summary */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">{t.distance}</div>
                <div className="text-lg font-bold text-gray-900">
                  {routeData.distanceFormatted || `${routeData.distance} km`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-600 font-medium mb-1">{t.duration}</div>
                <div className="text-lg font-bold text-gray-900">
                  {routeData.durationFormatted || `${routeData.duration}h`}
                </div>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span className="text-gray-600">{t.conflictRisk}</span>
                </div>
                <span className={`font-medium ${getRiskColor(routeData.conflictRisk)}`}>
                  {t.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
                </span>
              </div>
              
              {routeData.trafficLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t.trafficLevel}</span>
                  <Badge variant={getTrafficBadgeVariant(routeData.trafficLevel)} className="text-xs px-1 py-0">
                    {t.trafficLevels[routeData.trafficLevel] || routeData.trafficLevel}
                  </Badge>
                </div>
              )}
              
              {routeData.weatherCondition && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Cloud className="w-3 h-3 text-sky-500" />
                    <span className="text-gray-600">{t.weather}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-medium">
                      {t.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
                    </span>
                    {routeData.temperature !== undefined && (
                      <div className="text-gray-600">{routeData.temperature}°C</div>
                    )}
                  </div>
                </div>
              )}
              
              {routeData.estimatedDelay > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span className="text-gray-600">Delay</span>
                  </div>
                  <span className="text-orange-600 font-medium">
                    +{routeData.estimatedDelay}min
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteInput;
