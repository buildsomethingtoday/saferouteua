
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, AlertTriangle, Cloud, Shield } from 'lucide-react';

interface MapDisplayProps {
  language: 'en' | 'ua';
  routeData: any;
  isSearching: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ language, routeData, isSearching }) => {
  const translations = {
    en: {
      mapTitle: 'Route Overview',
      noRoute: 'Enter your route to see safety analysis',
      analyzing: 'Analyzing route safety and weather conditions...'
    },
    ua: {
      mapTitle: 'Огляд маршруту',
      noRoute: 'Введіть ваш маршрут для аналізу безпеки',
      analyzing: 'Аналіз безпеки маршруту та погодних умов...'
    }
  };

  const t = translations[language];

  return (
    <Card className="h-[600px] shadow-xl bg-white border-0 overflow-hidden">
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50">
          {/* Simulated Map Elements */}
          <div className="absolute inset-4 bg-white rounded-xl shadow-inner overflow-hidden">
            {isSearching ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">{t.analyzing}</p>
                </div>
              </div>
            ) : routeData ? (
              <div className="relative h-full">
                {/* Simulated Map with Route */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                  {/* Starting Point */}
                  <div className="absolute top-20 left-20">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium bg-white px-2 py-1 rounded shadow">
                        {routeData.startCity}
                      </span>
                    </div>
                  </div>

                  {/* Route Line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 100 100 Q 200 150 300 200 Q 400 250 500 300"
                      stroke="#3B82F6"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Destination Point */}
                  <div className="absolute bottom-20 right-20">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium bg-white px-2 py-1 rounded shadow">
                        {routeData.endCity}
                      </span>
                    </div>
                  </div>

                  {/* Weather Indicators */}
                  <div className="absolute top-1/3 left-1/3">
                    <div className="bg-white rounded-lg p-2 shadow">
                      <Cloud className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>

                  {/* Safety Zones */}
                  {routeData.conflictRisk === 'moderate' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-2 shadow">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                  )}

                  {/* Safe Zone Indicator */}
                  <div className="absolute bottom-1/3 left-1/4">
                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-2 shadow">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Safe zones</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>Caution zones</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>Risk zones</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>{t.noRoute}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MapDisplay;
