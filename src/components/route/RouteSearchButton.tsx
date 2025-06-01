
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
      className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
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
