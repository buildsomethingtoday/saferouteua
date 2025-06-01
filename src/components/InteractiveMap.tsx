
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InteractiveMapProps {
  language: 'en' | 'ua';
  routeData: any;
  isSearching: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ language, routeData, isSearching }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInputVisible, setTokenInputVisible] = useState<boolean>(true);

  const translations = {
    en: {
      enterToken: 'Enter your Mapbox public token to display the map',
      tokenPlaceholder: 'pk.eyJ1...',
      loadMap: 'Load Map',
      getToken: 'Get your free token at mapbox.com',
      mapTitle: 'Interactive Route Map',
      noRoute: 'Enter your route to see safety analysis on the map',
      analyzing: 'Analyzing route safety and weather conditions...'
    },
    ua: {
      enterToken: 'Введіть ваш публічний токен Mapbox для відображення карти',
      tokenPlaceholder: 'pk.eyJ1...',
      loadMap: 'Завантажити карту',
      getToken: 'Отримайте безкоштовний токен на mapbox.com',
      mapTitle: 'Інтерактивна карта маршруту',
      noRoute: 'Введіть ваш маршрут для аналізу безпеки на карті',
      analyzing: 'Аналіз безпеки маршруту та погодних умов...'
    }
  };

  const t = translations[language];

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.1656, 48.3794], // Center of Ukraine
      zoom: 6
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    setTokenInputVisible(false);
  };

  useEffect(() => {
    if (routeData && map.current) {
      // Add route visualization
      const startCoords = getCoordinatesForCity(routeData.startCity);
      const endCoords = getCoordinatesForCity(routeData.endCity);

      // Add markers
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat(startCoords)
        .setPopup(new mapboxgl.Popup().setText(routeData.startCity))
        .addTo(map.current);

      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(endCoords)
        .setPopup(new mapboxgl.Popup().setText(routeData.endCity))
        .addTo(map.current);

      // Fit bounds to show both cities
      const bounds = new mapboxgl.LngLatBounds()
        .extend(startCoords)
        .extend(endCoords);
      
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [routeData]);

  // Simple coordinate mapping for major Ukrainian cities
  const getCoordinatesForCity = (city: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      'Kyiv': [30.5234, 50.4501],
      'Lviv': [24.0232, 49.8397],
      'Odesa': [30.7233, 46.4825],
      'Dnipro': [35.0462, 48.4647],
      'Kharkiv': [36.2304, 49.9935],
      'Chernivtsi': [25.9358, 48.2916],
      'Zakarpattia': [22.7202, 48.6208],
    };
    return cityCoords[city] || [31.1656, 48.3794];
  };

  if (tokenInputVisible) {
    return (
      <Card className="h-[600px] shadow-xl bg-white border-0 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">{t.mapTitle}</h3>
          <p className="text-gray-600 mb-4">{t.enterToken}</p>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder={t.tokenPlaceholder}
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full"
            />
            <Button 
              onClick={initializeMap}
              disabled={!mapboxToken}
              className="w-full"
            >
              {t.loadMap}
            </Button>
            <p className="text-sm text-blue-600">
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer">
                {t.getToken}
              </a>
            </p>
          </div>
        </div>
      </Card>
    );
  }

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
