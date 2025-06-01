
import React, { useState } from 'react';
import RouteInput from '../components/RouteInput';
import InteractiveMap from '../components/InteractiveMap';
import SafetyPanel from '../components/SafetyPanel';
import LanguageToggle from '../components/LanguageToggle';
import { Shield } from 'lucide-react';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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
