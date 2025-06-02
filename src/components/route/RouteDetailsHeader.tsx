
import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteDetailsHeaderProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
}

const RouteDetailsHeader: React.FC<RouteDetailsHeaderProps> = ({ routeData, translations }) => {
  const routeInfoText = {
    en: 'Route Information',
    ua: 'Інформація про маршрут'
  };

  const liveDataText = {
    en: 'Live Data',
    ua: 'Прямий ефір'
  };

  // Extract language from translations to determine which language to use
  const language = translations.live === 'Live' ? 'en' : 'ua';

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
          <MapPin className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-300 mr-2">{routeInfoText[language]}</span>
      </div>
      <Badge variant={routeData.realRoute ? "default" : "secondary"} className={`text-xs px-3 py-1 relative ${routeData.realRoute ? 'bg-green-600' : 'bg-blue-600'} text-white border-none`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`}>
          {routeData.realRoute && (
            <>
              <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </>
          )}
        </div>
        {routeData.realRoute ? liveDataText[language] : translations.estimated}
      </Badge>
    </div>
  );
};

export default RouteDetailsHeader;
