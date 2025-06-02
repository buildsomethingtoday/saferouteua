
import React from 'react';
import CityAutocomplete from '../CityAutocomplete';
import { RouteInputTranslations } from '@/types/route';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {!startCity && (
        <p className="text-xs text-gray-400">
          {helperText[language]}
        </p>
      )}
      
      {/* From and To in one row without the flip button */}
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {translations.startCity}
          </label>
          <CityAutocomplete 
            language={language} 
            placeholder={translations.startPlaceholder} 
            onCitySelect={handleStartCityChange} 
            selectedCity={startCity} 
            excludeCity={endCity} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {translations.endCity}
          </label>
          <CityAutocomplete 
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
  );
};

export default CityInputForm;
