import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';

export function SettingsButton({ leading }: { leading?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const { mode, serverUrl, switchMode } = useAppMode();
  const { isDark, toggle } = useTheme();
  const palette = getPalette(isDark);

  const close = () => setOpen(false);

  const confirmLogout = () => {
    close();
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const confirmSwitchMode = () => {
    close();
    const target = mode === 'team' ? 'Individual' : 'Team';
    Alert.alert(
      'Switch mode',
      `Switch to ${target} mode? Your data stays where it is — nothing is deleted, and you can switch back anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: switchMode },
      ]
    );
  };

  return (
    <>
      {leading}
      <Pressable onPress={() => setOpen(true)} hitSlop={10} style={styles.iconButton}>
        <Ionicons name="settings-outline" size={22} color={palette.text} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sheetTitle, { color: palette.textMuted }]} numberOfLines={1}>
              {mode === 'team' ? `Team mode — ${serverUrl}` : 'Individual mode'}
            </Text>

            <Pressable
              style={[styles.menuRow, { borderBottomColor: palette.border }]}
              onPress={() => {
                close();
                toggle();
              }}
            >
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={palette.text} />
              <Text style={[styles.menuText, { color: palette.text }]}>
                Switch to {isDark ? 'light' : 'dark'} mode
              </Text>
            </Pressable>

            {mode === 'team' ? (
              <Pressable
                style={[styles.menuRow, { borderBottomColor: palette.border }]}
                onPress={() => {
                  close();
                  router.push('/server-setup');
                }}
              >
                <Ionicons name="server-outline" size={20} color={palette.text} />
                <Text style={[styles.menuText, { color: palette.text }]}>Change server</Text>
              </Pressable>
            ) : null}

            <Pressable style={[styles.menuRow, { borderBottomColor: palette.border }]} onPress={confirmSwitchMode}>
              <Ionicons name="swap-horizontal-outline" size={20} color={palette.text} />
              <Text style={[styles.menuText, { color: palette.text }]}>
                Switch to {mode === 'team' ? 'Individual' : 'Team'} mode
              </Text>
            </Pressable>

            {mode === 'team' ? (
              <Pressable style={styles.menuRow} onPress={confirmLogout}>
                <Ionicons name="log-out-outline" size={20} color={palette.danger} />
                <Text style={[styles.menuText, { color: palette.danger }]}>Log out</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: { padding: 2 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuText: { fontSize: 15 },
});
