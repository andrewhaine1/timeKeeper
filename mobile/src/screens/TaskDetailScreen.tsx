import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus, TaskComment, getRepo } from '@/src/data';
import { useAppMode } from '@/src/context/AppModeContext';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';
import { getTaskUrgency } from '@/src/utils/taskUrgency';
import { Card } from '@/src/components/Card';
import { LoadingView } from '@/src/components/LoadingView';
import { UrgencyBadge } from '@/src/components/UrgencyBadge';
import { SelectModal } from '@/src/components/SelectModal';
import { Button } from '@/src/components/Button';
import { TextField } from '@/src/components/TextField';

export function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { mode } = useAppMode();
  const repo = getRepo(mode ?? 'individual');
  const isTeamMode = mode === 'team';
  const { user } = useAuth();
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  const [task, setTask] = useState<Task | null>(null);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    repo.tasks.getStatuses().then(setStatuses);

    repo.tasks
      .getTask(id)
      .then((t) => {
        setTask(t);
        loadComments();
      })
      .catch(() => router.replace('/tasks'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadComments = () => {
    setLoadingComments(true);
    repo.comments
      .getComments(id)
      .then(setComments)
      .finally(() => setLoadingComments(false));
  };

  const updateStatus = async (statusId: string) => {
    if (!task) return;
    const prev = task.status;
    const next = statuses.find((s) => s._id === statusId);
    if (!next) return;

    setTask({ ...task, status: next });
    try {
      const updated = await repo.tasks.updateTask(task._id, { status: statusId });
      setTask((t) => (t ? { ...t, status: updated.status } : t));
    } catch {
      setTask((t) => (t ? { ...t, status: prev } : t));
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const deleteTask = () => {
    if (!task) return;
    Alert.alert('Delete task', `Delete "${task.shortDescription}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await repo.tasks.deleteTask(task._id);
            router.replace('/tasks');
          } catch {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const addComment = async () => {
    if (!task || !newCommentText.trim()) return;
    setSavingComment(true);
    try {
      const comment = await repo.comments.addComment(task._id, newCommentText.trim());
      setComments((c) => [...c, comment]);
      setNewCommentText('');
    } catch {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSavingComment(false);
    }
  };

  const startEdit = (comment: TaskComment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const saveEdit = async (comment: TaskComment) => {
    if (!task || !editText.trim()) return;
    try {
      const updated = await repo.comments.updateComment(task._id, comment._id, editText.trim());
      setComments((cur) => cur.map((c) => (c._id === updated._id ? updated : c)));
      cancelEdit();
    } catch {
      Alert.alert('Error', 'Failed to update comment');
    }
  };

  const deleteComment = (comment: TaskComment) => {
    if (!task) return;
    Alert.alert('Delete comment', 'Delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await repo.comments.deleteComment(task._id, comment._id);
            setComments((cur) => cur.filter((c) => c._id !== comment._id));
          } catch {
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  if (loading || !task) return <LoadingView />;

  const urgency = getTaskUrgency(task);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.text }]}>{task.shortDescription}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => router.push(`/tasks/${task._id}/edit`)} hitSlop={8} style={styles.actionButton}>
                <Ionicons name="pencil-outline" size={18} color={palette.textMuted} />
              </Pressable>
              <Pressable onPress={deleteTask} hitSlop={8} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={18} color={palette.danger} />
              </Pressable>
            </View>
          </View>

          <UrgencyBadge urgency={urgency} />

          {task.description ? (
            <Text style={[styles.description, { color: palette.text }]}>{task.description}</Text>
          ) : null}

          {task.dueDate ? (
            <Text style={[styles.due, { color: palette.textMuted }]}>
              Due {new Date(task.dueDate).toLocaleString()}
            </Text>
          ) : null}

          <SelectModal
            label="Status"
            value={task.status._id}
            options={statuses.map((s) => ({ value: s._id, label: s.name }))}
            onChange={updateStatus}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>Comments</Text>

        {loadingComments ? (
          <LoadingView />
        ) : (
          comments.map((comment) => (
            <Card key={comment._id}>
              {editingCommentId === comment._id ? (
                <View>
                  <TextField label="Edit comment" value={editText} onChangeText={setEditText} multiline />
                  <View style={styles.editActions}>
                    <Button title="Cancel" variant="text" onPress={cancelEdit} />
                    <Button title="Save" onPress={() => saveEdit(comment)} />
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.commentHeader}>
                    {isTeamMode ? (
                      <Text style={[styles.commentAuthor, { color: palette.text }]}>
                        {comment.authorUsername}
                      </Text>
                    ) : null}
                    <Text style={[styles.commentDate, { color: palette.textMuted }]}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={{ color: palette.text, marginTop: 4 }}>{comment.text}</Text>
                  {!isTeamMode || comment.authorUsername === user?.username ? (
                    <View style={styles.editActions}>
                      <Button title="Edit" variant="text" onPress={() => startEdit(comment)} />
                      <Button title="Delete" variant="text" onPress={() => deleteComment(comment)} />
                    </View>
                  ) : null}
                </View>
              )}
            </Card>
          ))
        )}

        <Card>
          <TextField
            label="Add a comment"
            value={newCommentText}
            onChangeText={setNewCommentText}
            multiline
            placeholder="Write a comment..."
          />
          <Button title="Post" onPress={addComment} loading={savingComment} disabled={!newCommentText.trim()} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  actionButton: { padding: 2 },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  description: { marginTop: 12, fontSize: 15, lineHeight: 21 },
  due: { fontSize: 12, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  commentAuthor: { fontWeight: '600' },
  commentDate: { fontSize: 11 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});
