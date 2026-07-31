import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MODE_KEY, SERVER_URL_KEY } from '@/src/data/storageKeys';
import { AppMode } from '@/src/data';

interface AppModeContextValue {
  mode: AppMode | null;
  serverUrl: string | null;
  isLoading: boolean;
  setMode: (mode: AppMode) => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
  switchMode: () => Promise<void>;
}

const AppModeContext = createContext<AppModeContextValue | undefined>(undefined);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode | null>(null);
  const [serverUrl, setServerUrlState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedMode, storedUrl] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(SERVER_URL_KEY),
      ]);
      if (storedMode === 'team' || storedMode === 'individual') setModeState(storedMode);
      if (storedUrl) setServerUrlState(storedUrl);
      setIsLoading(false);
    })();
  }, []);

  const setMode = async (next: AppMode) => {
    await AsyncStorage.setItem(MODE_KEY, next);
    setModeState(next);
  };

  const setServerUrl = async (url: string) => {
    await AsyncStorage.setItem(SERVER_URL_KEY, url);
    setServerUrlState(url);
  };

  /** Returns to the mode picker without clearing server URL or session, so picking Team again skips back in. */
  const switchMode = async () => {
    await AsyncStorage.removeItem(MODE_KEY);
    setModeState(null);
  };

  return (
    <AppModeContext.Provider value={{ mode, serverUrl, isLoading, setMode, setServerUrl, switchMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}
