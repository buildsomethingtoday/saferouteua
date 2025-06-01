
import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Navigation, Gauge, Cloud, AlertTriangle, Zap, Shield, Car, Bus } from 'lucide-react';
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
      realTimeData: 'Real-time Data',
      fallbackData: 'Estimated Data',
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
      realTimeData: 'Дані в реальному часі',
      fallbackData: 'Оціночні дані',
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

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return <Car className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
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

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'moderate': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[75vh] bg-gray-900 text-white">
        <DrawerHeader className="pb-3 bg-gray-900 text-white rounded-t-[10px]">
          <DrawerTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">{t.routeDetails}</span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto bg-gray-900">
          {/* Data Source Status */}
          <div className="flex items-center justify-between p-3 bg-blue-600 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">
                  {routeData.realRoute ? t.realTimeData : t.fallbackData}
                </span>
              </div>
            </div>
            <Badge variant={routeData.realRoute ? "default" : "secondary"} className="px-2 py-1 text-xs bg-green-500 text-white border-none">
              <div className={`w-1.5 h-1.5 rounded-full mr-1 bg-white`} />
              {routeData.realRoute ? 'Live' : 'Est.'}
            </Badge>
          </div>

          {/* Route Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs font-medium text-blue-600">{t.distance}</div>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {routeData.distanceFormatted || `${routeData.distance} km`}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs font-medium text-blue-600">{t.duration}</div>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {routeData.durationFormatted || `${routeData.duration}h`}
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          {routeData.transportMode && (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  {getTransportIcon(routeData.transportMode)}
                </div>
                <span className="text-sm font-medium text-gray-800">{t.transportMode}</span>
              </div>
              <span className="text-sm text-gray-700">
                {t.transportModes[routeData.transportMode]}
              </span>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-3">
            {/* Safety Risk */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">{t.conflictRisk}</span>
              </div>
              <span className="text-sm font-medium text-orange-600">
                {t.riskLevels[routeData.conflictRisk]}
              </span>
            </div>

            {/* Traffic Level */}
            {routeData.trafficLevel && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{t.trafficLevel}</span>
                </div>
                <Badge variant="secondary" className="px-3 py-1 text-xs bg-gray-800 text-white border-none">
                  {t.trafficLevels[routeData.trafficLevel]}
                </Badge>
              </div>
            )}

            {/* Weather */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">{t.weather}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  {t.weatherConditions[routeData.weatherCondition]}
                </div>
                {routeData.temperature && (
                  <div className="text-xs text-gray-600">{routeData.temperature}°C</div>
                )}
              </div>
            </div>

            {/* Road Quality */}
            {routeData.roadQuality && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{t.roadQuality}</span>
                </div>
                <Badge variant="outline" className="px-2 py-1 text-xs border-gray-300 text-gray-700">
                  {t.roadQualities[routeData.roadQuality]}
                </Badge>
              </div>
            )}
          </div>

          {/* Delay Alert */}
          {routeData.estimatedDelay !== undefined && routeData.estimatedDelay > 0 && (
            <div className="p-3 bg-orange-100 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-orange-800">
                    {t.estimatedDelay}: +{routeData.estimatedDelay} min
                  </span>
                  <div className="text-xs text-orange-700">Due to traffic conditions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileRouteDrawer;
