
import { useCallback } from 'react';
import { getMapboxServiceSync } from '../services/mapboxService';
import { getWeatherService } from '../services/weatherService';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface UseRouteSearchProps {
  translations: RouteInputTranslations;
  setIsSearching: (searching: boolean) => void;
  onRouteRequest: (data: RouteData) => void;
}

export const useRouteSearch = ({ translations, setIsSearching, onRouteRequest }: UseRouteSearchProps) => {
  const handleRouteSearch = useCallback(async (
    startCity: string,
    endCity: string,
    transportMode: 'driving'
  ) => {
    if (!startCity || !endCity) return;
    
    console.log('Starting route search for:', startCity, 'to', endCity);
    setIsSearching(true);
    
    try {
      const mapboxService = getMapboxServiceSync();
      const weatherService = getWeatherService();
      
      // Geocode both cities with more specific queries
      console.log('Geocoding start city:', startCity);
      const startGeocode = await mapboxService.geocodeForward(`${startCity}, Ukraine`);
      console.log('Start geocode result:', startGeocode);
      
      console.log('Geocoding end city:', endCity);
      const endGeocode = await mapboxService.geocodeForward(`${endCity}, Ukraine`);
      console.log('End geocode result:', endGeocode);
      
      if (startGeocode.features.length === 0 || endGeocode.features.length === 0) {
        throw new Error('Could not find one or both cities');
      }
      
      const startCoords = startGeocode.features[0].center;
      const endCoords = endGeocode.features[0].center;
      
      console.log('Start coordinates:', startCoords);
      console.log('End coordinates:', endCoords);
      
      // Get directions with proper error handling
      console.log('Fetching directions...');
      const directions = await mapboxService.getDirections(
        [startCoords, endCoords], 
        'driving-traffic', 
        true
      );
      
      console.log('Directions response:', directions);
      
      if (!directions || !directions.routes || directions.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      const route = directions.routes[0];
      console.log('Selected route:', route);
      console.log('Route geometry:', route.geometry);
      
      // Fetch weather data
      let weatherCondition: 'clear' | 'cloudy' | 'light_rain' = 'clear';
      let temperature: number | undefined;
      
      try {
        console.log('Fetching weather for coordinates:', startCoords);
        const weatherPromise = weatherService.getCurrentWeather(startCoords[1], startCoords[0]);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Weather timeout')), 3000)
        );
        
        const weatherData = await Promise.race([weatherPromise, timeoutPromise]) as any;
        weatherCondition = weatherService.mapWeatherCondition(weatherData.weather[0].main);
        temperature = Math.round(weatherData.main.temp);
        console.log('Weather data:', weatherCondition, temperature + '°C');
      } catch (weatherError) {
        console.warn('Weather API failed, using fallback:', weatherError);
      }
      
      // Calculate route metrics
      const safetyScore = mapboxService.calculateTrafficBasedSafetyScore(route);
      const routeQuality = mapboxService.analyzeRouteQuality(route);
      
      const routeData: RouteData = {
        startCity,
        endCity,
        startCoords,
        endCoords,
        safetyScore: Math.round(safetyScore),
        distance: Math.round(route.distance / 1000),
        duration: Math.round(route.duration / 3600),
        durationFormatted: mapboxService.formatDuration(route.duration),
        distanceFormatted: mapboxService.formatDistance(route.distance),
        geometry: route.geometry, // This is crucial for map display
        transportMode: 'driving',
        trafficLevel: routeQuality.trafficLevel,
        roadQuality: routeQuality.roadQuality,
        estimatedDelay: routeQuality.estimatedDelay,
        weatherCondition,
        temperature,
        conflictRisk: safetyScore > 80 ? 'low' : 'moderate',
        alternativeRoutes: directions.routes.slice(1, 3),
        realRoute: true
      };
      
      console.log('Final route data:', routeData);
      onRouteRequest(routeData);
      
    } catch (error) {
      console.error('Route search error:', error);
      
      // Provide fallback data without geometry (no visual route)
      const estimatedDistance = 540; // Kyiv to Lviv approximate distance
      const estimatedDuration = 7; // Approximate driving time
      
      const mockRouteData: RouteData = {
        startCity,
        endCity,
        safetyScore: 75,
        distance: estimatedDistance,
        duration: estimatedDuration,
        durationFormatted: `${estimatedDuration}h 30m`,
        distanceFormatted: `${estimatedDistance} km`,
        weatherCondition: 'clear',
        temperature: 15,
        conflictRisk: 'low',
        trafficLevel: 'moderate',
        roadQuality: 'good',
        estimatedDelay: 15,
        transportMode: 'driving',
        realRoute: false
        // No geometry for fallback - will show markers only
      };
      
      console.log('Using fallback route data:', mockRouteData);
      onRouteRequest(mockRouteData);
    } finally {
      setIsSearching(false);
    }
  }, [translations, setIsSearching, onRouteRequest]);

  return { handleRouteSearch };
};
