
import React from 'react';
import { RouteInputTranslations } from '@/types/route';

interface RouteHeaderProps {
  translations: RouteInputTranslations;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({ translations }) => {
  return (
    <div className="text-center mb-4">
      <h1 className="text-3xl font-bold text-white mb-2">
        {translations.appTitle}
      </h1>
      <p className="text-gray-400 text-sm">
        {translations.appSubtitle}
      </p>
    </div>
  );
};

export default RouteHeader;
