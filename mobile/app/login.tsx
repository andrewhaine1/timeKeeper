import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { ApiError } from '@/src/api/client';
import { Button } from '@/src/components/Button';
import { TextField } from '@/src/components/TextField';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { switchMode } = useAppMode();
  const { isDark, toggle } = useTheme();
  const palette = getPalette(isDark);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameError =
    username.length > 0 && username.length < 3 ? 'Username must be at least 3 characters' : undefined;
  const passwordError =
    password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters' : undefined;

  const canSubmit = username.length >= 3 && password.length >= 6 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${mode === 'login' ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.text }]}>TimeKeeper</Text>

        <View style={[styles.tabs, { borderColor: palette.border }]}>
          <Pressable
            style={[styles.tab, mode === 'login' && { backgroundColor: palette.primary }]}
            onPress={() => setMode('login')}
          >
            <Text style={{ color: mode === 'login' ? palette.primaryText : palette.text, fontWeight: '600' }}>
              Login
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === 'register' && { backgroundColor: palette.primary }]}
            onPress={() => setMode('register')}
          >
            <Text style={{ color: mode === 'register' ? palette.primaryText : palette.text, fontWeight: '600' }}>
              Register
            </Text>
          </Pressable>
        </View>

        <TextField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          error={usernameError}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={passwordError}
        />

        {error ? <Text style={[styles.errorBanner, { color: palette.danger }]}>{error}</Text> : null}

        <Button
          title={mode === 'login' ? 'Log in' : 'Create account'}
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={loading}
        />

        <Pressable onPress={toggle} style={styles.themeToggle}>
          <Text style={{ color: palette.textMuted }}>
            Switch to {isDark ? 'light' : 'dark'} mode
          </Text>
        </Pressable>

        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/server-setup')}>
            <Text style={{ color: palette.textMuted }}>Change server</Text>
          </Pressable>
          <Pressable onPress={switchMode}>
            <Text style={{ color: palette.textMuted }}>Use Individual mode instead</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  tabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  errorBanner: { marginBottom: 12, textAlign: 'center' },
  themeToggle: { marginTop: 20, alignItems: 'center' },
  footerLinks: { marginTop: 24, alignItems: 'center', gap: 12 },
});
