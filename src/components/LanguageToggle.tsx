
import React from 'react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'en' | 'ua';
  onLanguageChange: (language: 'en' | 'ua') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('en')}
        className="px-3 py-1 text-xs h-8"
      >
        EN
      </Button>
      <Button
        variant={language === 'ua' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('ua')}
        className="px-3 py-1 text-xs h-8"
      >
        УА
      </Button>
    </div>
  );
};

export default LanguageToggle;
