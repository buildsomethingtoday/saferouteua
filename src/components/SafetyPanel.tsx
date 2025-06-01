
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Clock, AlertTriangle, Share, Bookmark, Car, MapPin, Bus, Gauge } from 'lucide-react';

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
      conflictRisk: 'Conflict Risk',
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
      conflictRisk: 'Ризик конфлікту',
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

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'light': return 'text-green-700 bg-green-50';
      case 'moderate': return 'text-yellow-700 bg-yellow-50';
      case 'heavy': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getRoadQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-700 bg-green-50';
      case 'good': return 'text-blue-700 bg-blue-50';
      case 'fair': return 'text-orange-700 bg-orange-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <Card className="shadow-lg bg-white border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <span>{t.routeDetails}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Source Indicator */}
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {routeData.realRoute ? t.realTimeData : t.fallbackData}
          </span>
          <div className={`w-2 h-2 rounded-full ${routeData.realRoute ? 'bg-green-500' : 'bg-orange-500'}`} />
        </div>

        {/* Route Summary */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">{t.distance}</div>
              <div className="text-lg font-semibold">
                {routeData.distanceFormatted || `${routeData.distance} km`}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">{t.duration}</div>
              <div className="text-lg font-semibold">
                {routeData.durationFormatted || `${routeData.duration}h`}
              </div>
            </div>
          </div>
        </div>

        {/* Transport Mode */}
        {routeData.transportMode && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getTransportIcon(routeData.transportMode)}
              <span className="text-sm font-medium">{t.transportMode}</span>
            </div>
            <span className="text-sm text-gray-700">
              {t.transportModes[routeData.transportMode] || routeData.transportMode}
            </span>
          </div>
        )}

        {/* Enhanced Route Analysis */}
        <div className="space-y-3">
          {/* Traffic Level */}
          {routeData.trafficLevel && (
            <div className={`flex items-center justify-between p-3 rounded-lg ${getTrafficColor(routeData.trafficLevel)}`}>
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4" />
                <span className="text-sm font-medium">{t.trafficLevel}</span>
              </div>
              <span className="text-sm font-medium">
                {t.trafficLevels[routeData.trafficLevel] || routeData.trafficLevel}
              </span>
            </div>
          )}

          {/* Road Quality */}
          {routeData.roadQuality && (
            <div className={`flex items-center justify-between p-3 rounded-lg ${getRoadQualityColor(routeData.roadQuality)}`}>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{t.roadQuality}</span>
              </div>
              <span className="text-sm font-medium">
                {t.roadQualities[routeData.roadQuality] || routeData.roadQuality}
              </span>
            </div>
          )}

          {/* Traffic Delay */}
          {routeData.estimatedDelay !== undefined && routeData.estimatedDelay > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">{t.estimatedDelay}</span>
              </div>
              <span className="text-sm text-orange-700">
                +{routeData.estimatedDelay} min
              </span>
            </div>
          )}

          {/* Weather */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{t.weather}</span>
            </div>
            <span className="text-sm text-blue-700">
              {t.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
            </span>
          </div>

          {/* Conflict Risk */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">{t.conflictRisk}</span>
            </div>
            <span className="text-sm text-yellow-700">
              {t.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {routeData.error && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-orange-800">API Notice</div>
                <div className="text-sm text-orange-700">{routeData.error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="flex-1">
            <Share className="w-4 h-4 mr-2" />
            {t.shareRoute}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Bookmark className="w-4 h-4 mr-2" />
            {t.saveRoute}
          </Button>
        </div>

        {/* Safety Tips */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Check route conditions before departure</div>
            <div>• Keep emergency contacts accessible</div>
            <div>• Monitor weather updates during travel</div>
            {routeData.realRoute && <div>• Route uses real-time traffic data</div>}
            {routeData.estimatedDelay > 15 && <div>• Consider departure time due to traffic</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyPanel;
