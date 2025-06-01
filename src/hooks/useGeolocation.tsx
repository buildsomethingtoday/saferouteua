
import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentLocation: () => void;
  getNearestCity: () => string | null;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const ukrainianCities = [
    { name: 'Kyiv', lat: 50.4501, lng: 30.5234 },
    { name: 'Lviv', lat: 49.8397, lng: 24.0232 },
    { name: 'Odesa', lat: 46.4825, lng: 30.7233 },
    { name: 'Dnipro', lat: 48.4647, lng: 35.0462 },
    { name: 'Kharkiv', lat: 49.9935, lng: 36.2304 },
    { name: 'Chernivtsi', lat: 48.2916, lng: 25.9358 },
    { name: 'Zakarpattia', lat: 48.6208, lng: 22.7202 },
  ];

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearestCity = (): string | null => {
    if (!state.latitude || !state.longitude) return null;

    let nearestCity = null;
    let minDistance = Infinity;

    ukrainianCities.forEach(city => {
      const distance = calculateDistance(
        state.latitude!,
        state.longitude!,
        city.lat,
        city.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city.name;
      }
    });

    return nearestCity;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return {
    ...state,
    getCurrentLocation,
    getNearestCity,
  };
};
