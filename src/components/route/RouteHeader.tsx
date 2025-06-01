
import React from 'react';
import { Shield } from 'lucide-react';
import { RouteInputTranslations } from '@/types/route';

interface RouteHeaderProps {
  translations: RouteInputTranslations;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({ translations }) => {
  const UkraineFlag = () => (
    <span className="text-lg" role="img" aria-label="Ukraine flag">🇺🇦</span>
  );

  return (
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-yellow-400 rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="flex items-center space-x-1">
          <h1 className="text-sm font-bold text-white">{translations.appTitle}</h1>
          <UkraineFlag />
        </div>
        <p className="text-xs text-gray-400">{translations.appSubtitle}</p>
      </div>
    </div>
  );
};

export default RouteHeader;
