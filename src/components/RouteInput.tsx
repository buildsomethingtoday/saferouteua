
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, AlertTriangle, Star } from 'lucide-react';

interface RouteInputProps {
  language: 'en' | 'ua';
  onRouteRequest: (data: any) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

const RouteInput: React.FC<RouteInputProps> = ({ 
  language, 
  onRouteRequest, 
  isSearching, 
  setIsSearching 
}) => {
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');
  const [needsReturn, setNeedsReturn] = useState(false);

  const translations = {
    en: {
      title: 'Plan Your Route',
      startCity: 'Starting city',
      endCity: 'Destination city',
      returnRoute: 'Need return route?',
      findRoute: 'Find Safe Route',
      searching: 'Analyzing safety...',
      safestDestinations: 'Show Safest Destinations',
      detectLocation: 'Use My Location',
      popularRoutes: 'Popular Safe Routes'
    },
    ua: {
      title: 'Спланувати маршрут',
      startCity: 'Місто відправлення',
      endCity: 'Місто призначення',
      returnRoute: 'Потрібен зворотний маршрут?',
      findRoute: 'Знайти безпечний маршрут',
      searching: 'Аналіз безпеки...',
      safestDestinations: 'Показати найбезпечніші напрямки',
      detectLocation: 'Використати мою локацію',
      popularRoutes: 'Популярні безпечні маршрути'
    }
  };

  const t = translations[language];

  const popularRoutes = [
    { from: 'Kyiv', to: 'Lviv', safety: 85 },
    { from: 'Lviv', to: 'Zakarpattia', safety: 92 },
    { from: 'Odesa', to: 'Chernivtsi', safety: 78 },
    { from: 'Dnipro', to: 'Kyiv', safety: 72 }
  ];

  const handleRouteSearch = async () => {
    if (!startCity || !endCity) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockRouteData = {
        startCity,
        endCity,
        safetyScore: Math.floor(Math.random() * 40) + 60, // 60-100
        distance: Math.floor(Math.random() * 500) + 100,
        duration: Math.floor(Math.random() * 8) + 2,
        weatherCondition: ['clear', 'cloudy', 'light_rain'][Math.floor(Math.random() * 3)],
        conflictRisk: ['low', 'moderate'][Math.floor(Math.random() * 2)],
        alternativeSuggestion: Math.random() > 0.5 ? 'Consider Lviv - safer conditions' : null
      };
      
      onRouteRequest(mockRouteData);
      setIsSearching(false);
    }, 2000);
  };

  const handlePopularRoute = (route: any) => {
    setStartCity(route.from);
    setEndCity(route.to);
  };

  return (
    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          <span>{t.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Detection */}
        <Button 
          variant="outline" 
          className="w-full justify-center space-x-2 hover:bg-blue-50 border-blue-200"
          onClick={() => {
            // In real implementation, this would use geolocation
            setStartCity('Kyiv');
          }}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.detectLocation}</span>
        </Button>

        {/* Route Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.startCity}
            </label>
            <Input
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              placeholder="Kyiv, Lviv, Odesa..."
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.endCity}
            </label>
            <Input
              value={endCity}
              onChange={(e) => setEndCity(e.target.value)}
              placeholder="Lviv, Chernivtsi, Zakarpattia..."
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="returnRoute"
              checked={needsReturn}
              onChange={(e) => setNeedsReturn(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="returnRoute" className="text-sm text-gray-700">
              {t.returnRoute}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRouteSearch}
            disabled={!startCity || !endCity || isSearching}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t.searching}</span>
              </div>
            ) : (
              t.findRoute
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full border-green-200 hover:bg-green-50 text-green-700"
            onClick={() => {
              // Show safest destinations
              console.log('Show safest destinations');
            }}
          >
            <Star className="w-4 h-4 mr-2" />
            {t.safestDestinations}
          </Button>
        </div>

        {/* Popular Routes */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t.popularRoutes}</h4>
          <div className="space-y-2">
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => handlePopularRoute(route)}
                className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">
                    {route.from} → {route.to}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      route.safety >= 85 ? 'bg-green-500' : 
                      route.safety >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-600">{route.safety}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteInput;
