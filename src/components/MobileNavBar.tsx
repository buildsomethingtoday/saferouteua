
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
    <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 px-4 py-3 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg tracking-tight flex items-center gap-2">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white animate-ping opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {t.title}
        </h1>
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
      </div>
    </nav>
  );
};

export default MobileNavBar;
