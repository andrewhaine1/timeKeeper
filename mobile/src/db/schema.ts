import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const taskStatuses = sqliteTable('task_statuses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  order: integer('order').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shortDescription: text('short_description').notNull(),
  description: text('description'),
  dueDate: text('due_date'),
  statusId: integer('status_id')
    .notNull()
    .references(() => taskStatuses.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const taskComments = sqliteTable('task_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  text: text('text'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  status: one(taskStatuses, { fields: [tasks.statusId], references: [taskStatuses.id] }),
  comments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
}));
