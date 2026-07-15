
import React from 'react';
import { Shield, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteStatusInfoProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
  hasActiveThreats: boolean;
  language: 'en' | 'ua';
}

const RouteStatusInfo: React.FC<RouteStatusInfoProps> = ({ routeData, translations, hasActiveThreats, language }) => {

  const activeThreatsText = {
    en: 'Active Threats (72h)',
    ua: 'Активні загрози (72г)'
  };

  const yesNoText = {
    en: { yes: 'YES', no: 'NO' },
    ua: { yes: 'ТАК', no: 'НІ' }
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Active Threats Status */}
      <div className="flex items-center justify-between p-3 glass-card transition-colors duration-200 hover:bg-white/[0.07]">
        <div className="flex items-center space-x-3">
          <Shield className={`w-4 h-4 ${hasActiveThreats ? 'text-red-400' : 'text-white/70'}`} />
          <span className="hud-label !text-white/70">{activeThreatsText[language]}</span>
        </div>
        <Badge
          variant="outline"
          className={`text-xs font-semibold uppercase tracking-[0.1em] border ${
            hasActiveThreats
              ? 'border-red-400/40 bg-red-500/15 text-red-300'
              : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
          }`}
        >
          {hasActiveThreats ? yesNoText[language].yes : yesNoText[language].no}
        </Badge>
      </div>
      
      {/* Weather */}
      {routeData.weatherCondition && (
        <div className="flex items-center justify-between p-3 glass-card transition-colors duration-200 hover:bg-white/[0.07]">
          <div className="flex items-center space-x-3">
            <Cloud className="w-4 h-4 text-white/70" />
            <span className="hud-label !text-white/70">{translations.weather}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-white">
              {translations.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
            </div>
            {routeData.temperature !== undefined && (
              <div className="text-xs text-white/40 hud-value">{routeData.temperature}°C</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteStatusInfo;
