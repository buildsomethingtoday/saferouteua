
import React, { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import LanguageToggle from '../components/LanguageToggle';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Map */}
      <InteractiveMap 
        language={language}
        routeData={routeData}
        isSearching={isSearching}
      />

      {/* Route Planning Overlay Card - Top Left */}
      <div className="absolute top-4 left-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
        <RouteInput 
          language={language}
          onRouteRequest={setRouteData}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          routeData={routeData}
        />
      </div>

      {/* Language Toggle - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-40">
        <LanguageToggle 
          language={language} 
          onLanguageChange={setLanguage} 
        />
      </div>
    </div>
  );
};

export default Index;
