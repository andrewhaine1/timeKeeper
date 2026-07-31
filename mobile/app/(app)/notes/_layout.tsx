import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { SettingsButton } from '@/src/components/SettingsButton';

export default function NotesStackLayout() {
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.text,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Notes', headerRight: () => <SettingsButton /> }}
      />
      <Stack.Screen name="new" options={{ title: 'New Note' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Note' }} />
    </Stack>
  );
}
