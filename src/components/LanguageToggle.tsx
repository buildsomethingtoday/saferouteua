
import React from 'react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'en' | 'ua';
  onLanguageChange: (language: 'en' | 'ua') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-1 shadow-sm">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-xs h-8 font-medium ${
          language === 'en' 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        EN
      </Button>
      <Button
        variant={language === 'ua' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('ua')}
        className={`px-3 py-1 text-xs h-8 font-medium ${
          language === 'ua' 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        УА
      </Button>
    </div>
  );
};

export default LanguageToggle;
