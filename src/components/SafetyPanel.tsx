
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Cloud, Clock, AlertTriangle, Share, Bookmark, Star, Car, MapPin } from 'lucide-react';

interface SafetyPanelProps {
  language: 'en' | 'ua';
  routeData: any;
}

const SafetyPanel: React.FC<SafetyPanelProps> = ({ language, routeData }) => {
  const translations = {
    en: {
      safetyScore: 'Safety Score',
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      weather: 'Weather',
      conflictRisk: 'Conflict Risk',
      shareRoute: 'Share Route',
      saveRoute: 'Save Route',
      alternative: 'Alternative Suggestion',
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
        walking: 'Walking',
        cycling: 'Cycling'
      }
    },
    ua: {
      safetyScore: 'Оцінка безпеки',
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Тривалість',
      weather: 'Погода',
      conflictRisk: 'Ризик конфлікту',
      shareRoute: 'Поділитися маршрутом',
      saveRoute: 'Зберегти маршрут',
      alternative: 'Альтернативна пропозиція',
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
        walking: 'Пішки',
        cycling: 'Велосипед'
      }
    }
  };

  const t = translations[language];

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSafetyIcon = (score: number) => {
    if (score >= 80) return <Shield className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return <Car className="w-4 h-4" />;
      case 'walking': return <MapPin className="w-4 h-4" />;
      case 'cycling': return <Clock className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  return (
    <Card className="shadow-lg bg-white border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getSafetyIcon(routeData.safetyScore)}
            <span>{t.safetyScore}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-lg font-bold ${getSafetyColor(routeData.safetyScore)}`}>
            {routeData.safetyScore}%
          </div>
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
          <h4 className="font-medium text-gray-900">{t.routeDetails}</h4>
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

        {/* Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{t.weather}</span>
            </div>
            <span className="text-sm text-blue-700">
              {t.weatherConditions[routeData.weatherCondition]}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">{t.conflictRisk}</span>
            </div>
            <span className="text-sm text-yellow-700">
              {t.riskLevels[routeData.conflictRisk]}
            </span>
          </div>
        </div>

        {/* Alternative Suggestion */}
        {routeData.alternativeSuggestion && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-2">
              <Star className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-green-800">{t.alternative}</div>
                <div className="text-sm text-green-700">{routeData.alternativeSuggestion}</div>
              </div>
            </div>
          </div>
        )}

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyPanel;
