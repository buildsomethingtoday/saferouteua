
import { useState } from 'react';
import { getMapboxService } from '../services/mapboxService';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface UseRouteSearchProps {
  translations: RouteInputTranslations;
  setIsSearching: (searching: boolean) => void;
  onRouteRequest: (data: RouteData) => void;
}

export const useRouteSearch = ({ translations, setIsSearching, onRouteRequest }: UseRouteSearchProps) => {
  const handleRouteSearch = async (
    startCity: string,
    endCity: string,
    transportMode: 'driving' | 'bus'
  ) => {
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
        weatherCondition: ['clear', 'cloudy', 'light_rain'][Math.floor(Math.random() * 3)],
        conflictRisk: safetyScore > 80 ? 'low' : 'moderate',
        alternativeRoutes: directions.routes.slice(1, 3),
        realRoute: true
      };
      
      console.log('Final route data:', routeData);
      onRouteRequest(routeData);
      
    } catch (error) {
      console.error('Route search error:', error);
      
      // Fallback to mock data if API fails
      const mockRouteData: RouteData = {
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
        error: translations.error,
        realRoute: false
      };
      
      onRouteRequest(mockRouteData);
    }
    
    setIsSearching(false);
  };

  return { handleRouteSearch };
};
