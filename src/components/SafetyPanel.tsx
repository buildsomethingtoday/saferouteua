
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Clock, AlertTriangle, Share, Bookmark, Car, MapPin, Bus, Gauge, Zap, Shield } from 'lucide-react';

interface SafetyPanelProps {
  language: 'en' | 'ua';
  routeData: any;
}

const SafetyPanel: React.FC<SafetyPanelProps> = ({ language, routeData }) => {
  const translations = {
    en: {
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      weather: 'Weather',
      temperature: 'Temperature',
      conflictRisk: 'Safety Risk',
      trafficLevel: 'Traffic Level',
      roadQuality: 'Road Quality',
      estimatedDelay: 'Traffic Delay',
      shareRoute: 'Share Route',
      saveRoute: 'Save Route',
      transportMode: 'Transport Mode',
      realTimeData: 'Real-time Data',
      fallbackData: 'Estimated Data',
      weatherConditions: {
        clear: 'Clear skies',
        cloudy: 'Cloudy',
        light_rain: 'Light rain'
      },
      riskLevels: {
        low: 'Low risk',
        moderate: 'Moderate risk',
        high: 'High risk'
      },
      transportModes: {
        driving: 'Driving',
        bus: 'Bus'
      },
      trafficLevels: {
        light: 'Light traffic',
        moderate: 'Moderate traffic',
        heavy: 'Heavy traffic'
      },
      roadQualities: {
        excellent: 'Excellent roads',
        good: 'Good roads',
        fair: 'Fair roads'
      }
    },
    ua: {
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Тривалість',
      weather: 'Погода',
      temperature: 'Температура',
      conflictRisk: 'Ризик безпеки',
      trafficLevel: 'Рівень трафіку',
      roadQuality: 'Якість доріг',
      estimatedDelay: 'Затримка через трафік',
      shareRoute: 'Поділитися маршрутом',
      saveRoute: 'Зберегти маршрут',
      transportMode: 'Вид транспорту',
      realTimeData: 'Дані в реальному часі',
      fallbackData: 'Оціночні дані',
      weatherConditions: {
        clear: 'Ясне небо',
        cloudy: 'Хмарно',
        light_rain: 'Невеликий дощ'
      },
      riskLevels: {
        low: 'Низький ризик',
        moderate: 'Помірний ризик',
        high: 'Високий ризик'
      },
      transportModes: {
        driving: 'Автомобіль',
        bus: 'Автобус'
      },
      trafficLevels: {
        light: 'Легкий трафік',
        moderate: 'Помірний трафік',
        heavy: 'Важкий трафік'
      },
      roadQualities: {
        excellent: 'Відмінні дороги',
        good: 'Хороші дороги',
        fair: 'Задовільні дороги'
      }
    }
  };

  const t = translations[language];

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
    <Card className="shadow-xl bg-gradient-to-br from-white to-gray-50/50 border-0 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold">{t.routeDetails}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Data Source Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-emerald-800">
                {routeData.realRoute ? t.realTimeData : t.fallbackData}
              </div>
              <div className="text-sm text-emerald-600">Live traffic & weather</div>
            </div>
          </div>
          <Badge variant={routeData.realRoute ? "default" : "secondary"} className="px-3 py-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`} />
            {routeData.realRoute ? 'Live' : 'Est.'}
          </Badge>
        </div>

        {/* Main Route Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-medium text-blue-700">{t.distance}</div>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {routeData.distanceFormatted || `${routeData.distance} km`}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-medium text-purple-700">{t.duration}</div>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {routeData.durationFormatted || `${routeData.duration}h`}
            </div>
          </div>
        </div>

        {/* Transport Mode */}
        {routeData.transportMode && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                {getTransportIcon(routeData.transportMode)}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{t.transportMode}</div>
                <div className="text-sm text-gray-600">
                  {t.transportModes[routeData.transportMode] || routeData.transportMode}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conditions Grid */}
        <div className="space-y-3">
          {/* Traffic Level */}
          {routeData.trafficLevel && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-800">{t.trafficLevel}</span>
              </div>
              <Badge variant={getTrafficBadgeVariant(routeData.trafficLevel)} className="px-3 py-1">
                {t.trafficLevels[routeData.trafficLevel] || routeData.trafficLevel}
              </Badge>
            </div>
          )}

          {/* Safety Risk */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-800">{t.conflictRisk}</span>
            </div>
            <Badge variant={getRiskBadgeVariant(routeData.conflictRisk)} className="px-3 py-1">
              {t.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
            </Badge>
          </div>

          {/* Weather */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-800">{t.weather}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-800">
                {t.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
              </div>
              {routeData.temperature !== undefined && (
                <div className="text-sm text-gray-600">{routeData.temperature}°C</div>
              )}
            </div>
          </div>

          {/* Road Quality */}
          {routeData.roadQuality && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-800">{t.roadQuality}</span>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {t.roadQualities[routeData.roadQuality] || routeData.roadQuality}
              </Badge>
            </div>
          )}
        </div>

        {/* Traffic Delay Alert */}
        {routeData.estimatedDelay !== undefined && routeData.estimatedDelay > 0 && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-orange-800">{t.estimatedDelay}</div>
                <div className="text-orange-700">+{routeData.estimatedDelay} minutes due to traffic</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {routeData.error && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800">API Notice</div>
                <div className="text-amber-700 text-sm">{routeData.error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300">
            <Share className="w-4 h-4 mr-2" />
            {t.shareRoute}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-green-50 border-green-200 hover:border-green-300">
            <Bookmark className="w-4 h-4 mr-2" />
            {t.saveRoute}
          </Button>
        </div>

        {/* Enhanced Safety Tips */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border border-slate-200">
          <div className="text-sm font-medium text-slate-800 mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Safety Tips
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <div>• Check route conditions before departure</div>
            <div>• Keep emergency contacts accessible</div>
            <div>• Monitor weather updates during travel</div>
            {routeData.realRoute && <div>• Route uses real-time traffic data</div>}
            {routeData.estimatedDelay > 15 && <div>• Consider departure time due to traffic</div>}
            {routeData.temperature !== undefined && routeData.temperature < 0 && <div>• Cold weather: prepare for winter conditions</div>}
            {routeData.temperature !== undefined && routeData.temperature > 30 && <div>• Hot weather: stay hydrated and cool</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyPanel;
