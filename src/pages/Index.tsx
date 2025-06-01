import React, { useState } from 'react';
import RouteInput from '../components/RouteInput';
import InteractiveMap from '../components/InteractiveMap';
import SafetyPanel from '../components/SafetyPanel';
import LanguageToggle from '../components/LanguageToggle';
import MobileRouteDrawer from '../components/mobile/MobileRouteDrawer';
import { useIsMobile } from '../hooks/use-mobile';
import { Shield, MapPin } from 'lucide-react';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const translations = {
    en: {
      title: 'SafeRoute UA',
      subtitle: 'Navigate Ukraine safely',
      yourLocation: 'Your Location',
      selectDestination: 'Select destination'
    },
    ua: {
      title: 'SafeRoute UA',
      subtitle: 'Безпечна навігація Україною',
      yourLocation: 'Ваша локація',
      selectDestination: 'Оберіть пункт призначення'
    }
  };

  const t = translations[language];

  // Handle route data changes - open drawer on mobile when route is loaded
  const handleRouteRequest = (data: any) => {
    setRouteData(data);
    if (isMobile && data) {
      setMobileDrawerOpen(true);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {/* Mobile Header */}
        <header className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">{t.title}</h1>
              </div>
            </div>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </header>

        {/* Full Screen Map */}
        <div className="flex-1 relative pt-14">
          <InteractiveMap 
            language={language}
            routeData={routeData}
            isSearching={isSearching}
          />
        </div>

        {/* Mobile Route Input Overlay */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Location Input */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">{t.yourLocation}</div>
                  <div className="text-sm font-medium text-gray-900">Current Location</div>
                </div>
              </div>
            </div>

            {/* Destination Input */}
            <div className="p-4">
              <RouteInput 
                language={language}
                onRouteRequest={handleRouteRequest}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
              />
            </div>
          </div>
        </div>

        {/* Transport Mode Pills */}
        {routeData && (
          <div className="absolute top-80 left-4 z-10">
            <div className="flex space-x-2">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{routeData.durationFormatted || `${routeData.duration}h`}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Route Drawer */}
        <MobileRouteDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          routeData={routeData}
          language={language}
        />
      </div>
    );
  }

  // Desktop Layout (unchanged)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Compact Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-50">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{t.title}</h1>
              <p className="text-xs text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Main Layout - Sidebar + Map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <RouteInput 
              language={language}
              onRouteRequest={setRouteData}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />
            {routeData && (
              <SafetyPanel language={language} routeData={routeData} />
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <InteractiveMap 
            language={language}
            routeData={routeData}
            isSearching={isSearching}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
