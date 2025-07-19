
import { useState, useEffect } from 'react';

export const useLanguageDetection = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'ua'>('en');

  useEffect(() => {
    const detectLanguage = () => {
      // Check browser language settings for Ukrainian specifically
      const browserLanguage = navigator.language || navigator.languages?.[0] || '';
      const lowercaseLang = browserLanguage.toLowerCase();
      
      // Only detect Ukrainian for Ukrainian language or Ukrainian timezone
      if (lowercaseLang.includes('uk') || lowercaseLang.includes('ua')) {
        setDetectedLanguage('ua');
        return;
      }

      // Try to detect location based on timezone - ONLY Ukraine timezones
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ukrainianTimezones = [
        'Europe/Kiev', // Ukraine
        'Europe/Kyiv', // Ukraine (new name)
      ];

      if (ukrainianTimezones.some(tz => timezone.includes(tz))) {
        setDetectedLanguage('ua');
        return;
      }

      // Check browser's accept-language header patterns for Ukrainian only
      if (navigator.languages) {
        const hasUkrainian = navigator.languages.some(lang => 
          lang.toLowerCase().includes('uk') || 
          lang.toLowerCase().includes('ua')
        );
        
        if (hasUkrainian) {
          setDetectedLanguage('ua');
          return;
        }
      }

      // Default to English for all other cases
      setDetectedLanguage('en');
    };

    detectLanguage();
  }, []);

  return detectedLanguage;
};
