
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
  const routeSource = useRef<string>('route-source');
  const startMarker = useRef<mapboxgl.Marker | null>(null);
  const endMarker = useRef<mapboxgl.Marker | null>(null);

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
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [31.1656, 48.3794], // Center on Ukraine
        zoom: 6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      console.log('Map initialized successfully');

      return () => {
        if (startMarker.current) startMarker.current.remove();
        if (endMarker.current) endMarker.current.remove();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
    }
  }, [mapboxToken, tokenError]);

  // Handle route data changes
  useEffect(() => {
    if (!map.current || !routeData) {
      console.log('Map or route data not available:', { map: !!map.current, routeData: !!routeData });
      return;
    }

    console.log('Processing route data:', routeData);

    // Clear existing markers
    if (startMarker.current) {
      startMarker.current.remove();
      startMarker.current = null;
    }
    if (endMarker.current) {
      endMarker.current.remove();
      endMarker.current = null;
    }

    // Add start marker
    if (routeData.startCoords) {
      console.log('Adding start marker at:', routeData.startCoords);
      startMarker.current = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat(routeData.startCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Start:</strong> ${routeData.startCity}`))
        .addTo(map.current);
    }

    // Add end marker
    if (routeData.endCoords) {
      console.log('Adding end marker at:', routeData.endCoords);
      endMarker.current = new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat(routeData.endCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Destination:</strong> ${routeData.endCity}`))
        .addTo(map.current);
    }

    // Add route line if geometry exists
    if (routeData.geometry) {
      console.log('Adding route geometry to map:', routeData.geometry);
      
      // Remove existing route source and layer
      if (map.current.getSource(routeSource.current)) {
        if (map.current.getLayer('route-layer')) {
          map.current.removeLayer('route-layer');
        }
        map.current.removeSource(routeSource.current);
      }

      // Create GeoJSON feature from geometry
      const routeGeoJSON = {
        type: 'Feature' as const,
        properties: {},
        geometry: routeData.geometry
      };

      console.log('Route GeoJSON:', routeGeoJSON);

      // Add route source
      map.current.addSource(routeSource.current, {
        type: 'geojson',
        data: routeGeoJSON
      });

      // Add route layer
      map.current.addLayer({
        id: 'route-layer',
        type: 'line',
        source: routeSource.current,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Fit map to route bounds
      if (routeData.startCoords && routeData.endCoords) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(routeData.startCoords);
        bounds.extend(routeData.endCoords);
        
        // Add some padding to include the entire route
        if (routeData.geometry && routeData.geometry.coordinates) {
          routeData.geometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
        }
        
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 12
        });
      }
    } else if (routeData.startCoords && routeData.endCoords) {
      // If no geometry but we have coordinates, fit to markers
      console.log('No geometry, fitting to markers');
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(routeData.startCoords);
      bounds.extend(routeData.endCoords);
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 10
      });
    }
  }, [routeData]);

  if (isLoadingToken) {
    return (
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-white">{t.loadingMap}</span>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError || !mapboxToken) {
    return (
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4 text-red-400">{t.mapError}</h3>
          <p className="text-sm text-gray-300">Mapbox token configuration issue. Please check the console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay for search */}
      {isSearching && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-white">Finding route...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
