import { DataRepo } from './types';
import { tasksDb } from '@/src/db/tasks';
import { notesDb } from '@/src/db/notes';
import { commentsDb } from '@/src/db/comments';

export const localRepo: DataRepo = {
  tasks: tasksDb,
  notes: notesDb,
  comments: commentsDb,
};
