
import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import LanguageToggle from '../components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

const Index = () => {
  const detectedLanguage = useLanguageDetection();
  const [language, setLanguage] = useState<'en' | 'ua'>(detectedLanguage);
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();

  // Update language when detection completes
  useEffect(() => {
    setLanguage(detectedLanguage);
  }, [detectedLanguage]);

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

      {/* Alerts Explorer Button - Top Right */}
      <div className="absolute top-4 right-20 z-40">
        <Button
          onClick={() => window.open('/alerts-explorer', '_blank')}
          variant="outline"
          size="sm"
          className="bg-gray-800/90 border-gray-600 text-white hover:bg-gray-700"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {language === 'ua' ? 'Дослідник сповіщень' : 'Alerts Explorer'}
        </Button>
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
