
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, Car, MapPin, Bus } from 'lucide-react';
import CityAutocomplete from './CityAutocomplete';
import { getMapboxService } from '../services/mapboxService';

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
  const [transportMode, setTransportMode] = useState<'driving' | 'bus'>('driving');

  const translations = {
    en: {
      title: 'Plan Your Route',
      startCity: 'Starting city',
      endCity: 'Destination city',
      startPlaceholder: 'Enter starting city (e.g., Kyiv, Lviv, Odesa)',
      endPlaceholder: 'Enter destination city (e.g., Chernivtsi, Zakarpattia)',
      returnRoute: 'Need return route?',
      findRoute: 'Find Route',
      searching: 'Finding route...',
      transportMode: 'Transportation',
      driving: 'Driving',
      bus: 'Bus',
      error: 'Error finding route. Please try again.'
    },
    ua: {
      title: 'Спланувати маршрут',
      startCity: 'Місто відправлення',
      endCity: 'Місто призначення',
      startPlaceholder: 'Введіть місто відправлення (напр., Київ, Львів, Одеса)',
      endPlaceholder: 'Введіть місто призначення (напр., Чернівці, Закарпаття)',
      returnRoute: 'Потрібен зворотний маршрут?',
      findRoute: 'Знайти маршрут',
      searching: 'Пошук маршруту...',
      transportMode: 'Транспорт',
      driving: 'Автомобіль',
      bus: 'Автобус',
      error: 'Помилка пошуку маршруту. Спробуйте ще раз.'
    }
  };

  const t = translations[language];

  const handleRouteSearch = async () => {
    if (!startCity || !endCity) return;
    
    setIsSearching(true);
    
    try {
      const mapboxService = getMapboxService();
      
      // Geocode both cities
      console.log('Geocoding start city:', startCity);
      const startGeocode = await mapboxService.geocodeForward(startCity + ', Ukraine');
      console.log('Geocoding end city:', endCity);
      const endGeocode = await mapboxService.geocodeForward(endCity + ', Ukraine');
      
      if (startGeocode.features.length === 0 || endGeocode.features.length === 0) {
        throw new Error('Could not find one or both cities');
      }
      
      const startCoords = startGeocode.features[0].center;
      const endCoords = endGeocode.features[0].center;
      
      console.log('Start coordinates:', startCoords);
      console.log('End coordinates:', endCoords);
      
      // Get directions with alternatives
      const profile = transportMode === 'driving' ? 'driving-traffic' : transportMode;
      const directions = await mapboxService.getDirections([startCoords, endCoords], profile as any, true);
      
      if (directions.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      const route = directions.routes[0];
      
      // Use enhanced safety calculation with real traffic data
      const safetyScore = mapboxService.calculateTrafficBasedSafetyScore(route);
      const routeQuality = mapboxService.analyzeRouteQuality(route);
      
      const routeData = {
        startCity,
        endCity,
        startCoords,
        endCoords,
        safetyScore: Math.round(safetyScore),
        distance: Math.round(route.distance / 1000),
        duration: Math.round(route.duration / 3600),
        durationFormatted: mapboxService.formatDuration(route.duration),
        distanceFormatted: mapboxService.formatDistance(route.distance),
        geometry: route.geometry,
        transportMode,
        trafficLevel: routeQuality.trafficLevel,
        roadQuality: routeQuality.roadQuality,
        estimatedDelay: routeQuality.estimatedDelay,
        weatherCondition: ['clear', 'cloudy', 'light_rain'][Math.floor(Math.random() * 3)],
        conflictRisk: safetyScore > 80 ? 'low' : 'moderate',
        alternativeRoutes: directions.routes.slice(1, 3), // Up to 2 alternative routes
        realRoute: true
      };
      
      console.log('Final route data:', routeData);
      onRouteRequest(routeData);
      
    } catch (error) {
      console.error('Route search error:', error);
      
      // Fallback to mock data if API fails
      const mockRouteData = {
        startCity,
        endCity,
        safetyScore: Math.floor(Math.random() * 40) + 60,
        distance: Math.floor(Math.random() * 500) + 100,
        duration: Math.floor(Math.random() * 8) + 2,
        weatherCondition: ['clear', 'cloudy', 'light_rain'][Math.floor(Math.random() * 3)],
        conflictRisk: ['low', 'moderate'][Math.floor(Math.random() * 2)],
        trafficLevel: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
        roadQuality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
        estimatedDelay: Math.floor(Math.random() * 30),
        transportMode,
        error: t.error,
        realRoute: false
      };
      
      onRouteRequest(mockRouteData);
    }
    
    setIsSearching(false);
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          <span>{t.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transportation Mode Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.transportMode}
          </label>
          <div className="flex space-x-2">
            <Button
              variant={transportMode === 'driving' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTransportMode('driving')}
              className="flex-1"
            >
              <Car className="w-4 h-4 mr-2" />
              {t.driving}
            </Button>
            <Button
              variant={transportMode === 'bus' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTransportMode('bus')}
              className="flex-1"
            >
              <Bus className="w-4 h-4 mr-2" />
              {t.bus}
            </Button>
          </div>
        </div>

        {/* Route Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.startCity}
            </label>
            <CityAutocomplete
              value={startCity}
              onChange={setStartCity}
              placeholder={t.startPlaceholder}
              language={language}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.endCity}
            </label>
            <CityAutocomplete
              value={endCity}
              onChange={setEndCity}
              placeholder={t.endPlaceholder}
              language={language}
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

        {/* Action Button */}
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
      </CardContent>
    </Card>
  );
};

export default RouteInput;
