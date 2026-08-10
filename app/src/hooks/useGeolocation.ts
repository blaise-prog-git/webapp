import { useState, useCallback } from 'react';

interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoLocation>({
    lat: 0,
    lng: 0,
    address: '',
    loading: false,
    error: null,
  });

  const getLocation = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode using OpenStreetMap Nominatim (free, no API key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'LablissApp/1.0' } }
          );
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;

          setState({
            lat: latitude,
            lng: longitude,
            address,
            loading: false,
            error: null,
          });
        } catch {
          setState({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            loading: false,
            error: null,
          });
        }
      },
      (err) => {
        let msg = 'Unable to retrieve your location';
        if (err.code === 1) msg = 'Location access denied. Please enable location permissions.';
        if (err.code === 2) msg = 'Location unavailable. Please try again.';
        if (err.code === 3) msg = 'Location request timed out.';
        setState((s) => ({ ...s, loading: false, error: msg }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({ lat: 0, lng: 0, address: '', loading: false, error: null });
  }, []);

  return { ...state, getLocation, clearLocation };
}
