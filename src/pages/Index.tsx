
import React, { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import LanguageToggle from '../components/LanguageToggle';
import MobileNavBar from '../components/MobileNavBar';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useIsMobile } from '../hooks/use-mobile';
import { RouteInputTranslations } from '@/types/route';
import { getRouteInputTranslations } from '@/data/translations';

const Index = () => {
  const detectedLanguage = useLanguageDetection();
  const [language, setLanguage] = useState<'en' | 'ua'>(detectedLanguage);
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [focusAlert, setFocusAlert] = useState<any>(null);
  // Mobile bottom sheet position (fractions of viewport height)
  const [sheetSnap, setSheetSnap] = useState<number | string | null>(0.38);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLanguage(detectedLanguage);
  }, [detectedLanguage]);

  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked in Index:', alert);
    setFocusAlert(alert);
  };

  // Create translations object based on current language
  const translations: RouteInputTranslations = getRouteInputTranslations(language);

  if (isMobile) {
    // Google Maps-style mobile experience: full-screen map with a
    // draggable bottom sheet hosting search, route details, and alerts.
    return (
      <div className="h-[100dvh] relative overflow-hidden">
        <InteractiveMap
          language={language}
          routeData={routeData}
          isSearching={isSearching}
          onRegionSelect={setSelectedRegion}
          focusAlert={focusAlert}
        />

        <MobileNavBar language={language} onLanguageChange={setLanguage} />

        <Drawer.Root
          open
          modal={false}
          dismissible={false}
          snapPoints={[0.38, 0.93]}
          activeSnapPoint={sheetSnap}
          setActiveSnapPoint={setSheetSnap}
        >
          <Drawer.Portal>
            <Drawer.Content
              aria-describedby={undefined}
              className="fixed inset-x-0 bottom-0 z-40 flex h-full max-h-[93dvh] flex-col rounded-t-3xl border-t border-white/15 bg-slate-950/85 backdrop-blur-2xl outline-none shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
            >
              <Drawer.Title className="sr-only">SafeRoute UA</Drawer.Title>
              <div className="mx-auto mt-2.5 mb-1.5 h-1.5 w-10 flex-shrink-0 rounded-full bg-white/25" />
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-10">
                <RouteInput
                  embedded
                  translations={translations}
                  language={language}
                  onRouteRequest={setRouteData}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                  routeData={routeData}
                  selectedRegion={selectedRegion}
                  onAlertClick={handleAlertClick}
                />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  }

  // Desktop Layout - Increased card width from w-96 to w-[420px]
  return (
    <div className="min-h-screen relative">
      <InteractiveMap 
        language={language}
        routeData={routeData}
        isSearching={isSearching}
        onRegionSelect={setSelectedRegion}
        focusAlert={focusAlert}
      />

      <div className="absolute top-4 left-4 z-40 w-[420px] max-w-[calc(100vw-2rem)]">
        <RouteInput 
          translations={translations}
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
