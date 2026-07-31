import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Note, getRepo } from '@/src/data';
import { useAppMode } from '@/src/context/AppModeContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { Card } from '@/src/components/Card';
import { LoadingView } from '@/src/components/LoadingView';

export function NoteListScreen() {
  const router = useRouter();
  const { mode } = useAppMode();
  const repo = getRepo(mode ?? 'individual');
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const data = await repo.notes.getNotes();
      setNotes(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadNotes();
    }, [loadNotes])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const deleteNote = (note: Note) => {
    Alert.alert('Delete note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await repo.notes.deleteNote(note._id);
            setNotes((cur) => cur.filter((n) => n._id !== note._id));
          } catch {
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView />;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <FlatList
        data={notes}
        keyExtractor={(n) => n._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: palette.textMuted }]}>No notes yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/notes/${item._id}/edit`)}>
            <Card>
              <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Pressable onPress={() => deleteNote(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={palette.textMuted} />
                </Pressable>
              </View>
              {item.text ? (
                <Text style={{ color: palette.textMuted, marginTop: 6 }} numberOfLines={3}>
                  {item.text}
                </Text>
              ) : null}
              <Text style={[styles.date, { color: palette.textMuted }]}>
                Updated {new Date(item.updatedAt).toLocaleString()}
              </Text>
            </Card>
          </Pressable>
        )}
      />

      <Pressable
        style={[styles.fab, { backgroundColor: palette.primary }]}
        onPress={() => router.push('/notes/new')}
      >
        <Ionicons name="add" size={28} color={palette.primaryText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 96 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  date: { fontSize: 11, marginTop: 8 },
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
