import { useCallback, useState } from 'react';

export type UserLocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';

export type UserLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
};

type UserLocationState = {
  status: UserLocationStatus;
  location: UserLocation | null;
  error: string | null;
};

const STORAGE_KEY = 'pawtreon:userLocation:v1';
const DEFAULT_TTL_MS = 15 * 60 * 1000;

function isValidLocation(value: unknown): value is UserLocation {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.lat === "number" &&
    typeof record.lng === "number" &&
    typeof record.timestamp === "number"
  );
}

function isFresh(location: UserLocation, ttlMs: number) {
  return Date.now() - location.timestamp <= ttlMs;
}

function readCachedLocation(ttlMs: number): UserLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidLocation(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (!isFresh(parsed, ttlMs)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function useUserLocation(options?: { ttlMs?: number }) {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const [state, setState] = useState<UserLocationState>(() => {
    const cached = readCachedLocation(ttlMs);
    return {
      status: cached ? 'granted' : 'idle',
      location: cached,
      error: null,
    };
  });

  const { status, location, error } = state;

  const persist = useCallback((next: UserLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState({ status: 'idle', location: null, error: null });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null }));

    if (!('geolocation' in navigator)) {
      setState((prev) => (prev.location ? prev : { ...prev, status: 'unavailable' }));
      return null;
    }

    setState((prev) => ({ ...prev, status: 'requesting' }));

    return new Promise<UserLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };
          setState({ status: 'granted', location: next, error: null });
          persist(next);
          resolve(next);
        },
        (err) => {
          const isDenied = err.code === err.PERMISSION_DENIED;
          setState((prev) => ({
            ...prev,
            status: isDenied ? 'denied' : 'error',
            error: err.message || 'Unable to retrieve location',
          }));
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: ttlMs,
        },
      );
    });
  }, [persist, ttlMs]);

  return {
    status,
    location,
    error,
    isFresh: location ? isFresh(location, ttlMs) : false,
    requestLocation,
    clearLocation,
  };
}
