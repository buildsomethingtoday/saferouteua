
import React from 'react';
import LanguageToggle from './LanguageToggle';

interface MobileNavBarProps {
  language: 'en' | 'ua';
  onLanguageChange: (language: 'en' | 'ua') => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ language, onLanguageChange }) => {
  const translations = {
    en: {
      title: 'SafeRoute UA'
    },
    ua: {
      title: 'SafeRoute UA'
    }
  };

  const t = translations[language];

  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">{t.title}</h1>
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
      </div>
    </nav>
  );
};

export default MobileNavBar;
