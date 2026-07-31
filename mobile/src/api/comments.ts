import { api } from './client';
import { TaskComment } from '@/src/data/types';

interface CommentWire {
  _id: string;
  task: string;
  text: string;
  author: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
}

function toTaskComment(c: CommentWire): TaskComment {
  return {
    _id: c._id,
    taskId: c.task,
    text: c.text,
    authorUsername: c.authorUsername,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export const commentsApi = {
  getComments: async (taskId: string) =>
    (await api.get<CommentWire[]>(`/api/tasks/${taskId}/comments`)).map(toTaskComment),
  addComment: async (taskId: string, text: string) =>
    toTaskComment(await api.post<CommentWire>(`/api/tasks/${taskId}/comments`, { text })),
  updateComment: async (taskId: string, commentId: string, text: string) =>
    toTaskComment(await api.put<CommentWire>(`/api/tasks/${taskId}/comments/${commentId}`, { text })),
  deleteComment: (taskId: string, commentId: string) =>
    api.delete<{ message: string }>(`/api/tasks/${taskId}/comments/${commentId}`).then(() => undefined),
};
