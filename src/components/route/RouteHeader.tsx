
import React from 'react';
import { Shield, Globe } from 'lucide-react';
import { RouteInputTranslations } from '@/types/route';
import LanguageToggle from '../LanguageToggle';

interface RouteHeaderProps {
  language: 'en' | 'ua';
  onLanguageChange: (language: 'en' | 'ua') => void;
  translations: RouteInputTranslations;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({
  language,
  onLanguageChange,
  translations
}) => {
  const UkraineFlag = () => (
    <span className="text-lg" role="img" aria-label="Ukraine flag">🇺🇦</span>
  );

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-yellow-400 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <h1 className="text-sm font-bold text-gray-900">{translations.appTitle}</h1>
            <UkraineFlag />
          </div>
          <p className="text-xs text-gray-600">{translations.appSubtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
      </div>
    </div>
  );
};

export default RouteHeader;
