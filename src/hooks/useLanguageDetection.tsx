
import { useState, useEffect } from 'react';

export const useLanguageDetection = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'ua'>('en');

  useEffect(() => {
    const detectLanguage = () => {
      // Check browser language settings
      const browserLanguage = navigator.language || navigator.languages?.[0] || '';
      const lowercaseLang = browserLanguage.toLowerCase();
      
      // Check for Ukrainian or Russian in browser settings
      if (lowercaseLang.includes('uk') || lowercaseLang.includes('ua') || lowercaseLang.includes('ru')) {
        setDetectedLanguage('ua');
        return;
      }

      // Try to detect location based on timezone (approximate)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const centralEuropeanTimezones = [
        'Europe/Kiev', // Ukraine
        'Europe/Kyiv', // Ukraine (new name)
        'Europe/Moscow', // Russia
        'Europe/Warsaw', // Poland
        'Europe/Prague', // Czech Republic
        'Europe/Budapest', // Hungary
        'Europe/Bratislava', // Slovakia
        'Europe/Vienna', // Austria
        'Europe/Ljubljana', // Slovenia
        'Europe/Zagreb', // Croatia
        'Europe/Belgrade', // Serbia
        'Europe/Bucharest', // Romania
        'Europe/Sofia', // Bulgaria
        'Europe/Minsk', // Belarus
        'Europe/Vilnius', // Lithuania
        'Europe/Riga', // Latvia
        'Europe/Tallinn', // Estonia
      ];

      if (centralEuropeanTimezones.some(tz => timezone.includes(tz))) {
        setDetectedLanguage('ua');
        return;
      }

      // Check browser's accept-language header patterns
      if (navigator.languages) {
        const hasUkrainianOrRussian = navigator.languages.some(lang => 
          lang.toLowerCase().includes('uk') || 
          lang.toLowerCase().includes('ua') || 
          lang.toLowerCase().includes('ru')
        );
        
        if (hasUkrainianOrRussian) {
          setDetectedLanguage('ua');
          return;
        }
      }

      // Default to English
      setDetectedLanguage('en');
    };

    detectLanguage();
  }, []);

  return detectedLanguage;
};
