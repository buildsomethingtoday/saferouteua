
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Clock, Cloud, AlertTriangle, MapPin, Gauge, Navigation, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '../hooks/use-mobile';

interface InteractiveMapProps {
  language: 'en' | 'ua';
  routeData: any;
  isSearching: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ language, routeData, isSearching }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const isMobile = useIsMobile();

  const translations = {
    en: {
      mapTitle: 'Interactive Route Map',
      noRoute: 'Enter your route to see detailed analysis on the map',
      analyzing: 'Analyzing route and traffic conditions...',
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      transportMode: 'Transport Mode',
      weather: 'Weather',
      temperature: 'Temperature',
      conflictRisk: 'Safety Risk',
      trafficLevel: 'Traffic Level',
      roadQuality: 'Road Quality',
      estimatedDelay: 'Traffic Delay',
      realTimeData: 'Real-time Data',
      fallbackData: 'Estimated Data',
      transportModes: {
        driving: 'Driving',
        bus: 'Bus'
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
      },
      trafficLevels: {
        light: 'Light traffic',
        moderate: 'Moderate traffic',
        heavy: 'Heavy traffic'
      },
      roadQualities: {
        excellent: 'Excellent roads',
        good: 'Good roads',
        fair: 'Fair roads'
      }
    },
    ua: {
      mapTitle: 'Інтерактивна карта маршруту',
      noRoute: 'Введіть ваш маршрут для детального аналізу на карті',
      analyzing: 'Аналіз маршруту та умов руху...',
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Тривалість',
      transportMode: 'Вид транспорту',
      weather: 'Погода',
      temperature: 'Температура',
      conflictRisk: 'Ризик конфлікту',
      trafficLevel: 'Рівень трафіку',
      roadQuality: 'Якість доріг',
      estimatedDelay: 'Затримка через трафік',
      realTimeData: 'Дані в реальному часі',
      fallbackData: 'Оціночні дані',
      transportModes: {
        driving: 'Автомобіль',
        bus: 'Автобус'
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
      },
      trafficLevels: {
        light: 'Легкий трафік',
        moderate: 'Помірний трафік',
        heavy: 'Важкий трафік'
      },
      roadQualities: {
        excellent: 'Відмінні дороги',
        good: 'Хороші дороги',
        fair: 'Задовільні дороги'
      }
    }
  };

  const t = translations[language];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hlaWtoaW1yYW4wMSIsImEiOiJjbWJkZDY3enUxNXN1MnFuNnI0bzZwZXc0In0.fb4W6ahWd3Ook2vguHozPA';

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
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

  const getTrafficBadgeVariant = (level: string) => {
    switch (level) {
      case 'light': return 'default';
      case 'moderate': return 'secondary';
      case 'heavy': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'moderate': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

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

        // Fit bounds to show the route with mobile-appropriate padding
        const bounds = new mapboxgl.LngLatBounds()
          .extend(startCoords)
          .extend(endCoords);
        
        map.current.fitBounds(bounds, { 
          padding: isMobile ? { top: 150, bottom: 150, left: 50, right: 50 } : 100,
          maxZoom: isMobile ? 10 : 12
        });

        console.log('Route visualization added successfully');
      } catch (error) {
        console.error('Error adding route visualization:', error);
      }
    }
  }, [routeData, isMobile]);

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

      {/* Amazing Desktop Route Info Overlay - hide on mobile */}
      {routeData && !isSearching && !isMobile && (
        <div className="absolute top-4 left-4 w-80">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t.routeDetails}</h3>
                  <p className="text-blue-100 text-sm">Live route analysis</p>
                </div>
              </div>
            </div>

            {/* Data Source Badge */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-800">
                    {routeData.realRoute ? t.realTimeData : t.fallbackData}
                  </span>
                </div>
                <Badge variant={routeData.realRoute ? "default" : "secondary"} className="px-3 py-1 text-xs font-medium">
                  <div className={`w-2 h-2 rounded-full mr-2 ${routeData.realRoute ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
                  {routeData.realRoute ? 'Live' : 'Est.'}
                </Badge>
              </div>
            </div>

            {/* Main Stats */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t.distance}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {routeData.distanceFormatted || `${routeData.distance} km`}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t.duration}</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {routeData.durationFormatted || `${routeData.duration}h`}
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="px-6 pb-6 space-y-3">
              {/* Traffic Level */}
              {routeData.trafficLevel && (
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">{t.trafficLevel}</span>
                  </div>
                  <Badge variant={getTrafficBadgeVariant(routeData.trafficLevel)} className="px-3 py-1 font-medium">
                    {t.trafficLevels[routeData.trafficLevel]}
                  </Badge>
                </div>
              )}

              {/* Safety Risk */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">{t.conflictRisk}</span>
                </div>
                <Badge variant={getRiskBadgeVariant(routeData.conflictRisk)} className="px-3 py-1 font-medium">
                  {t.riskLevels[routeData.conflictRisk]}
                </Badge>
              </div>

              {/* Weather */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">{t.weather}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    {t.weatherConditions[routeData.weatherCondition]}
                  </div>
                  {routeData.temperature !== undefined && (
                    <div className="text-sm text-gray-600 font-medium">{routeData.temperature}°C</div>
                  )}
                </div>
              </div>

              {/* Traffic Delay Alert */}
              {routeData.estimatedDelay !== undefined && routeData.estimatedDelay > 0 && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-orange-800">{t.estimatedDelay}</div>
                      <div className="text-sm text-orange-700 font-medium">+{routeData.estimatedDelay} minutes due to traffic</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {routeData.error && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-800">API Notice</div>
                      <div className="text-amber-700 text-sm">{routeData.error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
