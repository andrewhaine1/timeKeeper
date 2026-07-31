import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { View, ActivityIndicator, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { AppModeProvider, useAppMode } from '@/src/context/AppModeContext';
import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { useLocalDb } from '@/src/db/useLocalDb';
import { configureNotificationHandler, ensureNotificationChannels } from '@/src/notifications/scheduler';

configureNotificationHandler();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppModeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AppModeProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { user, isLoading: authLoading } = useAuth();
  const { mode, serverUrl, isLoading: modeLoading } = useAppMode();
  const { ready: dbReady, error: dbError } = useLocalDb();
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  useEffect(() => {
    ensureNotificationChannels();
  }, []);

  if (dbError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: palette.background }}>
        <Text style={{ color: palette.danger, textAlign: 'center' }}>
          Local database error: {dbError.message}
        </Text>
      </View>
    );
  }

  if (authLoading || modeLoading || !dbReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  const isTeamAuthed = mode === 'team' && !!serverUrl && !!user;

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="server-setup" />

        <Stack.Protected guard={mode === null}>
          <Stack.Screen name="mode-select" />
        </Stack.Protected>

        <Stack.Protected guard={mode === 'team' && !!serverUrl && !user}>
          <Stack.Screen name="login" />
        </Stack.Protected>

        <Stack.Protected guard={isTeamAuthed || mode === 'individual'}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}
