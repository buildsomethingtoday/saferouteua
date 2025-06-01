
import React from 'react';
import { Button } from '@/components/ui/button';
import { RouteInputTranslations } from '@/types/route';

interface RouteSearchButtonProps {
  isSearching: boolean;
  disabled: boolean;
  translations: RouteInputTranslations;
  onClick: () => void;
}

const RouteSearchButton: React.FC<RouteSearchButtonProps> = ({
  isSearching,
  disabled,
  translations,
  onClick
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-blue-600 to-yellow-400 hover:from-blue-700 hover:to-yellow-500 text-white font-bold"
    >
      {isSearching ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>{translations.searching}</span>
        </div>
      ) : (
        translations.findRoute
      )}
    </Button>
  );
};

export default RouteSearchButton;
