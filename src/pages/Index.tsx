
import React, { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import LanguageToggle from '../components/LanguageToggle';
import { useIsMobile } from '../hooks/use-mobile';
import { Shield } from 'lucide-react';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();

  const translations = {
    en: {
      title: 'SafeRoute UA',
      subtitle: 'Navigate Ukraine safely'
    },
    ua: {
      title: 'SafeRoute UA',
      subtitle: 'Безпечна навігація Україною'
    }
  };

  const t = translations[language];

  // Ukraine flag emoji component
  const UkraineFlag = () => (
    <span className="text-lg" role="img" aria-label="Ukraine flag">🇺🇦</span>
  );

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Map */}
      <InteractiveMap 
        language={language}
        routeData={routeData}
        isSearching={isSearching}
      />

      {/* Top Header with Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-yellow-400 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h1 className="text-sm font-bold text-gray-900">{t.title}</h1>
                  <UkraineFlag />
                </div>
                <p className="text-xs text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </div>

      {/* Route Planning Overlay Card - Top Left */}
      <div className="absolute top-4 left-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
        <RouteInput 
          language={language}
          onRouteRequest={setRouteData}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
        />
      </div>
    </div>
  );
};

export default Index;
