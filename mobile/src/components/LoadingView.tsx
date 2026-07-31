import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';

export function LoadingView() {
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  return (
    <View style={[styles.wrap, { backgroundColor: palette.background }]}>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
