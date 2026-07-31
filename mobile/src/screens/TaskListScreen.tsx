import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus, getRepo } from '@/src/data';
import { getTaskUrgency } from '@/src/utils/taskUrgency';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { Card } from '@/src/components/Card';
import { LoadingView } from '@/src/components/LoadingView';
import { UrgencyBadge } from '@/src/components/UrgencyBadge';
import { SelectModal } from '@/src/components/SelectModal';
import { SettingsButton } from '@/src/components/SettingsButton';

export function TaskListScreen() {
  const router = useRouter();
  const { mode } = useAppMode();
  const repo = getRepo(mode ?? 'individual');
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async (statusId: string) => {
    try {
      const data = await repo.tasks.getTasks(statusId || undefined);
      setTasks(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      repo.tasks.getStatuses().then(setStatuses);
      loadTasks(selectedStatusId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatusId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks(selectedStatusId);
  };

  const updateStatus = async (task: Task, statusId: string) => {
    const prev = task.status;
    const newStatus = statuses.find((s) => s._id === statusId);
    if (!newStatus) return;

    setTasks((cur) => cur.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    try {
      const updated = await repo.tasks.updateTask(task._id, { status: statusId });
      setTasks((cur) => cur.map((t) => (t._id === task._id ? { ...t, status: updated.status } : t)));
    } catch {
      setTasks((cur) => cur.map((t) => (t._id === task._id ? { ...t, status: prev } : t)));
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const deleteTask = (task: Task) => {
    Alert.alert('Delete task', `Delete "${task.shortDescription}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await repo.tasks.deleteTask(task._id);
            setTasks((cur) => cur.filter((t) => t._id !== task._id));
          } catch {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const statusOptions = [{ value: '', label: 'All statuses' }, ...statuses.map((s) => ({ value: s._id, label: s.name }))];
  const activeStatusName = statuses.find((s) => s._id === selectedStatusId)?.name;

  const headerRight = () => (
    <SettingsButton
      leading={
        <SelectModal
          trigger="icon"
          icon="filter"
          value={selectedStatusId}
          options={statusOptions}
          onChange={setSelectedStatusId}
          active={!!selectedStatusId}
        />
      }
    />
  );

  if (loading) return <LoadingView />;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerRight }} />

      {activeStatusName ? (
        <Pressable
          onPress={() => setSelectedStatusId('')}
          style={[styles.filterChip, { backgroundColor: `${palette.primary}22`, borderColor: palette.primary }]}
        >
          <Text style={[styles.filterChipText, { color: palette.primary }]}>{activeStatusName}</Text>
          <Ionicons name="close" size={14} color={palette.primary} />
        </Pressable>
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(t) => t._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: palette.textMuted }]}>
            {activeStatusName ? `No tasks with status "${activeStatusName}".` : 'No tasks found.'}
          </Text>
        }
        renderItem={({ item }) => {
          const urgency = getTaskUrgency(item);
          return (
            <Pressable onPress={() => router.push(`/tasks/${item._id}`)}>
              <Card>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
                    {item.shortDescription}
                  </Text>
                  <Pressable onPress={() => deleteTask(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={palette.textMuted} />
                  </Pressable>
                </View>

                <UrgencyBadge urgency={urgency} />

                {item.dueDate ? (
                  <Text style={[styles.due, { color: palette.textMuted }]}>
                    Due {new Date(item.dueDate).toLocaleString()}
                  </Text>
                ) : null}

                <View style={styles.statusRow}>
                  <SelectModal
                    value={item.status._id}
                    options={statuses.map((s) => ({ value: s._id, label: s.name }))}
                    onChange={(v) => updateStatus(item, v)}
                  />
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={[styles.fab, { backgroundColor: palette.primary }]}
        onPress={() => router.push('/tasks/new')}
      >
        <Ionicons name="add" size={28} color={palette.primaryText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 96 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  due: { fontSize: 12, marginTop: 8 },
  statusRow: { marginTop: 10 },
  empty: { textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
