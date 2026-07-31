import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TaskStatus, getRepo } from '@/src/data';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { LoadingView } from '@/src/components/LoadingView';
import { TextField } from '@/src/components/TextField';
import { SelectModal } from '@/src/components/SelectModal';
import { Button } from '@/src/components/Button';
import { ApiError } from '@/src/api/client';

export function TaskFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { mode } = useAppMode();
  const repo = getRepo(mode ?? 'individual');
  const { isDark } = useTheme();
  const palette = getPalette(isDark);
  const isEdit = !!id;

  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [loading, setLoading] = useState(false);

  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    repo.tasks.getStatuses().then((s) => {
      setStatuses(s);
      if (!isEdit && s.length) setStatus(s[0]._id);
    });

    if (isEdit && id) {
      repo.tasks
        .getTask(id)
        .then((task) => {
          setShortDescription(task.shortDescription);
          setDescription(task.description ?? '');
          setDueDate(task.dueDate ? new Date(task.dueDate) : null);
          setStatus(task.status._id);
        })
        .catch(() => router.replace('/tasks'))
        .finally(() => setLoadingData(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const descLength = shortDescription.length;
  const canSubmit = shortDescription.trim().length > 0 && descLength <= 100 && !!status && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const payload = {
      shortDescription: shortDescription.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      status,
    };

    try {
      if (isEdit && id) {
        await repo.tasks.updateTask(id, payload);
      } else {
        await repo.tasks.createTask(payload);
      }
      router.replace('/tasks');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save task');
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
          label={`Short description (${descLength}/100)`}
          value={shortDescription}
          onChangeText={setShortDescription}
          maxLength={100}
          error={shortDescription.length === 0 ? undefined : descLength > 100 ? 'Too long' : undefined}
        />

        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <SelectModal
          label="Status"
          value={status}
          options={statuses.map((s) => ({ value: s._id, label: s.name }))}
          onChange={setStatus}
        />

        <Text style={[styles.label, { color: palette.textMuted }]}>Due date</Text>
        <View style={styles.dueRow}>
          <Pressable
            style={[styles.dueButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: palette.text }}>
              {dueDate ? dueDate.toLocaleDateString() : 'Set date'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.dueButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={() => (dueDate ? setShowTimePicker(true) : setShowDatePicker(true))}
          >
            <Text style={{ color: palette.text }}>
              {dueDate ? dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set time'}
            </Text>
          </Pressable>
          {dueDate ? (
            <Pressable style={styles.clearButton} onPress={() => setDueDate(null)}>
              <Text style={{ color: palette.danger }}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_event, selected) => {
              setShowDatePicker(false);
              if (!selected) return;
              const base = dueDate ?? new Date();
              const next = new Date(selected);
              next.setHours(base.getHours(), base.getMinutes(), 0, 0);
              setDueDate(next);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="time"
            display="default"
            onChange={(_event, selected) => {
              setShowTimePicker(false);
              if (!selected || !dueDate) return;
              const next = new Date(dueDate);
              next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
              setDueDate(next);
            }}
          />
        )}

        {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

        <Button title={isEdit ? 'Save changes' : 'Create task'} onPress={onSubmit} loading={loading} disabled={!canSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dueButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  clearButton: { paddingHorizontal: 4 },
  error: { marginBottom: 12, textAlign: 'center' },
});
