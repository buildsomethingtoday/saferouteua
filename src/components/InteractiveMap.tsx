import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { invoke } from '@/integrations/api';
import { alertsMapService } from '@/services/alertsMapService';
import { localizeLocation, localizeOblast } from '@/utils/localizeLocation';

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
  const [allAlertsData, setAllAlertsData] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const routeSource = useRef<string>('route-source');
  const startMarker = useRef<mapboxgl.Marker | null>(null);
  const endMarker = useRef<mapboxgl.Marker | null>(null);
  const alertMarkers = useRef<mapboxgl.Marker[]>([]);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);

  const translations = {
    en: {
      loadingMap: 'Loading map...',
      mapError: 'Unable to load map',
      mapErrorDetails: 'Map configuration issue. Please try again later.',
      findingRoute: 'Finding route...',
      activeAlertsLabel: 'Active Alerts:',
      typesLabel: 'Types:',
      latestLabel: 'Latest:',
      oblastLabel: 'Oblast:',
      startLabel: 'Start:',
      destinationLabel: 'Destination:',
      alertTypes: {
        air_raid: 'Air Raid',
        artillery_shelling: 'Artillery',
        urban_fights: 'Urban Fights',
        missile_threat: 'Missile',
        chemical_threat: 'Chemical'
      } as { [key: string]: string }
    },
    ua: {
      loadingMap: 'Завантаження карти...',
      mapError: 'Неможливо завантажити карту',
      mapErrorDetails: 'Проблема з налаштуванням карти. Спробуйте пізніше.',
      findingRoute: 'Пошук маршруту...',
      activeAlertsLabel: 'Активні сповіщення:',
      typesLabel: 'Типи:',
      latestLabel: 'Останнє:',
      oblastLabel: 'Область:',
      startLabel: 'Початок:',
      destinationLabel: 'Призначення:',
      alertTypes: {
        air_raid: 'Повітряна тривога',
        artillery_shelling: 'Артобстріл',
        urban_fights: 'Вуличні бої',
        missile_threat: 'Ракетна загроза',
        chemical_threat: 'Хімічна загроза'
      } as { [key: string]: string }
    }
  };

  const t = translations[language];

  // Map event handlers are registered once, so they read the language
  // through a ref to avoid rendering popups with a stale language.
  const languageRef = useRef(language);
  languageRef.current = language;
  const currentT = () => translations[languageRef.current];
  const dateLocale = () => (languageRef.current === 'ua' ? 'uk-UA' : 'en-US');

  // Harmonized threat palette: a tight red/amber family, no stray hues
  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'air_raid': return '#ff453a';
      case 'artillery_shelling': return '#ff9f0a';
      case 'urban_fights': return '#ff375f';
      case 'missile_threat': return '#ff6961';
      case 'chemical_threat': return '#ffd60a';
      default: return '#8e8e93';
    }
  };

  // Helper function to clean up current popup
  const cleanupCurrentPopup = () => {
    if (currentPopup.current) {
      currentPopup.current.remove();
      currentPopup.current = null;
    }
  };

  // Fetch Mapbox token from Supabase secrets
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        console.log('Fetching Mapbox token from Supabase...');
        const { data, error } = await invoke('get-mapbox-token');
        
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

  // Enhanced alerts data fetching with immediate loading and better caching
  useEffect(() => {
    const fetchAlertsData = async () => {
      try {
        console.log('🔄 Fetching alerts data immediately for map...');
        const { data, error } = await invoke('explore-alerts-api', {
          body: { endpoint: 'alerts' }
        });
        
        if (!error && data?.data?.alerts) {
          console.log('✅ Map alerts received:', data.data.alerts.length, 'alerts');
          
          // Store all alerts for historical checking
          setAllAlertsData(data.data.alerts);
          
          // Filter alerts to only show those from the last 72 hours
          const now = new Date();
          const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
          
          const recentAlerts = data.data.alerts.filter((alert: any) => {
            const alertDate = new Date(alert.started_at);
            return alertDate >= seventyTwoHoursAgo && !alert.finished_at;
          });
          
          console.log('📍 Recent alerts for map (last 72 hours):', recentAlerts.length, 'alerts');
          const processedAlerts = alertsMapService.processAlertsForMap(recentAlerts);
          setAlertsData(processedAlerts);
        } else {
          console.error('❌ Error fetching alerts for map:', error);
        }
      } catch (error) {
        console.error('❌ Error in fetchAlertsData:', error);
      }
    };

    // Fetch immediately when component mounts
    fetchAlertsData();
    
    // Refresh alerts data every 30 seconds for better responsiveness
    const interval = setInterval(fetchAlertsData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle focusing on specific alerts
  useEffect(() => {
    if (focusAlert && map.current && isMapLoaded) {
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
  }, [focusAlert, onRegionSelect, isMapLoaded]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenError) return;

    try {
      console.log('🗺️ Initializing Mapbox with token...');
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [31.1656, 48.3794],
        zoom: 6,
        dragRotate: false,
        pitchWithRotate: false
      });

      // Pinch/double-tap zoom stays on for touch devices; rotation stays
      // locked so the map is always north-up.
      map.current.touchZoomRotate.disableRotation();

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      if (import.meta.env.DEV) {
        (window as any).__map = map.current;
      }

      // Outline Ukraine's national border as soon as the style is ready
      // ('style.load' fires well before 'load', which waits for all tiles).
      map.current.on('style.load', () => {
        if (map.current!.getSource('country-boundaries')) return;

        map.current!.addSource('country-boundaries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1'
        });

        // worldview is a comma-separated list (e.g. "AR,CN,...,US") or "all" —
        // equality against "US" matches nothing, so use a substring check.
        const ukraineFilter: any = [
          'all',
          ['==', ['get', 'iso_3166_1'], 'UA'],
          ['any', ['==', ['get', 'worldview'], 'all'], ['in', 'US', ['string', ['get', 'worldview']]]]
        ];

        map.current!.addLayer({
          id: 'ukraine-outline-glow',
          type: 'line',
          source: 'country-boundaries',
          'source-layer': 'country_boundaries',
          filter: ukraineFilter,
          paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.08,
            'line-blur': 4
          }
        });

        map.current!.addLayer({
          id: 'ukraine-outline',
          type: 'line',
          source: 'country-boundaries',
          'source-layer': 'country_boundaries',
          filter: ukraineFilter,
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.2,
            'line-opacity': 0.4
          }
        });
      });

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully');
        setIsMapLoaded(true);
        addUkraineRegions();
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
      });

      console.log('✅ Map initialized successfully');

      return () => {
        cleanupCurrentPopup();
        clearAlertMarkers();
        if (startMarker.current) startMarker.current.remove();
        if (endMarker.current) endMarker.current.remove();
        setIsMapLoaded(false);
        map.current?.remove();
      };
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setTokenError(true);
    }
  }, [mapboxToken, tokenError]);

  const clearAlertMarkers = () => {
    alertMarkers.current.forEach(marker => marker.remove());
    alertMarkers.current = [];
  };


  // Add Ukraine regions and alert overlays
  const addUkraineRegions = () => {
    if (!map.current || !isMapLoaded) return;

    console.log('🗺️ Adding Ukraine regions to map');

    // Add clickable regions (but prevent pin dropping)
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
          
          // Visual feedback - add a temporary marker but don't allow pin dropping
          const clickMarker = new mapboxgl.Marker({ color: '#ffffff', scale: 0.8 })
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

    // Add alert markers when map loads and alerts are available
    if (alertsData) {
      updateAlertMarkers();
    }
  };

  const updateAlertMarkers = () => {
    if (!map.current || !alertsData || !isMapLoaded) {
      console.log('⚠️ Cannot update markers: map not loaded or alertsData not ready');
      return;
    }

    // Clear existing markers
    clearAlertMarkers();

    console.log('📍 Adding alert markers for', alertsData.length, 'alerts');

    // Threat priority for picking a cluster's representative alert
    const threatPriority: { [key: string]: number } = {
      air_raid: 5,
      missile_threat: 4,
      artillery_shelling: 3,
      urban_fights: 2,
      chemical_threat: 1
    };

    // Cluster alerts on a ~0.25° grid (~25km) so stacked locations render one ping
    const clusters = new Map<string, any[]>();
    alertsData.forEach((alert: any) => {
      if (!alert.coordinates) {
        console.log('⚠️ Alert missing coordinates:', alert.location_title);
        return;
      }
      const key = `${Math.round(alert.coordinates[0] / 0.25)}:${Math.round(alert.coordinates[1] / 0.25)}`;
      const bucket = clusters.get(key);
      if (bucket) {
        bucket.push(alert);
      } else {
        clusters.set(key, [alert]);
      }
    });

    clusters.forEach((clusterAlerts) => {
      // Representative: most severe threat, latest first within the same severity
      const rep = [...clusterAlerts].sort((a, b) =>
        (threatPriority[b.alert_type] || 0) - (threatPriority[a.alert_type] || 0) ||
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0];

      const count = clusterAlerts.length;
      const alertColor = getAlertTypeColor(rep.alert_type);

      // Marker sits at the cluster's center of mass
      const centerLng = clusterAlerts.reduce((s, a) => s + a.coordinates[0], 0) / count;
      const centerLat = clusterAlerts.reduce((s, a) => s + a.coordinates[1], 0) / count;

      // Sonar ping: core dot with expanding radar rings (see .sonar-marker in index.css)
      const sonarEl = document.createElement('div');
      sonarEl.className = 'sonar-marker';
      sonarEl.style.setProperty('--sonar-color', alertColor);
      const size = Math.min(22, 14 + (count - 1) * 2);
      sonarEl.style.width = `${size}px`;
      sonarEl.style.height = `${size}px`;
      sonarEl.innerHTML =
        '<span class="sonar-ring"></span><span class="sonar-ring"></span><span class="sonar-core"></span>' +
        (count > 1 ? `<span class="sonar-count">${count}</span>` : '');

      const locationsList = clusterAlerts
        .slice(0, 4)
        .map((a) => localizeLocation(a.location_title, languageRef.current))
        .join('<br/>') + (count > 4 ? '<br/>…' : '');

      const marker = new mapboxgl.Marker({ element: sonarEl })
        .setLngLat([centerLng, centerLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3 text-white max-w-xs">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${alertColor}"></div>
                <strong class="text-sm">${count > 1 ? locationsList : localizeLocation(rep.location_title, languageRef.current)}</strong>
              </div>
              <div class="text-xs text-gray-300 mb-1">
                <strong>${currentT().oblastLabel}</strong> ${localizeOblast(rep.location_oblast, languageRef.current)}
              </div>
              <div class="text-xs text-gray-300 mb-1">
                <strong>${currentT().activeAlertsLabel}</strong> ${count}
              </div>
              <div class="text-xs text-gray-400">
                <strong>${currentT().latestLabel}</strong> ${new Date(rep.started_at).toLocaleString(dateLocale())}
              </div>
            </div>
          `)
        )
        .addTo(map.current!);

      alertMarkers.current.push(marker);
    });

    console.log('✅ Successfully added', alertMarkers.current.length, 'alert markers to map');
  };

  // Handle route data changes
  useEffect(() => {
    if (!map.current || !routeData || !isMapLoaded) {
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
      startMarker.current = new mapboxgl.Marker({ color: '#ffffff' })
        .setLngLat(routeData.startCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${currentT().startLabel}</strong> ${routeData.startCity}`))
        .addTo(map.current);
    }

    // Add end marker
    if (routeData.endCoords) {
      endMarker.current = new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat(routeData.endCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${currentT().destinationLabel}</strong> ${routeData.endCity}`))
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
          'line-color': '#ffffff',
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
  }, [routeData, isMapLoaded]);

  // Update alert markers when alerts data changes - ensure immediate update
  useEffect(() => {
    if (map.current && alertsData && isMapLoaded) {
      console.log('🔄 Alert data changed, updating markers...');
      updateAlertMarkers();
    }
  }, [alertsData, allAlertsData, isMapLoaded, language]);

  if (isLoadingToken) {
    return (
      <div className="absolute inset-0 glass-backdrop flex items-center justify-center">
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-white">{t.loadingMap}</span>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError || !mapboxToken) {
    return (
      <div className="absolute inset-0 glass-backdrop flex items-center justify-center">
        <div className="glass-panel p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4 text-red-400">{t.mapError}</h3>
          <p className="text-sm text-gray-300">{t.mapErrorDetails}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay for search */}
      {isSearching && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-white">{t.findingRoute}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
