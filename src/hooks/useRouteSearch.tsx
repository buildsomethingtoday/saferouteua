
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
      console.log('❌ Missing start or end city:', { startCity, endCity });
      return;
    }
    
    console.log('🚀 Starting route search for:', startCity, 'to', endCity);
    setIsSearching(true);
    
    try {
      // Get the async services to ensure proper token handling
      console.log('📡 Getting Mapbox service...');
      const mapboxService = await getMapboxService();
      console.log('✅ Mapbox service obtained');
      
      // Geocode both cities with more specific queries
      console.log('🌍 Geocoding start city:', startCity);
      const startGeocode = await mapboxService.geocodeForward(`${startCity}`);
      console.log('📍 Start geocode result:', startGeocode);
      
      if (!startGeocode?.features?.length) {
        throw new Error(`Could not find start city: ${startCity}`);
      }
      
      console.log('🌍 Geocoding end city:', endCity);
      const endGeocode = await mapboxService.geocodeForward(`${endCity}`);
      console.log('📍 End geocode result:', endGeocode);
      
      if (!endGeocode?.features?.length) {
        throw new Error(`Could not find end city: ${endCity}`);
      }
      
      const startCoords: [number, number] = startGeocode.features[0].center;
      const endCoords: [number, number] = endGeocode.features[0].center;
      
      console.log('📍 Start coordinates:', startCoords);
      console.log('📍 End coordinates:', endCoords);
      
      // Get directions
      console.log('🛣️ Fetching directions...');
      const directions = await mapboxService.getDirections(
        [startCoords, endCoords], 
        'driving-traffic', 
        true
      );
      
      console.log('🛣️ Directions response received');
      
      if (!directions?.routes?.length) {
        throw new Error('No routes found between the selected cities');
      }
      
      const route = directions.routes[0];
      console.log('✅ Selected route found, distance:', route.distance, 'duration:', route.duration);
      
      // Fetch weather data
      let weatherCondition: 'clear' | 'cloudy' | 'light_rain' = 'clear';
      let temperature: number | undefined;
      
      try {
        console.log('🌤️ Getting weather service...');
        const weatherService = await getWeatherService();
        console.log('🌤️ Fetching weather for coordinates:', startCoords);
        const weatherData = await weatherService.getCurrentWeather(startCoords[1], startCoords[0]);
        weatherCondition = weatherService.mapWeatherCondition(weatherData.weather[0].main);
        temperature = Math.round(weatherData.main.temp);
        console.log('✅ Weather data retrieved:', weatherCondition, temperature + '°C');
      } catch (weatherError) {
        console.warn('⚠️ Weather API failed, using defaults:', weatherError);
      }
      
      // Calculate route metrics
      console.log('📊 Calculating route metrics...');
      const safetyScore = mapboxService.calculateTrafficBasedSafetyScore(route);
      const routeQuality = mapboxService.analyzeRouteQuality(route);
      console.log('📊 Safety score:', safetyScore);
      console.log('📊 Route quality:', routeQuality);
      
      // Create route data with clean serializable objects
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
        geometry: route.geometry ? JSON.parse(JSON.stringify(route.geometry)) : undefined, // Deep clone geometry
        transportMode: 'driving',
        trafficLevel: routeQuality.trafficLevel,
        roadQuality: routeQuality.roadQuality,
        estimatedDelay: routeQuality.estimatedDelay,
        weatherCondition,
        temperature,
        conflictRisk: safetyScore > 80 ? 'low' : 'moderate',
        alternativeRoutes: directions.routes.slice(1, 3).map(r => ({
          distance: r.distance,
          duration: r.duration,
          geometry: r.geometry ? JSON.parse(JSON.stringify(r.geometry)) : undefined
        })),
        realRoute: true
      };
      
      console.log('✅ Route data prepared successfully');
      console.log('📋 Route summary:', {
        start: startCity,
        end: endCity,
        distance: routeData.distanceFormatted,
        duration: routeData.durationFormatted,
        safety: routeData.safetyScore
      });
      
      onRouteRequest(routeData);
      console.log('✅ Route request completed successfully');
      
    } catch (error) {
      console.error('❌ Route search error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during route search';
      
      // Create error route data
      const errorRouteData: RouteData = {
        startCity,
        endCity,
        transportMode: 'driving',
        realRoute: false,
        error: errorMessage
      };
      
      console.log('❌ Sending error route data');
      onRouteRequest(errorRouteData);
    } finally {
      console.log('🔄 Setting isSearching to false');
      setIsSearching(false);
    }
  }, [translations, setIsSearching, onRouteRequest]);

  return { handleRouteSearch };
};
