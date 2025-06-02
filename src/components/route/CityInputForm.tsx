
import React from 'react';
import CityAutocomplete from '../CityAutocomplete';
import { RouteInputTranslations } from '@/types/route';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* From and To in one row with flip button */}
      <div className="grid grid-cols-2 gap-4 items-end">
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
      
      {/* Flip button centered below */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handleFlipCities}
          disabled={!startCity || !endCity}
          className="h-8 w-8 rounded-full bg-gray-800 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
          title={language === 'en' ? 'Swap cities' : 'Поміняти місця'}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
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
