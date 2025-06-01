import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface InteractiveMapProps {
  language: 'en' | 'ua';
  routeData?: any;
  isSearching?: boolean;
  onRegionSelect?: (region: string | null) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  language,
  routeData,
  isSearching,
  onRegionSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  const [alertsData, setAlertsData] = useState<any>(null);
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

  // Fetch alerts data for map overlay
  useEffect(() => {
    const fetchAlertsData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('explore-alerts-api', {
          body: { endpoint: 'alerts' }
        });
        
        if (!error && data?.data?.alerts) {
          setAlertsData(data.data.alerts);
        }
      } catch (error) {
        console.error('Error fetching alerts for map:', error);
      }
    };

    fetchAlertsData();
    
    // Refresh alerts data every 2 minutes
    const interval = setInterval(fetchAlertsData, 120000);
    return () => clearInterval(interval);
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
        addUkraineRegions();
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

  // Add Ukraine regions and alert overlays
  const addUkraineRegions = () => {
    if (!map.current) return;

    // Add clickable regions (simplified approach using administrative boundaries)
    map.current.on('click', (e) => {
      // Use geocoding to get region information
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      
      // For now, we'll use a simple approach to detect regions
      // In a production app, you'd want to use proper administrative boundary data
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxToken}&types=region`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const regionName = data.features[0].text;
            console.log('Selected region:', regionName);
            onRegionSelect?.(regionName);
          }
        })
        .catch(error => {
          console.error('Error geocoding region:', error);
        });
    });

    // Add alert markers
    if (alertsData && Array.isArray(alertsData)) {
      alertsData.forEach((alert: any) => {
        // For now, we'll place markers at approximate oblast centers
        // In a production app, you'd want exact coordinates
        const oblastCenters: { [key: string]: [number, number] } = {
          'Київська область': [30.5234, 50.4501],
          'Харківська область': [36.2310, 49.9935],
          'Дніпропетровська область': [35.0462, 48.4647],
          'Луганська область': [38.5045, 48.5740],
          'Автономна Республіка Крим': [34.1018, 44.9480],
          // Add more oblast centers as needed
        };

        const coords = oblastCenters[alert.location_oblast];
        if (coords) {
          const alertColor = getAlertMarkerColor(alert.alert_type);
          
          const marker = new mapboxgl.Marker({ 
            color: alertColor,
            scale: 0.8
          })
            .setLngLat(coords)
            .setPopup(
              new mapboxgl.Popup().setHTML(`
                <div class="p-2">
                  <strong>${alert.location_title}</strong><br/>
                  <span class="text-sm">${alert.alert_type.replace('_', ' ')}</span><br/>
                  <span class="text-xs text-gray-600">Since: ${new Date(alert.started_at).toLocaleString()}</span>
                </div>
              `)
            )
            .addTo(map.current!);
        }
      });
    }
  };

  const getAlertMarkerColor = (alertType: string): string => {
    switch (alertType) {
      case 'air_raid': return '#DC2626'; // red
      case 'artillery_shelling': return '#EA580C'; // orange
      case 'urban_fights': return '#9333EA'; // purple
      default: return '#EAB308'; // yellow
    }
  };

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

  // Update alert markers when alerts data changes
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      addUkraineRegions();
    }
  }, [alertsData]);

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
