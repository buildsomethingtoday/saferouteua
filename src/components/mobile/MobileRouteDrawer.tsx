
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
      <DrawerContent className="max-h-[75vh] bg-gradient-to-br from-white to-gray-50/50">
        <DrawerHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-[10px]">
          <DrawerTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">{t.routeDetails}</span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto">
          {/* Data Source Status */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-emerald-800">
                  {routeData.realRoute ? t.realTimeData : t.fallbackData}
                </span>
              </div>
            </div>
            <Badge variant={routeData.realRoute ? "default" : "secondary"} className="px-2 py-1 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`} />
              {routeData.realRoute ? 'Live' : 'Est.'}
            </Badge>
          </div>

          {/* Route Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs font-medium text-blue-700">{t.distance}</div>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {routeData.distanceFormatted || `${routeData.distance} km`}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs font-medium text-purple-700">{t.duration}</div>
              </div>
              <div className="text-lg font-bold text-purple-900">
                {routeData.durationFormatted || `${routeData.duration}h`}
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          {routeData.transportMode && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
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

          {/* Traffic Info */}
          <div className="text-xs text-gray-600 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            {t.fastestRoute}
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            {/* Traffic Level */}
            {routeData.trafficLevel && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{t.trafficLevel}</span>
                </div>
                <Badge variant={getTrafficBadgeVariant(routeData.trafficLevel)} className="px-2 py-1 text-xs">
                  {t.trafficLevels[routeData.trafficLevel]}
                </Badge>
              </div>
            )}

            {/* Safety Risk */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{t.conflictRisk}</span>
              </div>
              <Badge variant={getRiskBadgeVariant(routeData.conflictRisk)} className="px-2 py-1 text-xs">
                {t.riskLevels[routeData.conflictRisk]}
              </Badge>
            </div>

            {/* Weather */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{t.weather}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-700">
                  {t.weatherConditions[routeData.weatherCondition]}
                </div>
                {routeData.temperature && (
                  <div className="text-xs text-gray-600">{routeData.temperature}°C</div>
                )}
              </div>
            </div>

            {/* Road Quality */}
            {routeData.roadQuality && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{t.roadQuality}</span>
                </div>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {t.roadQualities[routeData.roadQuality]}
                </Badge>
              </div>
            )}
          </div>

          {/* Delay Alert */}
          {routeData.estimatedDelay !== undefined && routeData.estimatedDelay > 0 && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
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
