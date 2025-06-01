
import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Clock, MapPin, Navigation, Gauge, Cloud, AlertTriangle } from 'lucide-react';
import { RouteData } from '@/types/route';

interface MobileRouteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  language: 'en' | 'ua';
}

const MobileRouteDrawer: React.FC<MobileRouteDrawerProps> = ({
  isOpen,
  onClose,
  routeData,
  language
}) => {
  const translations = {
    en: {
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      transportMode: 'Transport',
      weather: 'Weather',
      temperature: 'Temperature',
      conflictRisk: 'Safety Risk',
      trafficLevel: 'Traffic',
      roadQuality: 'Road Quality',
      estimatedDelay: 'Delay',
      fastestRoute: 'Fastest route now due to traffic conditions',
      transportModes: {
        driving: 'Driving',
        bus: 'Bus'
      },
      weatherConditions: {
        clear: 'Clear',
        cloudy: 'Cloudy',
        light_rain: 'Light rain'
      },
      riskLevels: {
        low: 'Low',
        moderate: 'Moderate',
        high: 'High'
      },
      trafficLevels: {
        light: 'Light',
        moderate: 'Moderate',
        heavy: 'Heavy'
      },
      roadQualities: {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair'
      }
    },
    ua: {
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Час',
      transportMode: 'Транспорт',
      weather: 'Погода',
      temperature: 'Температура',
      conflictRisk: 'Ризик безпеки',
      trafficLevel: 'Трафік',
      roadQuality: 'Дороги',
      estimatedDelay: 'Затримка',
      fastestRoute: 'Найшвидший маршрут зараз через умови руху',
      transportModes: {
        driving: 'Автомобіль',
        bus: 'Автобус'
      },
      weatherConditions: {
        clear: 'Ясно',
        cloudy: 'Хмарно',
        light_rain: 'Дощ'
      },
      riskLevels: {
        low: 'Низький',
        moderate: 'Помірний',
        high: 'Високий'
      },
      trafficLevels: {
        light: 'Легкий',
        moderate: 'Помірний',
        heavy: 'Важкий'
      },
      roadQualities: {
        excellent: 'Відмінні',
        good: 'Хороші',
        fair: 'Задовільні'
      }
    }
  };

  const t = translations[language];

  if (!routeData) return null;

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'light': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'heavy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[60vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <span>{t.routeDetails}</span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Route Summary */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-sm font-medium text-blue-900">
                {routeData.durationFormatted || `${routeData.duration}h`} ({routeData.distanceFormatted || `${routeData.distance} km`})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700">
                {t.transportModes[routeData.transportMode]}
              </span>
            </div>
          </div>

          {/* Traffic Info */}
          <div className="text-xs text-gray-600 px-3">
            {t.fastestRoute}
          </div>

          {/* Route Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Traffic Level */}
            {routeData.trafficLevel && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium">{t.trafficLevel}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getTrafficColor(routeData.trafficLevel)}`}>
                  {t.trafficLevels[routeData.trafficLevel]}
                </span>
              </div>
            )}

            {/* Safety Risk */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium">{t.conflictRisk}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(routeData.conflictRisk)}`}>
                {t.riskLevels[routeData.conflictRisk]}
              </span>
            </div>

            {/* Weather */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium">{t.weather}</span>
              </div>
              <span className="text-xs text-gray-700">
                {t.weatherConditions[routeData.weatherCondition]}
                {routeData.temperature && ` ${routeData.temperature}°C`}
              </span>
            </div>

            {/* Road Quality */}
            {routeData.roadQuality && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium">{t.roadQuality}</span>
                </div>
                <span className="text-xs text-gray-700">
                  {t.roadQualities[routeData.roadQuality]}
                </span>
              </div>
            )}
          </div>

          {/* Delay Info */}
          {routeData.estimatedDelay !== undefined && routeData.estimatedDelay > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  {t.estimatedDelay}: +{routeData.estimatedDelay} min
                </span>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileRouteDrawer;
