
import { useCallback } from 'react';
import { getMapboxService } from '../services/mapboxService';
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
    if (!startCity || !endCity) {
      console.log('Missing start or end city:', { startCity, endCity });
      return;
    }
    
    console.log('🚀 Starting route search for:', startCity, 'to', endCity);
    setIsSearching(true);
    
    try {
      // Get the async services to ensure proper token handling
      console.log('📡 Initializing services...');
      const mapboxService = await getMapboxService();
      const weatherService = await getWeatherService();
      console.log('✅ Services initialized successfully');
      
      // Geocode both cities with more specific queries
      console.log('🌍 Geocoding start city:', startCity);
      const startGeocode = await mapboxService.geocodeForward(`${startCity}, Ukraine`);
      console.log('📍 Start geocode result:', startGeocode);
      
      if (!startGeocode || !startGeocode.features || startGeocode.features.length === 0) {
        throw new Error(`Could not find start city: ${startCity}`);
      }
      
      console.log('🌍 Geocoding end city:', endCity);
      const endGeocode = await mapboxService.geocodeForward(`${endCity}, Ukraine`);
      console.log('📍 End geocode result:', endGeocode);
      
      if (!endGeocode || !endGeocode.features || endGeocode.features.length === 0) {
        throw new Error(`Could not find end city: ${endCity}`);
      }
      
      const startCoords = startGeocode.features[0].center;
      const endCoords = endGeocode.features[0].center;
      
      console.log('📍 Start coordinates:', startCoords);
      console.log('📍 End coordinates:', endCoords);
      
      // Get directions with proper error handling
      console.log('🛣️ Fetching directions...');
      const directions = await mapboxService.getDirections(
        [startCoords, endCoords], 
        'driving-traffic', 
        true
      );
      
      console.log('🛣️ Directions response:', directions);
      
      if (!directions || !directions.routes || directions.routes.length === 0) {
        throw new Error('No routes found between the selected cities');
      }
      
      const route = directions.routes[0];
      console.log('✅ Selected route:', route);
      console.log('🗺️ Route geometry type:', route.geometry?.type);
      console.log('🗺️ Route geometry coordinates length:', route.geometry?.coordinates?.length);
      
      // Fetch weather data with better error handling
      let weatherCondition: 'clear' | 'cloudy' | 'light_rain' = 'clear';
      let temperature: number | undefined;
      
      try {
        console.log('🌤️ Fetching weather for coordinates:', startCoords);
        const weatherData = await weatherService.getCurrentWeather(startCoords[1], startCoords[0]);
        weatherCondition = weatherService.mapWeatherCondition(weatherData.weather[0].main);
        temperature = Math.round(weatherData.main.temp);
        console.log('✅ Weather data retrieved:', weatherCondition, temperature + '°C');
      } catch (weatherError) {
        console.warn('⚠️ Weather API failed, using fallback:', weatherError);
        // Continue with default weather values
      }
      
      // Calculate route metrics
      console.log('📊 Calculating route metrics...');
      const safetyScore = mapboxService.calculateTrafficBasedSafetyScore(route);
      const routeQuality = mapboxService.analyzeRouteQuality(route);
      console.log('📊 Safety score:', safetyScore);
      console.log('📊 Route quality:', routeQuality);
      
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
      
      console.log('✅ Final route data prepared:', routeData);
      onRouteRequest(routeData);
      
    } catch (error) {
      console.error('❌ Route search error:', error);
      
      // Show the actual error
      const errorRouteData: RouteData = {
        startCity,
        endCity,
        transportMode: 'driving',
        realRoute: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      console.log('❌ Sending error route data:', errorRouteData);
      onRouteRequest(errorRouteData);
    } finally {
      setIsSearching(false);
    }
  }, [translations, setIsSearching, onRouteRequest]);

  return { handleRouteSearch };
};
