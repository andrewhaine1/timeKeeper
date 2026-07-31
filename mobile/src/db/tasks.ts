import { desc, eq } from 'drizzle-orm';
import { db } from './client';
import { taskStatuses, tasks } from './schema';
import { Task, TaskPayload, TaskStatus } from '@/src/data/types';

function toTaskStatus(row: { id: number; name: string; order: number }): TaskStatus {
  return { _id: String(row.id), name: row.name, order: row.order };
}

async function toTask(row: typeof tasks.$inferSelect): Promise<Task> {
  const [statusRow] = await db.select().from(taskStatuses).where(eq(taskStatuses.id, row.statusId));
  return {
    _id: String(row.id),
    shortDescription: row.shortDescription,
    description: row.description ?? undefined,
    dueDate: row.dueDate ?? undefined,
    status: toTaskStatus(statusRow),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const tasksDb = {
  async getTasks(statusId?: string): Promise<Task[]> {
    const rows = statusId
      ? await db.select().from(tasks).where(eq(tasks.statusId, Number(statusId))).orderBy(desc(tasks.createdAt))
      : await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    return Promise.all(rows.map(toTask));
  },

  async getTask(id: string): Promise<Task> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, Number(id)));
    if (!row) throw new Error('Task not found');
    return toTask(row);
  },

  async createTask(payload: TaskPayload): Promise<Task> {
    const now = new Date().toISOString();
    const [row] = await db
      .insert(tasks)
      .values({
        shortDescription: payload.shortDescription,
        description: payload.description ?? null,
        dueDate: payload.dueDate ?? null,
        statusId: Number(payload.status),
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return toTask(row);
  },

  async updateTask(id: string, payload: Partial<TaskPayload>): Promise<Task> {
    const updates: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (payload.shortDescription !== undefined) updates.shortDescription = payload.shortDescription;
    if (payload.description !== undefined) updates.description = payload.description ?? null;
    if (payload.dueDate !== undefined) updates.dueDate = payload.dueDate ?? null;
    if (payload.status !== undefined) updates.statusId = Number(payload.status);

    const [row] = await db.update(tasks).set(updates).where(eq(tasks.id, Number(id))).returning();
    if (!row) throw new Error('Task not found');
    return toTask(row);
  },

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, Number(id)));
  },

  async getStatuses(): Promise<TaskStatus[]> {
    const rows = await db.select().from(taskStatuses).orderBy(taskStatuses.order);
    return rows.map(toTaskStatus);
  },
};
