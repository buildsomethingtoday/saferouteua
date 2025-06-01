
import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import RouteInput from '../components/RouteInput';
import AlertsApiExplorer from '../components/AlertsApiExplorer';
import LanguageToggle from '../components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Navigation } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

const Index = () => {
  const detectedLanguage = useLanguageDetection();
  const [language, setLanguage] = useState<'en' | 'ua'>(detectedLanguage);
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('route');
  const isMobile = useIsMobile();

  // Update language when detection completes
  useEffect(() => {
    setLanguage(detectedLanguage);
  }, [detectedLanguage]);

  const translations = {
    en: {
      routeTab: 'Plan Route',
      alertsTab: 'Alerts'
    },
    ua: {
      routeTab: 'Маршрут',
      alertsTab: 'Сповіщення'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Map */}
      <InteractiveMap 
        language={language}
        routeData={routeData}
        isSearching={isSearching}
        onRegionSelect={setSelectedRegion}
      />

      {/* Tabbed Interface - Top Left */}
      <div className="absolute top-4 left-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-600">
            <TabsTrigger 
              value="route" 
              className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {t.routeTab}
            </TabsTrigger>
            <TabsTrigger 
              value="alerts"
              className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t.alertsTab}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="route" className="mt-2">
            <RouteInput 
              language={language}
              onRouteRequest={setRouteData}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              routeData={routeData}
            />
          </TabsContent>
          
          <TabsContent value="alerts" className="mt-2">
            <AlertsApiExplorer 
              language={language}
              selectedRegion={selectedRegion}
              compact={true}
            />
          </TabsContent>
        </Tabs>
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
