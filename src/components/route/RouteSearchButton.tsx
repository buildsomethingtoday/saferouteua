
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Loader2 } from 'lucide-react';
import { RouteInputTranslations } from '@/types/route';

interface RouteSearchButtonProps {
  startCity: string;
  endCity: string;
  isSearching: boolean;
  translations: RouteInputTranslations;
  onSearch: () => void;
}

const RouteSearchButton: React.FC<RouteSearchButtonProps> = ({
  startCity,
  endCity,
  isSearching,
  translations,
  onSearch
}) => {
  const isDisabled = !startCity || !endCity || isSearching;

  return (
    <div className="mt-4">
      <Button
        onClick={onSearch}
        disabled={isDisabled}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        size="lg"
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {translations.searching}
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4 mr-2" />
            {translations.findRoute}
          </>
        )}
      </Button>
    </div>
  );
};

export default RouteSearchButton;
