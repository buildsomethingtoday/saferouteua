
import React, { useState } from 'react';
import RouteInput from '../components/RouteInput';
import InteractiveMap from '../components/InteractiveMap';
import SafetyPanel from '../components/SafetyPanel';
import LanguageToggle from '../components/LanguageToggle';
import MobileRouteDrawer from '../components/mobile/MobileRouteDrawer';
import { useIsMobile } from '../hooks/use-mobile';
import { Shield, MapPin, Navigation, Zap } from 'lucide-react';

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
      selectDestination: 'Select destination',
      planRoute: 'Plan Your Route',
      findSafestRoute: 'Find the safest route in Ukraine',
      quickSearch: 'Quick Route Search'
    },
    ua: {
      title: 'SafeRoute UA',
      subtitle: 'Безпечна навігація Україною',
      yourLocation: 'Ваша локація',
      selectDestination: 'Оберіть пункт призначення',
      planRoute: 'Спланувати маршрут',
      findSafestRoute: 'Знайдіть найбезпечніший маршрут в Україні',
      quickSearch: 'Швидкий пошук маршруту'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col relative overflow-hidden">
        {/* Enhanced Mobile Header with Gradient */}
        <header className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t.title}</h1>
                <p className="text-xs text-blue-100">{t.subtitle}</p>
              </div>
            </div>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </header>

        {/* Full Screen Map */}
        <div className="flex-1 relative pt-16">
          <InteractiveMap 
            language={language}
            routeData={routeData}
            isSearching={isSearching}
          />
        </div>

        {/* Maximalist Route Search Overlay */}
        <div className="absolute top-24 left-4 right-4 z-20">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
            {/* Bold Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">{t.planRoute}</h2>
              </div>
              <p className="text-blue-100 text-sm">{t.findSafestRoute}</p>
            </div>

            {/* Current Location Display */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">{t.yourLocation}</div>
                  <div className="text-lg font-bold text-emerald-900">Current Location</div>
                  <div className="text-xs text-emerald-600">GPS coordinates detected</div>
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Enhanced Route Input */}
            <div className="p-6 bg-white">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t.quickSearch}</span>
                </div>
              </div>
              <RouteInput 
                language={language}
                onRouteRequest={handleRouteRequest}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
              />
            </div>
          </div>
        </div>

        {/* Floating Route Summary (when route exists) */}
        {routeData && (
          <div className="absolute bottom-6 left-4 right-4 z-20">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Route Found</div>
                    <div className="text-lg font-bold">
                      {routeData.durationFormatted || `${routeData.duration}h`} • {routeData.distanceFormatted || `${routeData.distance} km`}
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Tap for details
                </div>
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
