import { db } from './client';
import { taskStatuses } from './schema';

const DEFAULT_STATUSES = [
  { name: 'New', order: 1 },
  { name: 'In Progress', order: 2 },
  { name: 'Completed', order: 3 },
  { name: 'Closed', order: 4 },
];

export async function seedTaskStatuses() {
  const existing = await db.select().from(taskStatuses).limit(1);
  if (existing.length > 0) return;
  await db.insert(taskStatuses).values(DEFAULT_STATUSES);
}
