
import React, { useState } from 'react';
import RouteInput from '../components/RouteInput';
import InteractiveMap from '../components/InteractiveMap';
import SafetyPanel from '../components/SafetyPanel';
import LanguageToggle from '../components/LanguageToggle';
import { MapPin, Shield, Navigation } from 'lucide-react';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');
  const [routeData, setRouteData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const translations = {
    en: {
      title: 'SafeRoute UA',
      subtitle: 'Navigate Ukraine safely with real-time risk assessment',
      tagline: 'Your trusted travel companion for safer journeys'
    },
    ua: {
      title: 'SafeRoute UA',
      subtitle: 'Безпечна навігація Україною з оцінкою ризиків у реальному часі',
      tagline: 'Ваш надійний супутник для безпечних подорожей'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
                <p className="text-sm text-gray-600 hidden sm:block">{t.tagline}</p>
              </div>
            </div>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t.subtitle}
          </h2>
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Real-time routing</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Safety analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Navigation className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Weather aware</span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Input Panel */}
          <div className="lg:col-span-1">
            <RouteInput 
              language={language}
              onRouteRequest={setRouteData}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />
            {routeData && (
              <div className="mt-6">
                <SafetyPanel language={language} routeData={routeData} />
              </div>
            )}
          </div>

          {/* Interactive Map Display */}
          <div className="lg:col-span-2">
            <InteractiveMap 
              language={language}
              routeData={routeData}
              isSearching={isSearching}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
