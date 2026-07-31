import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/src/context/AppModeContext';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { TextField } from '@/src/components/TextField';
import { Button } from '@/src/components/Button';
import { DEFAULT_SERVER_URL } from '@/src/config';

function normalizeUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '');
  if (url && !/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url;
}

export default function ServerSetupScreen() {
  const router = useRouter();
  const { serverUrl: existingUrl, setServerUrl, switchMode } = useAppMode();
  const { logout } = useAuth();
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  const [url, setUrl] = useState(existingUrl ?? DEFAULT_SERVER_URL);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isChangingServer = !!existingUrl;

  const onContinue = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError('Enter a server URL.');
      return;
    }
    setChecking(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${normalized}/api/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('unreachable');
    } catch {
      setChecking(false);
      setError("Can't reach that server. Check the URL and try again.");
      return;
    }

    if (normalized !== existingUrl) {
      await logout();
    }
    await setServerUrl(normalized);
    setChecking(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.text }]}>
          {isChangingServer ? 'Change server' : 'Connect to your team server'}
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Enter the address of your TimeKeeper server.
        </Text>

        <TextField
          label="Server URL"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.23:3000"
          error={error ?? undefined}
        />

        <Button title="Continue" onPress={onContinue} loading={checking} />

        {isChangingServer ? (
          <Pressable onPress={() => router.back()} style={styles.link}>
            <Text style={{ color: palette.textMuted }}>Cancel</Text>
          </Pressable>
        ) : (
          <Pressable onPress={switchMode} style={styles.link}>
            <Text style={{ color: palette.textMuted }}>Choose a different mode</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  link: { marginTop: 16, alignItems: 'center' },
});
