import { asc, eq } from 'drizzle-orm';
import { db } from './client';
import { taskComments } from './schema';
import { TaskComment } from '@/src/data/types';

function toTaskComment(row: typeof taskComments.$inferSelect): TaskComment {
  return {
    _id: String(row.id),
    taskId: String(row.taskId),
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const commentsDb = {
  async getComments(taskId: string): Promise<TaskComment[]> {
    const rows = await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, Number(taskId)))
      .orderBy(asc(taskComments.createdAt));
    return rows.map(toTaskComment);
  },

  async addComment(taskId: string, text: string): Promise<TaskComment> {
    const now = new Date().toISOString();
    const [row] = await db
      .insert(taskComments)
      .values({ taskId: Number(taskId), text, createdAt: now, updatedAt: now })
      .returning();
    return toTaskComment(row);
  },

  async updateComment(_taskId: string, commentId: string, text: string): Promise<TaskComment> {
    const [row] = await db
      .update(taskComments)
      .set({ text, updatedAt: new Date().toISOString() })
      .where(eq(taskComments.id, Number(commentId)))
      .returning();
    if (!row) throw new Error('Comment not found');
    return toTaskComment(row);
  },

  async deleteComment(_taskId: string, commentId: string): Promise<void> {
    await db.delete(taskComments).where(eq(taskComments.id, Number(commentId)));
  },
};
