
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.startCity}
        </label>
        <CityAutocomplete
          language={language}
          placeholder={translations.startPlaceholder}
          onCitySelect={handleStartCityChange}
          selectedCity={startCity}
          excludeCity={endCity} // Exclude the end city from start city options
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.endCity}
        </label>
        <CityAutocomplete
          language={language}
          placeholder={translations.endPlaceholder}
          onCitySelect={handleEndCityChange}
          selectedCity={endCity}
          excludeCity={startCity} // Exclude the start city from end city options
        />
      </div>
    </div>
  );
};

export default CityInputForm;
