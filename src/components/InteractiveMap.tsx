
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface InteractiveMapProps {
  language: 'en' | 'ua';
  routeData?: any;
  isSearching?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  language,
  routeData,
  isSearching
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  const translations = {
    en: {
      loadingMap: 'Loading map...',
      mapError: 'Unable to load map'
    },
    ua: {
      loadingMap: 'Завантаження карти...',
      mapError: 'Неможливо завантажити карту'
    }
  };

  const t = translations[language];

  // Fetch Mapbox token from Supabase secrets
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        console.log('Fetching Mapbox token from Supabase...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setTokenError(true);
          setIsLoadingToken(false);
          return;
        }
        
        if (data?.token) {
          console.log('Successfully received Mapbox token');
          setMapboxToken(data.token);
          setTokenError(false);
        } else {
          console.error('No token in response:', data);
          setTokenError(true);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setTokenError(true);
      } finally {
        setIsLoadingToken(false);
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenError) return;

    try {
      console.log('Initializing Mapbox with token...');
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [31.1656, 48.3794], // Center on Ukraine
        zoom: 6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      console.log('Map initialized successfully');

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
    }
  }, [mapboxToken, tokenError]);

  if (isLoadingToken) {
    return (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{t.loadingMap}</span>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError || !mapboxToken) {
    return (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4 text-red-600">{t.mapError}</h3>
          <p className="text-sm text-gray-600">Mapbox token configuration issue. Please check the console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay for search */}
      {isSearching && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Finding route...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
