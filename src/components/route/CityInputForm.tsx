
import React from 'react';
import CityAutocomplete from '../CityAutocomplete';
import { RouteInputTranslations } from '@/types/route';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, ArrowUpDown } from 'lucide-react';

interface CityInputFormProps {
  startCity: string;
  endCity: string;
  language: 'en' | 'ua';
  translations: RouteInputTranslations;
  onStartCityChange: (city: string) => void;
  onEndCityChange: (city: string) => void;
}

const CityInputForm: React.FC<CityInputFormProps> = ({
  startCity,
  endCity,
  language,
  translations,
  onStartCityChange,
  onEndCityChange
}) => {
  // Handle start city change and clear end city if it's the same
  const handleStartCityChange = (city: string) => {
    onStartCityChange(city);
    if (city === endCity) {
      onEndCityChange('');
    }
  };

  // Handle end city change and clear start city if it's the same
  const handleEndCityChange = (city: string) => {
    onEndCityChange(city);
    if (city === startCity) {
      onStartCityChange('');
    }
  };

  // Handle flip/swap cities
  const handleFlipCities = () => {
    if (startCity && endCity) {
      onStartCityChange(endCity);
      onEndCityChange(startCity);
    }
  };

  const helperText = {
    en: 'Please select a starting city first',
    ua: 'Спочатку оберіть місто відправлення'
  };

  const swapLabel = {
    en: 'Swap cities',
    ua: 'Поміняти міста місцями'
  };

  return (
    <div className="space-y-2">
      {!startCity && (
        <p className="text-xs text-white/40">
          {helperText[language]}
        </p>
      )}

      {/* Apple Maps-style stop list: icon gutter + connector, rows divided by hairlines */}
      <div className="glass-card px-3 py-1">
        {/* From */}
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/40 ring-1 ring-white/30">
            <Navigation className="w-3.5 h-3.5 text-slate-900" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <CityAutocomplete
              variant="plain"
              language={language}
              placeholder={translations.startPlaceholder}
              onCitySelect={handleStartCityChange}
              selectedCity={startCity}
              excludeCity={endCity}
            />
          </div>
        </div>

        {/* Connector + divider + swap */}
        <div className="flex items-center gap-3">
          <div className="w-7 flex justify-center flex-shrink-0">
            <span className="w-[3px] h-4 rounded-full bg-white/25" />
          </div>
          <div className="flex-1 border-t border-white/10" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFlipCities}
            disabled={!startCity || !endCity}
            aria-label={swapLabel[language]}
            title={swapLabel[language]}
            className="h-7 w-7 p-0 rounded-full text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* To */}
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/40 ring-1 ring-white/20">
            <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <CityAutocomplete
              variant="plain"
              language={language}
              placeholder={translations.endPlaceholder}
              onCitySelect={handleEndCityChange}
              selectedCity={endCity}
              excludeCity={startCity}
              disabled={!startCity}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityInputForm;
