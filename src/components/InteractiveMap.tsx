
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Shield, Zap } from 'lucide-react';

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

  const translations = {
    en: {
      enterToken: 'Enter your Mapbox public token to display the map',
      tokenPlaceholder: 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6IkFCQzEyM...',
      getToken: 'Get your token at https://mapbox.com',
      routeDetails: 'Route Details',
      distance: 'Distance',
      duration: 'Duration',
      live: 'Live',
      estimated: 'Est.',
      riskLevels: {
        low: 'Safe',
        moderate: 'Caution',
        high: 'Risk'
      }
    },
    ua: {
      enterToken: 'Введіть ваш публічний токен Mapbox для відображення карти',
      tokenPlaceholder: 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6IkFCQzEyM...',
      getToken: 'Отримайте токен на https://mapbox.com',
      routeDetails: 'Деталі маршруту',
      distance: 'Відстань',
      duration: 'Час',
      live: 'Онлайн',
      estimated: 'Оцін.',
      riskLevels: {
        low: 'Безпечно',
        moderate: 'Обережно',
        high: 'Ризик'
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [31.1656, 48.3794], // Center on Ukraine
        zoom: 6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!mapboxToken) {
    return (
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">{t.enterToken}</h3>
          <input
            type="text"
            placeholder={t.tokenPlaceholder}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 text-sm"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-sm text-gray-600">{t.getToken}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Compact Route Info Panel */}
      {routeData && (
        <div className="absolute top-4 left-4 right-4 max-w-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{t.routeDetails}</span>
              </div>
              <Badge variant={routeData.realRoute ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${routeData.realRoute ? 'bg-green-400' : 'bg-orange-400'}`} />
                {routeData.realRoute ? t.live : t.estimated}
              </Badge>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">{t.distance}</div>
                <div className="text-lg font-bold text-gray-900">
                  {routeData.distanceFormatted || `${routeData.distance} km`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-600 font-medium mb-1">{t.duration}</div>
                <div className="text-lg font-bold text-gray-900">
                  {routeData.durationFormatted || `${routeData.duration}h`}
                </div>
              </div>
            </div>

            {/* Compact Status Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-amber-500" />
                <span className={`font-medium ${getRiskColor(routeData.conflictRisk)}`}>
                  {t.riskLevels[routeData.conflictRisk] || routeData.conflictRisk}
                </span>
              </div>
              {routeData.temperature !== undefined && (
                <div className="text-gray-600">
                  {routeData.temperature}°C
                </div>
              )}
              {routeData.estimatedDelay > 0 && (
                <div className="text-orange-600 font-medium">
                  +{routeData.estimatedDelay}min
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
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
