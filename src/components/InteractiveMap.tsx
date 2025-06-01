import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Clock, Cloud, AlertTriangle, Star } from 'lucide-react';

interface InteractiveMapProps {
  language: 'en' | 'ua';
  routeData: any;
  isSearching: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ language, routeData, isSearching }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const translations = {
    en: {
      mapTitle: 'Interactive Route Map',
      noRoute: 'Enter your route to see safety analysis on the map',
      analyzing: 'Analyzing route safety and weather conditions...',
      safetyScore: 'Safety Score',
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      transportMode: 'Transport Mode',
      weather: 'Weather',
      conflictRisk: 'Conflict Risk',
      alternativeSuggestion: 'Alternative Suggestion',
      realTimeData: 'Real-time Data',
      fallbackData: 'Estimated Data',
      transportModes: {
        driving: 'Driving',
        walking: 'Walking',
        cycling: 'Cycling'
      },
      weatherConditions: {
        clear: 'Clear skies',
        cloudy: 'Cloudy',
        light_rain: 'Light rain'
      },
      riskLevels: {
        low: 'Low risk',
        moderate: 'Moderate risk',
        high: 'High risk'
      }
    },
    ua: {
      mapTitle: 'Інтерактивна карта маршруту',
      noRoute: 'Введіть ваш маршрут для аналізу безпеки на карті',
      analyzing: 'Аналіз безпеки маршруту та погодних умов...',
      safetyScore: 'Оцінка безпеки',
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Тривалість',
      transportMode: 'Вид транспорту',
      weather: 'Погода',
      conflictRisk: 'Ризик конфлікту',
      alternativeSuggestion: 'Альтернативна пропозиція',
      realTimeData: 'Дані в реальному часі',
      fallbackData: 'Оціночні дані',
      transportModes: {
        driving: 'Автомобіль',
        walking: 'Пішки',
        cycling: 'Велосипед'
      },
      weatherConditions: {
        clear: 'Ясне небо',
        cloudy: 'Хмарно',
        light_rain: 'Невеликий дощ'
      },
      riskLevels: {
        low: 'Низький ризик',
        moderate: 'Помірний ризик',
        high: 'Високий ризик'
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hlaWtoaW1yYW4wMSIsImEiOiJjbWJkZDY3enUxNXN1MnFuNnI0bzZwZXc0In0.fb4W6ahWd3Ook2vguHozPA';
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.1656, 48.3794], // Center of Ukraine
      zoom: 6
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup function
    return () => {
      map.current?.remove();
    };
  }, []);

  // Helper function to safely remove route layers and source
  const cleanupRouteVisualization = () => {
    if (!map.current) return;

    try {
      // Remove layers first (in reverse order of creation)
      const layersToRemove = ['route', 'route-outline'];
      layersToRemove.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      // Then remove the source
      if (map.current?.getSource('route')) {
        map.current.removeSource('route');
      }
    } catch (error) {
      console.warn('Error cleaning up route visualization:', error);
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300 text-green-800';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-200 text-green-900';
    if (score >= 60) return 'bg-yellow-200 text-yellow-900';
    return 'bg-red-200 text-red-900';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-700';
      case 'moderate': return 'text-yellow-700';
      case 'high': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  useEffect(() => {
    if (routeData && map.current) {
      console.log('Adding route visualization for:', routeData);
      
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Safely cleanup existing route visualization
      cleanupRouteVisualization();

      let startCoords, endCoords;

      // Use real coordinates if available, otherwise fallback to city mapping
      if (routeData.startCoords && routeData.endCoords) {
        startCoords = routeData.startCoords;
        endCoords = routeData.endCoords;
      } else {
        startCoords = getCoordinatesForCity(routeData.startCity);
        endCoords = getCoordinatesForCity(routeData.endCity);
      }

      console.log('Start coordinates:', startCoords, 'for city:', routeData.startCity);
      console.log('End coordinates:', endCoords, 'for city:', routeData.endCity);

      // Add start marker
      const startMarker = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat(startCoords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Start: ${routeData.startCity}`))
        .addTo(map.current);
      
      markers.current.push(startMarker);

      // Add end marker
      const endMarker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(endCoords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Destination: ${routeData.endCity}`))
        .addTo(map.current);
      
      markers.current.push(endMarker);

      // Add route visualization
      let routeGeoJSON;
      
      if (routeData.geometry && routeData.realRoute) {
        // Use real route geometry from Mapbox Directions API
        routeGeoJSON = {
          type: 'Feature' as const,
          properties: {
            safetyScore: routeData.safetyScore
          },
          geometry: routeData.geometry
        };
        console.log('Using real route geometry from Mapbox API');
      } else {
        // Fallback to straight line
        routeGeoJSON = {
          type: 'Feature' as const,
          properties: {
            safetyScore: routeData.safetyScore
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: [startCoords, endCoords]
          }
        };
        console.log('Using fallback straight line geometry');
      }

      // Add route source - make sure it doesn't already exist
      try {
        map.current.addSource('route', {
          type: 'geojson',
          data: routeGeoJSON
        });

        // Style route based on safety score
        const routeColor = routeData.safetyScore >= 80 ? '#22c55e' : 
                          routeData.safetyScore >= 65 ? '#f59e0b' : '#ef4444';

        // Add route outline first (background layer)
        map.current.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 8,
            'line-opacity': 0.6
          }
        });

        // Add main route line on top
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routeColor,
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        // Fit bounds to show the route
        const bounds = new mapboxgl.LngLatBounds()
          .extend(startCoords)
          .extend(endCoords);
        
        map.current.fitBounds(bounds, { 
          padding: 100,
          maxZoom: 12
        });

        console.log('Route visualization added successfully');
      } catch (error) {
        console.error('Error adding route visualization:', error);
      }
    }
  }, [routeData]);

  // Enhanced coordinate mapping for Ukrainian cities
  const getCoordinatesForCity = (city: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      // Major cities
      'Kyiv': [30.5234, 50.4501],
      'Kiev': [30.5234, 50.4501],
      'Lviv': [24.0232, 49.8397],
      'Odesa': [30.7233, 46.4825],
      'Odessa': [30.7233, 46.4825],
      'Dnipro': [35.0462, 48.4647],
      'Kharkiv': [36.2304, 49.9935],
      'Chernivtsi': [25.9358, 48.2916],
      'Zakarpattia': [22.7202, 48.6208],
      'Lutsk': [25.3424, 50.7593],
      'Rivne': [26.2516, 50.6199],
      'Ternopil': [25.5948, 49.5535],
      'Ivano-Frankivsk': [24.7111, 48.9226],
      'Uzhhorod': [22.2879, 48.6208],
      'Vinnytsia': [28.4682, 49.2331],
      'Zhytomyr': [28.6587, 50.2547],
      'Cherkasy': [32.0617, 49.4285],
      'Poltava': [34.5407, 49.5883],
      'Sumy': [34.7981, 50.9077],
      'Chernihiv': [31.2893, 51.4982],
      'Kropyvnytskyi': [32.2623, 48.5132],
      'Mykolaiv': [31.9946, 46.9750],
      'Kherson': [32.6169, 46.6354],
      'Zaporizhzhia': [35.1396, 47.8388],
      'Mariupol': [37.5495, 47.0971],
      'Kramatorsk': [37.5562, 48.7233],
      'Sloviansk': [37.6198, 48.8671]
    };
    
    const coords = cityCoords[city] || cityCoords[city.toLowerCase()] || cityCoords[city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()];
    
    if (coords) {
      console.log(`Found coordinates for ${city}:`, coords);
      return coords;
    }
    
    console.warn(`No coordinates found for city: ${city}, using default`);
    return [31.1656, 48.3794]; // Default to center of Ukraine
  };

  return (
    <div className="absolute inset-0 bg-white">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {isSearching && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{t.analyzing}</p>
          </div>
        </div>
      )}

      {!routeData && !isSearching && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>{t.noRoute}</p>
          </div>
        </div>
      )}

      {/* Enhanced Route Info Overlay */}
      {routeData && !isSearching && (
        <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-xl p-6 max-w-sm border border-gray-100">
          {/* Safety Score Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-semibold text-gray-900">{t.safetyScore}</span>
            </div>
            <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getSafetyScoreColor(routeData.safetyScore)}`}>
              {routeData.safetyScore}%
            </div>
          </div>

          {/* Data Source Indicator */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-4">
            <span className="text-sm font-medium text-blue-800">
              {routeData.realRoute ? t.realTimeData : t.fallbackData}
            </span>
            <div className={`w-3 h-3 rounded-full ${routeData.realRoute ? 'bg-green-500' : 'bg-orange-500'}`} />
          </div>

          {/* Route Details */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{t.routeDetails}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">{t.distance}</div>
                <div className="text-xl font-bold text-gray-900">
                  {routeData.distanceFormatted || `${routeData.distance} km`}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">{t.duration}</div>
                <div className="text-xl font-bold text-gray-900">
                  {routeData.durationFormatted || `${routeData.duration}h`}
                </div>
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          {routeData.transportMode && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{t.transportMode}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {t.transportModes[routeData.transportMode] || routeData.transportMode}
              </span>
            </div>
          )}

          {/* Weather Conditions */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-3">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{t.weather}</span>
            </div>
            <span className="text-sm font-medium text-blue-700 capitalize">
              {t.weatherConditions[routeData.weatherCondition] || routeData.weatherCondition}
            </span>
          </div>

          {/* Conflict Risk */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-900">{t.conflictRisk}</span>
            </div>
            <span className={`text-sm font-medium capitalize ${getRiskColor(routeData.conflictRisk)}`}>
              {t.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
            </span>
          </div>

          {/* Alternative Suggestion */}
          {routeData.alternativeSuggestion && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-800 mb-1">{t.alternativeSuggestion}</div>
                  <div className="text-sm text-green-700">{routeData.alternativeSuggestion}</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {routeData.error && (
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 mt-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-orange-800">API Notice</div>
                  <div className="text-sm text-orange-700">{routeData.error}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
