import { DataRepo } from './types';
import { apiRepo } from './apiRepo';
import { localRepo } from './localRepo';
import { cancelTaskNotifications, syncTaskNotifications } from '@/src/notifications/scheduler';

export type AppMode = 'team' | 'individual';

function withNotifications(repo: DataRepo): DataRepo {
  return {
    ...repo,
    tasks: {
      ...repo.tasks,
      createTask: async (payload) => {
        const task = await repo.tasks.createTask(payload);
        await syncTaskNotifications(task);
        return task;
      },
      updateTask: async (id, payload) => {
        const task = await repo.tasks.updateTask(id, payload);
        await syncTaskNotifications(task);
        return task;
      },
      deleteTask: async (id) => {
        await repo.tasks.deleteTask(id);
        await cancelTaskNotifications(id);
      },
    },
  };
}

export function getRepo(mode: AppMode): DataRepo {
  return withNotifications(mode === 'team' ? apiRepo : localRepo);
}

export * from './types';
