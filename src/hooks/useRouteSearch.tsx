
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
    transportMode: 'driving' | 'bus'
  ) => {
    if (!startCity || !endCity) return;
    
    setIsSearching(true);
    
    try {
      const mapboxService = getMapboxService();
      const weatherService = getWeatherService();
      
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
      
      // Fetch real weather data for start city with timeout
      let weatherCondition: 'clear' | 'cloudy' | 'light_rain' = 'clear';
      let temperature: number | undefined;
      
      try {
        console.log('Fetching weather for start city coordinates:', startCoords);
        const weatherPromise = weatherService.getCurrentWeather(startCoords[1], startCoords[0]);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Weather timeout')), 3000)
        );
        
        const weatherData = await Promise.race([weatherPromise, timeoutPromise]) as any;
        weatherCondition = weatherService.mapWeatherCondition(weatherData.weather[0].main);
        temperature = Math.round(weatherData.main.temp);
        console.log('Weather data received:', weatherData.weather[0].main, 'mapped to:', weatherCondition, 'temp:', temperature + '°C');
      } catch (weatherError) {
        console.warn('Weather API failed, using fallback:', weatherError);
        // Keep default 'clear' weather condition and undefined temperature
      }
      
      // Use enhanced safety calculation with real traffic data
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
        geometry: route.geometry,
        transportMode,
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
      
      // Enhanced fallback with more realistic data
      const trafficLevels: ('light' | 'moderate' | 'heavy')[] = ['light', 'moderate', 'heavy'];
      const roadQualities: ('excellent' | 'good' | 'fair')[] = ['excellent', 'good', 'fair'];
      const weatherConditions: ('clear' | 'cloudy' | 'light_rain')[] = ['clear', 'cloudy', 'light_rain'];
      const conflictRisks: ('low' | 'moderate')[] = ['low', 'moderate'];
      
      const mockRouteData: RouteData = {
        startCity,
        endCity,
        safetyScore: Math.floor(Math.random() * 40) + 60,
        distance: Math.floor(Math.random() * 500) + 100,
        duration: Math.floor(Math.random() * 8) + 2,
        durationFormatted: `${Math.floor(Math.random() * 8) + 2}h ${Math.floor(Math.random() * 60)}m`,
        distanceFormatted: `${Math.floor(Math.random() * 500) + 100} km`,
        weatherCondition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temperature: Math.floor(Math.random() * 30) + 5,
        conflictRisk: conflictRisks[Math.floor(Math.random() * conflictRisks.length)],
        trafficLevel: trafficLevels[Math.floor(Math.random() * trafficLevels.length)],
        roadQuality: roadQualities[Math.floor(Math.random() * roadQualities.length)],
        estimatedDelay: Math.floor(Math.random() * 30),
        transportMode,
        error: translations.error,
        realRoute: false
      };
      
      onRouteRequest(mockRouteData);
    } finally {
      setIsSearching(false);
    }
  }, [translations, setIsSearching, onRouteRequest]);

  return { handleRouteSearch };
};
