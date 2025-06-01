
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
      analyzing: 'Analyzing route safety and weather conditions...'
    },
    ua: {
      mapTitle: 'Інтерактивна карта маршруту',
      noRoute: 'Введіть ваш маршрут для аналізу безпеки на карті',
      analyzing: 'Аналіз безпеки маршруту та погодних умов...'
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

  useEffect(() => {
    if (routeData && map.current) {
      console.log('Adding route visualization for:', routeData);
      
      // Clear existing markers and layers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Remove existing route layers if they exist
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

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

      // Add route line
      map.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON
      });

      // Style route based on safety score
      const routeColor = routeData.safetyScore >= 80 ? '#22c55e' : 
                        routeData.safetyScore >= 65 ? '#f59e0b' : '#ef4444';

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

      // Add route outline for better visibility
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
      }, 'route');

      // Fit bounds to show the route
      const bounds = new mapboxgl.LngLatBounds()
        .extend(startCoords)
        .extend(endCoords);
      
      map.current.fitBounds(bounds, { 
        padding: 100,
        maxZoom: 12
      });

      console.log('Route visualization added successfully');
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

      {/* Route Info Overlay */}
      {routeData && !isSearching && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              routeData.safetyScore >= 80 ? 'bg-green-500' : 
              routeData.safetyScore >= 65 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              Safety Score: {routeData.safetyScore}%
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Distance: {routeData.distanceFormatted || `${routeData.distance} km`}</div>
            <div>Duration: {routeData.durationFormatted || `${routeData.duration}h`}</div>
            <div>Mode: {routeData.transportMode || 'driving'}</div>
            {routeData.realRoute && (
              <div className="text-green-600 font-medium">✓ Real-time route</div>
            )}
            {routeData.error && (
              <div className="text-orange-600">⚠ Using fallback data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
