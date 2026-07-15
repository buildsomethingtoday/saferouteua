
import React from 'react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'en' | 'ua';
  onLanguageChange: (language: 'en' | 'ua') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-0.5 bg-black/30 backdrop-blur-2xl border border-white/15 rounded-full p-1 shadow-lg shadow-black/30">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLanguageChange('en')}
        className={`px-4 py-1 text-xs h-8 font-semibold rounded-full transition-all duration-300 ${
          language === 'en'
            ? 'bg-white text-slate-900 hover:bg-white hover:text-slate-900 shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLanguageChange('ua')}
        className={`px-4 py-1 text-xs h-8 font-semibold rounded-full transition-all duration-300 ${
          language === 'ua'
            ? 'bg-white text-slate-900 hover:bg-white hover:text-slate-900 shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        УА
      </Button>
    </div>
  );
};

export default LanguageToggle;
