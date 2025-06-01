import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { alertsMapService } from '@/services/alertsMapService';

interface InteractiveMapProps {
  language: 'en' | 'ua';
  routeData?: any;
  isSearching?: boolean;
  onRegionSelect?: (region: string | null) => void;
  focusAlert?: any;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  language,
  routeData,
  isSearching,
  onRegionSelect,
  focusAlert
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
  const alertMarkers = useRef<mapboxgl.Marker[]>([]);

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
        console.log('Fetching fresh alerts data...');
        const { data, error } = await supabase.functions.invoke('explore-alerts-api', {
          body: { endpoint: 'alerts' }
        });
        
        if (!error && data?.data?.alerts) {
          console.log('Fresh alerts received:', data.data.alerts.length, 'alerts');
          const processedAlerts = alertsMapService.processAlertsForMap(data.data.alerts);
          setAlertsData(processedAlerts);
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

  // Handle focusing on specific alerts
  useEffect(() => {
    if (focusAlert && map.current) {
      console.log('Focusing map on alert:', focusAlert);
      
      // Get oblast center coordinates
      const oblast = focusAlert.location_oblast;
      const oblastCenters = {
        'Київська область': [30.5234, 50.4501],
        'Харківська область': [36.2310, 49.9935],
        'Дніпропетровська область': [35.0462, 48.4647],
        'Луганська область': [38.5045, 48.5740],
        'Донецька область': [37.8036, 48.0159],
        'Запорізька область': [35.1396, 47.8388],
        'Херсонська область': [32.6178, 46.6554],
        'Миколаївська область': [31.9946, 46.9750],
        'Одеська область': [30.7326, 46.4825],
        'Вінницька область': [28.4682, 49.2331],
        'Житомирська область': [28.6587, 50.2547],
        'Закарпатська область': [22.7183, 48.6208],
        'Івано-Франківська область': [24.7111, 48.9226],
        'Кіровоградська область': [32.2623, 48.5132],
        'Львівська область': [24.0232, 49.8397],
        'Полтавська область': [34.5514, 49.5883],
        'Рівненська область': [26.2518, 50.6199],
        'Сумська область': [34.8000, 50.9077],
        'Тернопільська область': [25.5948, 49.5535],
        'Хмельницька область': [26.9871, 49.4229],
        'Черкаська область': [32.0617, 49.4444],
        'Чернівецька область': [25.9358, 48.2920],
        'Чернігівська область': [31.2893, 51.4982],
        'Автономна Республіка Крим': [34.1018, 44.9480],
      };

      const coords = oblastCenters[oblast];
      if (coords) {
        map.current.flyTo({
          center: coords,
          zoom: 8,
          duration: 2000
        });

        // Add a temporary highlight marker
        const highlightMarker = new mapboxgl.Marker({ 
          color: '#FFD700', 
          scale: 1.5 
        })
          .setLngLat(coords)
          .addTo(map.current);

        // Remove highlight after 5 seconds
        setTimeout(() => {
          highlightMarker.remove();
        }, 5000);

        // Update region selection
        onRegionSelect?.(oblast);
      }
    }
  }, [focusAlert, onRegionSelect]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenError) return;

    try {
      console.log('Initializing Mapbox with token...');
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [31.1656, 48.3794],
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
        clearAlertMarkers();
        if (startMarker.current) startMarker.current.remove();
        if (endMarker.current) endMarker.current.remove();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
    }
  }, [mapboxToken, tokenError]);

  const clearAlertMarkers = () => {
    alertMarkers.current.forEach(marker => marker.remove());
    alertMarkers.current = [];
  };

  // Add Ukraine regions and alert overlays
  const addUkraineRegions = () => {
    if (!map.current) return;

    // Add clickable regions
    map.current.on('click', async (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxToken}&types=region`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const regionName = data.features[0].text;
          console.log('Selected region:', regionName);
          onRegionSelect?.(regionName);
          
          // Visual feedback - add a temporary marker
          const clickMarker = new mapboxgl.Marker({ color: '#3B82F6', scale: 0.8 })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current!);
          
          // Remove the click marker after 3 seconds
          setTimeout(() => {
            clickMarker.remove();
          }, 3000);
        }
      } catch (error) {
        console.error('Error geocoding region:', error);
      }
    });

    // Add alert markers
    updateAlertMarkers();
  };

  const updateAlertMarkers = () => {
    if (!map.current || !alertsData) return;

    // Clear existing markers
    clearAlertMarkers();

    console.log('Adding alert markers for', alertsData.length, 'alerts');

    alertsData.forEach((alert: any) => {
      if (!alert.coordinates) return;

      const alertColor = alertsMapService.getAlertColor(alert.alert_type);
      
      const marker = new mapboxgl.Marker({ 
        color: alertColor,
        scale: 0.8
      })
        .setLngLat(alert.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3 bg-gray-900 text-white rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${alertColor}"></div>
                <strong class="text-sm">${alert.location_title}</strong>
              </div>
              <div class="text-xs text-gray-300 mb-1">
                <strong>Oblast:</strong> ${alert.location_oblast}
              </div>
              <div class="text-xs text-gray-300 mb-1">
                <strong>Type:</strong> ${alert.alert_type.replace('_', ' ')}
              </div>
              <div class="text-xs text-gray-300 mb-1">
                <strong>Severity:</strong> ${alert.severity}
              </div>
              <div class="text-xs text-gray-400">
                <strong>Since:</strong> ${new Date(alert.started_at).toLocaleString()}
              </div>
            </div>
          `)
        )
        .addTo(map.current!);

      alertMarkers.current.push(marker);
    });
  };

  // Handle route data changes
  useEffect(() => {
    if (!map.current || !routeData) {
      return;
    }

    console.log('Processing route data:', routeData);

    // Clear existing route markers
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
      startMarker.current = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat(routeData.startCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Start:</strong> ${routeData.startCity}`))
        .addTo(map.current);
    }

    // Add end marker
    if (routeData.endCoords) {
      endMarker.current = new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat(routeData.endCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Destination:</strong> ${routeData.endCity}`))
        .addTo(map.current);
    }

    // Add route line if geometry exists
    if (routeData.geometry) {
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
    if (map.current && map.current.loaded() && alertsData) {
      updateAlertMarkers();
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
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
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
