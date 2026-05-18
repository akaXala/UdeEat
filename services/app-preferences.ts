import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export type AppPreferences = {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  dataSaverEnabled: boolean;
  autoImageLoading: boolean;
};

const STORAGE_KEY = 'udeeat.app.preferences';

const defaultPreferences: AppPreferences = {
  themeMode: 'system',
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  dataSaverEnabled: false,
  autoImageLoading: true,
};

let cachedPreferences: AppPreferences = defaultPreferences;
let hydrated = false;
const listeners = new Set<() => void>();

export function AppPreferencesProvider({ children }: React.PropsWithChildren) {
  return React.createElement(React.Fragment, null, children);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

async function persistPreferences(nextPreferences: AppPreferences) {
  cachedPreferences = nextPreferences;
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(nextPreferences));
  } catch {
    // Silently ignore storage failures on devices without secure storage.
  }
  emitChange();
}

async function loadPreferences() {
  if (hydrated) {
    return cachedPreferences;
  }

  hydrated = true;
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      cachedPreferences = { ...defaultPreferences, ...JSON.parse(raw) };
    }
  } catch {
    cachedPreferences = defaultPreferences;
  }

  applyThemeMode(cachedPreferences.themeMode);
  return cachedPreferences;
}

function applyThemeMode(mode: ThemeMode) {
  if (mode === 'system') {
    Appearance.setColorScheme(null);
    return;
  }

  Appearance.setColorScheme(mode);
}

export function getDefaultPreferences() {
  return defaultPreferences;
}

export function getCachedPreferences() {
  return cachedPreferences;
}

export function useAppPreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(cachedPreferences);
  const [isReady, setIsReady] = useState(hydrated);

  useEffect(() => {
    let mounted = true;

    loadPreferences().then((loaded) => {
      if (!mounted) {
        return;
      }
      setPreferences(loaded);
      setIsReady(true);
    });

    const unsubscribe = subscribe(() => {
      if (!mounted) {
        return;
      }
      setPreferences(cachedPreferences);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const actions = useMemo(
    () => ({
      setThemeMode: async (themeMode: ThemeMode) => {
        applyThemeMode(themeMode);
        await persistPreferences({ ...cachedPreferences, themeMode });
      },
      setNotificationsEnabled: async (notificationsEnabled: boolean) => {
        await persistPreferences({ ...cachedPreferences, notificationsEnabled });
      },
      setSoundEnabled: async (soundEnabled: boolean) => {
        await persistPreferences({ ...cachedPreferences, soundEnabled });
      },
      setVibrationEnabled: async (vibrationEnabled: boolean) => {
        await persistPreferences({ ...cachedPreferences, vibrationEnabled });
      },
      setDataSaverEnabled: async (dataSaverEnabled: boolean) => {
        await persistPreferences({ ...cachedPreferences, dataSaverEnabled });
      },
      setAutoImageLoading: async (autoImageLoading: boolean) => {
        await persistPreferences({ ...cachedPreferences, autoImageLoading });
      },
      resetPreferences: async () => {
        applyThemeMode(defaultPreferences.themeMode);
        await persistPreferences(defaultPreferences);
      },
    }),
    [],
  );

  return {
    preferences,
    isReady,
    ...actions,
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
