import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import LanguageToggle from '../components/LanguageToggle';
import MobileNavBar from '../components/MobileNavBar';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const detectedLanguage = useLanguageDetection();
  const [language, setLanguage] = useState<'en' | 'ua'>(detectedLanguage);
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [focusAlert, setFocusAlert] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLanguage(detectedLanguage);
  }, [detectedLanguage]);

  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked in Index:', alert);
    setFocusAlert(alert);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900">
        <MobileNavBar language={language} onLanguageChange={setLanguage} />
        
        {/* Mobile Layout - Full screen route input with top padding for navbar */}
        <div className="pt-16 p-4 min-h-screen">
          <RouteInput 
            language={language}
            onRouteRequest={setRouteData}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            routeData={routeData}
            selectedRegion={selectedRegion}
            onAlertClick={handleAlertClick}
          />
        </div>
      </div>
    );
  }

  // Desktop Layout (unchanged)
  return (
    <div className="min-h-screen relative">
      <InteractiveMap 
        language={language}
        routeData={routeData}
        isSearching={isSearching}
        onRegionSelect={setSelectedRegion}
        focusAlert={focusAlert}
      />

      <div className="absolute top-4 left-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
        <RouteInput 
          language={language}
          onRouteRequest={setRouteData}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          routeData={routeData}
          selectedRegion={selectedRegion}
          onAlertClick={handleAlertClick}
        />
      </div>

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
