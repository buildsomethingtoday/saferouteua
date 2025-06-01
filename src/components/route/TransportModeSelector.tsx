
import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Bus } from 'lucide-react';
import { RouteInputTranslations } from '@/types/route';

interface TransportModeSelectorProps {
  transportMode: 'driving' | 'bus';
  onTransportModeChange: (mode: 'driving' | 'bus') => void;
  translations: RouteInputTranslations;
}

const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  transportMode,
  onTransportModeChange,
  translations
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {translations.transportMode}
      </label>
      <div className="flex space-x-2">
        <Button
          variant={transportMode === 'driving' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTransportModeChange('driving')}
          className="flex-1"
        >
          <Car className="w-4 h-4 mr-2" />
          {translations.driving}
        </Button>
        <Button
          variant={transportMode === 'bus' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTransportModeChange('bus')}
          className="flex-1"
        >
          <Bus className="w-4 h-4 mr-2" />
          {translations.bus}
        </Button>
      </div>
    </div>
  );
};

export default TransportModeSelector;
