
import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteDetailsHeaderProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
  language: 'en' | 'ua';
}

const RouteDetailsHeader: React.FC<RouteDetailsHeaderProps> = ({ routeData, translations, language }) => {
  const routeInfoText = {
    en: 'Route Information',
    ua: 'Інформація про маршрут'
  };

  const liveDataText = {
    en: 'Live Data',
    ua: 'Прямий ефір'
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <MapPin className="w-3.5 h-3.5 text-white/70" />
        <span className="hud-label">{routeInfoText[language]}</span>
      </div>
      <Badge
        variant="outline"
        className={`text-[11px] uppercase tracking-[0.12em] px-3 py-1 relative border ${
          routeData.realRoute
            ? 'border-white/25 bg-white/10 text-white'
            : 'border-white/15 bg-white/5 text-white/70'
        }`}
      >
        <span className={`relative flex w-1.5 h-1.5 mr-2 ${routeData.realRoute ? '' : 'opacity-60'}`}>
          {routeData.realRoute && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-white animate-ping opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${routeData.realRoute ? 'bg-white' : 'bg-white/50'}`} />
        </span>
        {routeData.realRoute ? liveDataText[language] : translations.estimated}
      </Badge>
    </div>
  );
};

export default RouteDetailsHeader;
