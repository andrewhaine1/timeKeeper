import { api } from './client';
import { Note, NotePayload } from '@/src/data/types';

export type { Note, NotePayload };

export const notesApi = {
  getNotes: () => api.get<Note[]>('/api/notes'),
  getNote: (id: string) => api.get<Note>(`/api/notes/${id}`),
  createNote: (payload: NotePayload) => api.post<Note>('/api/notes', payload),
  updateNote: (id: string, payload: NotePayload) => api.put<Note>(`/api/notes/${id}`, payload),
  deleteNote: (id: string) => api.delete<{ message: string }>(`/api/notes/${id}`).then(() => undefined),
};
