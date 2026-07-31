import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRepo } from '@/src/data';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { LoadingView } from '@/src/components/LoadingView';
import { TextField } from '@/src/components/TextField';
import { Button } from '@/src/components/Button';
import { ApiError } from '@/src/api/client';

export function NoteFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { mode } = useAppMode();
  const repo = getRepo(mode ?? 'individual');
  const { isDark } = useTheme();
  const palette = getPalette(isDark);
  const isEdit = !!id;

  const [loadingData, setLoadingData] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      repo.notes
        .getNote(id)
        .then((note) => {
          setTitle(note.title);
          setText(note.text ?? '');
        })
        .catch(() => router.replace('/notes'))
        .finally(() => setLoadingData(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canSubmit = title.trim().length > 0 && title.length <= 200 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const payload = { title: title.trim(), text: text.trim() || undefined };

    try {
      if (isEdit && id) {
        await repo.notes.updateNote(id, payload);
      } else {
        await repo.notes.createNote(payload);
      }
      router.replace('/notes');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <LoadingView />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextField
          label={`Title (${title.length}/200)`}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
        <TextField label="Text" value={text} onChangeText={setText} multiline numberOfLines={8} />

        {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

        <Button title={isEdit ? 'Save changes' : 'Create note'} onPress={onSubmit} loading={loading} disabled={!canSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  error: { marginBottom: 12, textAlign: 'center' },
});
