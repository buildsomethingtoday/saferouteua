
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { RouteInputTranslations } from '@/types/route';
import CityAutocomplete from '../CityAutocomplete';

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
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {translations.startCity}
        </label>
        <CityAutocomplete
          value={startCity}
          onChange={(value) => {
            console.log('🏙️ Start city changed to:', value);
            onStartCityChange(value);
          }}
          placeholder={translations.startPlaceholder}
          language={language}
        />
      </div>
      
      <div className="flex items-center justify-center mt-5">
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {translations.endCity}
        </label>
        <CityAutocomplete
          value={endCity}
          onChange={(value) => {
            console.log('🏙️ End city changed to:', value);
            onEndCityChange(value);
          }}
          placeholder={translations.endPlaceholder}
          language={language}
        />
      </div>
    </div>
  );
};

export default CityInputForm;
