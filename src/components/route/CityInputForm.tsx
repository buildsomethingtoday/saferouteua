
import React from 'react';
import CityAutocomplete from '../CityAutocomplete';
import { RouteInputTranslations } from '@/types/route';

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

  return (
    <div className="space-y-4">
      {/* From and To in one row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
      
      {!startCity && (
        <p className="text-xs text-gray-400 mt-1">
          {language === 'en' ? 'Please select a starting city first' : 'Спочатку оберіть місто відправлення'}
        </p>
      )}
    </div>
  );
};

export default CityInputForm;
