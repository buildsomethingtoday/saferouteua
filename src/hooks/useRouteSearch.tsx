import { useCallback } from 'react';
import { getMapboxService } from '../services/mapboxService';
import { getWeatherService } from '../services/weatherService';
import { getAlertsService } from '../services/alertsService';
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
      // Step 1: Get Mapbox service with detailed error handling
      console.log('📡 Step 1: Getting Mapbox service...');
      let mapboxService;
      try {
        mapboxService = await getMapboxService();
        console.log('✅ Mapbox service obtained successfully');
      } catch (mapboxError) {
        console.error('❌ Failed to get Mapbox service:', mapboxError);
        throw new Error(`Mapbox service initialization failed: ${mapboxError instanceof Error ? mapboxError.message : 'Unknown error'}`);
      }
      
      // Step 2: Geocode start city with detailed error handling
      console.log('🌍 Step 2: Geocoding start city:', startCity);
      let startGeocode;
      try {
        startGeocode = await mapboxService.geocodeForward(startCity);
        console.log('📍 Start geocode result:', {
          query: startCity,
          featuresCount: startGeocode?.features?.length || 0,
          firstResult: startGeocode?.features?.[0]?.place_name
        });
      } catch (geocodeError) {
        console.error('❌ Start city geocoding failed:', geocodeError);
        throw new Error(`Could not find start city "${startCity}": ${geocodeError instanceof Error ? geocodeError.message : 'Geocoding service error'}`);
      }
      
      if (!startGeocode?.features?.length) {
        console.error('❌ No results for start city:', startCity);
        throw new Error(`No results found for start city: ${startCity}. Please try a more specific location.`);
      }
      
      // Step 3: Geocode end city with detailed error handling
      console.log('🌍 Step 3: Geocoding end city:', endCity);
      let endGeocode;
      try {
        endGeocode = await mapboxService.geocodeForward(endCity);
        console.log('📍 End geocode result:', {
          query: endCity,
          featuresCount: endGeocode?.features?.length || 0,
          firstResult: endGeocode?.features?.[0]?.place_name
        });
      } catch (geocodeError) {
        console.error('❌ End city geocoding failed:', geocodeError);
        throw new Error(`Could not find end city "${endCity}": ${geocodeError instanceof Error ? geocodeError.message : 'Geocoding service error'}`);
      }
      
      if (!endGeocode?.features?.length) {
        console.error('❌ No results for end city:', endCity);
        throw new Error(`No results found for end city: ${endCity}. Please try a more specific location.`);
      }
      
      const startCoords: [number, number] = startGeocode.features[0].center;
      const endCoords: [number, number] = endGeocode.features[0].center;
      
      console.log('📍 Coordinates extracted:', {
        start: startCoords,
        end: endCoords,
        startPlace: startGeocode.features[0].place_name,
        endPlace: endGeocode.features[0].place_name
      });
      
      // Step 4: Get directions with detailed error handling
      console.log('🛣️ Step 4: Fetching directions...');
      let directions;
      try {
        directions = await mapboxService.getDirections(
          [startCoords, endCoords], 
          'driving-traffic', 
          true
        );
        console.log('🛣️ Directions response received:', {
          routesCount: directions?.routes?.length || 0,
          mainRoute: directions?.routes?.[0] ? {
            distance: directions.routes[0].distance,
            duration: directions.routes[0].duration
          } : null
        });
      } catch (directionsError) {
        console.error('❌ Directions API failed:', directionsError);
        throw new Error(`Could not get route directions: ${directionsError instanceof Error ? directionsError.message : 'Directions service error'}`);
      }
      
      if (!directions?.routes?.length) {
        console.error('❌ No routes found in directions response');
        throw new Error('No routes found between the selected cities. Please try different locations.');
      }
      
      const route = directions.routes[0];
      console.log('✅ Main route selected:', {
        distance: Math.round(route.distance / 1000) + ' km',
        duration: Math.round(route.duration / 3600) + 'h',
        hasGeometry: !!route.geometry
      });
      
      // Step 5: Fetch safety alerts data using BOTH coordinate-based AND city-based methods
      console.log('🚨 Step 5: Fetching safety alerts data...');
      let routeAlerts = [];
      let alertsSafetyScore = 75;
      
      try {
        const alertsService = getAlertsService();
        
        // Get alerts using city names (primary method)
        const cityBasedAlerts = await alertsService.getAlertsForCities(startCity, endCity);
        console.log('✅ City-based alerts retrieved:', {
          alertsCount: cityBasedAlerts.length,
          alerts: cityBasedAlerts.map(a => ({ 
            severity: a.severity, 
            location: a.location_name,
            oblast: a.location_oblast 
          }))
        });
        
        // Get alerts using coordinates (backup method)
        const coordBasedAlerts = await alertsService.getAlertsForRoute(startCoords, endCoords);
        console.log('✅ Coordinate-based alerts retrieved:', coordBasedAlerts.length);
        
        // Combine and deduplicate alerts
        const allAlerts = [...cityBasedAlerts, ...coordBasedAlerts];
        const uniqueAlerts = allAlerts.filter((alert, index, self) => 
          index === self.findIndex(a => a.id === alert.id)
        );
        
        routeAlerts = uniqueAlerts;
        alertsSafetyScore = alertsService.calculateRouteSafetyScore(routeAlerts);
        
        console.log('✅ Final safety alerts summary:', {
          totalAlerts: routeAlerts.length,
          cityBasedCount: cityBasedAlerts.length,
          coordBasedCount: coordBasedAlerts.length,
          uniqueCount: uniqueAlerts.length,
          safetyScore: alertsSafetyScore
        });
        
      } catch (alertsError) {
        console.warn('⚠️ Alerts API failed, using defaults:', alertsError);
        // Continue with default values
      }
      
      // Step 6: Fetch weather data with fallback
      console.log('🌤️ Step 6: Fetching weather data...');
      let weatherCondition: 'clear' | 'cloudy' | 'light_rain' = 'clear';
      let temperature: number | undefined;
      
      try {
        const weatherService = await getWeatherService();
        console.log('🌤️ Weather service obtained, fetching data for:', startCoords);
        const weatherData = await weatherService.getCurrentWeather(startCoords[1], startCoords[0]);
        weatherCondition = weatherService.mapWeatherCondition(weatherData.weather[0].main);
        temperature = Math.round(weatherData.main.temp);
        console.log('✅ Weather data retrieved:', {
          condition: weatherCondition,
          temperature: temperature + '°C',
          rawCondition: weatherData.weather[0].main
        });
      } catch (weatherError) {
        console.warn('⚠️ Weather API failed, using defaults:', weatherError);
        // Continue with default weather values
      }
      
      // Step 7: Calculate route metrics combining traffic and safety
      console.log('📊 Step 7: Calculating route metrics...');
      let trafficSafetyScore: number;
      let routeQuality: any;
      
      try {
        trafficSafetyScore = mapboxService.calculateTrafficBasedSafetyScore(route);
        routeQuality = mapboxService.analyzeRouteQuality(route);
        console.log('📊 Route analysis completed:', {
          trafficSafetyScore,
          alertsSafetyScore,
          trafficLevel: routeQuality.trafficLevel,
          roadQuality: routeQuality.roadQuality,
          estimatedDelay: routeQuality.estimatedDelay
        });
      } catch (analysisError) {
        console.warn('⚠️ Route analysis failed, using defaults:', analysisError);
        trafficSafetyScore = 75; // Default safety score
        routeQuality = {
          trafficLevel: 'moderate',
          roadQuality: 'good',
          estimatedDelay: 0
        };
      }
      
      // Combine traffic safety and alerts safety (weighted average)
      const combinedSafetyScore = Math.round((trafficSafetyScore * 0.3) + (alertsSafetyScore * 0.7));
      
      // Step 8: Create clean, serializable route data
      console.log('📋 Step 8: Creating route data object...');
      
      // Create a completely clean geometry object to avoid DataCloneError
      let cleanGeometry;
      if (route.geometry) {
        try {
          // Use JSON stringify/parse to create a clean copy
          cleanGeometry = JSON.parse(JSON.stringify(route.geometry));
          console.log('✅ Route geometry cleaned successfully');
        } catch (geometryError) {
          console.warn('⚠️ Failed to clean geometry, omitting:', geometryError);
          cleanGeometry = undefined;
        }
      }
      
      const routeData: RouteData = {
        startCity,
        endCity,
        startCoords,
        endCoords,
        safetyScore: combinedSafetyScore,
        distance: Math.round(route.distance / 1000),
        duration: Math.round(route.duration / 3600),
        durationFormatted: mapboxService.formatDuration(route.duration),
        distanceFormatted: mapboxService.formatDistance(route.distance),
        geometry: cleanGeometry,
        transportMode: 'driving',
        trafficLevel: routeQuality.trafficLevel,
        roadQuality: routeQuality.roadQuality,
        estimatedDelay: routeQuality.estimatedDelay,
        weatherCondition,
        temperature,
        conflictRisk: combinedSafetyScore > 80 ? 'low' : combinedSafetyScore > 60 ? 'moderate' : 'high',
        alternativeRoutes: directions.routes.slice(1, 3).map(r => ({
          distance: r.distance,
          duration: r.duration,
          geometry: r.geometry ? JSON.parse(JSON.stringify(r.geometry)) : undefined
        })),
        safetyAlerts: routeAlerts,
        realRoute: true
      };
      
      console.log('✅ Route data object created successfully:', {
        start: routeData.startCity,
        end: routeData.endCity,
        distance: routeData.distanceFormatted,
        duration: routeData.durationFormatted,
        safety: routeData.safetyScore,
        alertsCount: routeAlerts.length,
        hasGeometry: !!routeData.geometry
      });
      
      // Step 9: Send route data
      console.log('📤 Step 9: Sending route data...');
      onRouteRequest(routeData);
      console.log('✅ Route search completed successfully!');
      
    } catch (error) {
      console.error('❌ Route search failed at some step:', error);
      
      // Create detailed error message
      let errorMessage = 'Route search failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.log('📤 Sending error route data with message:', errorMessage);
      
      // Create error route data
      const errorRouteData: RouteData = {
        startCity,
        endCity,
        transportMode: 'driving',
        realRoute: false,
        error: errorMessage
      };
      
      onRouteRequest(errorRouteData);
    } finally {
      console.log('🔄 Setting isSearching to false');
      setIsSearching(false);
    }
  }, [translations, setIsSearching, onRouteRequest]);

  return { handleRouteSearch };
};
