import { DataRepo } from './types';
import { tasksApi } from '@/src/api/tasks';
import { notesApi } from '@/src/api/notes';
import { commentsApi } from '@/src/api/comments';

export const apiRepo: DataRepo = {
  tasks: tasksApi,
  notes: notesApi,
  comments: commentsApi,
};
