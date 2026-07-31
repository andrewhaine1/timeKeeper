import { api } from './client';
import { Task, TaskPayload, TaskStatus } from '@/src/data/types';

export type { Task, TaskStatus, TaskPayload };

export const tasksApi = {
  getTasks: (statusId?: string) =>
    api.get<Task[]>(`/api/tasks${statusId ? `?status=${statusId}` : ''}`),
  getTask: (id: string) => api.get<Task>(`/api/tasks/${id}`),
  createTask: (payload: TaskPayload) => api.post<Task>('/api/tasks', payload),
  updateTask: (id: string, payload: Partial<TaskPayload>) =>
    api.put<Task>(`/api/tasks/${id}`, payload),
  deleteTask: (id: string) => api.delete<{ message: string }>(`/api/tasks/${id}`).then(() => undefined),
  getStatuses: () => api.get<TaskStatus[]>('/api/task-statuses'),
};
