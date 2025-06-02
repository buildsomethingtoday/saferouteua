
import React from 'react';
import { RouteInputTranslations } from '@/types/route';

interface RouteHeaderProps {
  translations: RouteInputTranslations;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({
  translations
}) => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-blue-400 mb-1">
        {translations.appTitle}
      </h1>
      <p className="text-sm text-gray-400">
        {translations.appSubtitle}
      </p>
    </div>
  );
};

export default RouteHeader;
