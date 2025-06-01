
import React from 'react';
import CityAutocomplete from '../CityAutocomplete';
import { RouteInputTranslations } from '@/types/route';

interface RouteFormProps {
  startCity: string;
  endCity: string;
  needsReturn: boolean;
  language: 'en' | 'ua';
  translations: RouteInputTranslations;
  onStartCityChange: (city: string) => void;
  onEndCityChange: (city: string) => void;
  onNeedsReturnChange: (needsReturn: boolean) => void;
}

const RouteForm: React.FC<RouteFormProps> = ({
  startCity,
  endCity,
  needsReturn,
  language,
  translations,
  onStartCityChange,
  onEndCityChange,
  onNeedsReturnChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.startCity}
        </label>
        <div className="w-full">
          <CityAutocomplete
            value={startCity}
            onChange={onStartCityChange}
            placeholder={translations.startPlaceholder}
            language={language}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.endCity}
        </label>
        <div className="w-full">
          <CityAutocomplete
            value={endCity}
            onChange={onEndCityChange}
            placeholder={translations.endPlaceholder}
            language={language}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="returnRoute"
          checked={needsReturn}
          onChange={(e) => onNeedsReturnChange(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="returnRoute" className="text-sm text-gray-700">
          {translations.returnRoute}
        </label>
      </div>
    </div>
  );
};

export default RouteForm;
