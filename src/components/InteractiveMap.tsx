
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

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
      
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add route visualization
      const startCoords = getCoordinatesForCity(routeData.startCity);
      const endCoords = getCoordinatesForCity(routeData.endCity);

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

      // Add route line between cities
      const routeLineGeoJSON = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [startCoords, endCoords]
        }
      };

      // Remove existing route source and layer if they exist
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Add route line
      map.current.addSource('route', {
        type: 'geojson',
        data: routeLineGeoJSON
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Fit bounds to show both cities
      const bounds = new mapboxgl.LngLatBounds()
        .extend(startCoords)
        .extend(endCoords);
      
      map.current.fitBounds(bounds, { 
        padding: 100,
        maxZoom: 10
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
      
      // Additional cities
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
    <Card className="h-[600px] shadow-xl bg-white border-0 overflow-hidden">
      <div className="relative h-full">
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
      </div>
    </Card>
  );
};

export default InteractiveMap;
