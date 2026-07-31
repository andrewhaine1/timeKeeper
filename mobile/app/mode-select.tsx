import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';

export default function ModeSelectScreen() {
  const { setMode } = useAppMode();
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.text }]}>TimeKeeper</Text>
      <Text style={[styles.subtitle, { color: palette.textMuted }]}>How do you want to use this?</Text>

      <Pressable
        onPress={() => setMode('team')}
        style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      >
        <Ionicons name="people-outline" size={28} color={palette.primary} />
        <Text style={[styles.cardTitle, { color: palette.text }]}>Team</Text>
        <Text style={[styles.cardBody, { color: palette.textMuted }]}>
          Connect to a shared server. Requires an account and lets you comment with others on shared tasks.
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setMode('individual')}
        style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      >
        <Ionicons name="person-outline" size={28} color={palette.primary} />
        <Text style={[styles.cardTitle, { color: palette.text }]}>Individual</Text>
        <Text style={[styles.cardBody, { color: palette.textMuted }]}>
          Everything stays on this device. No account, no server — works fully offline.
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  cardBody: { fontSize: 14, lineHeight: 20 },
});
