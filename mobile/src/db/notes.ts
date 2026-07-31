import { desc, eq } from 'drizzle-orm';
import { db } from './client';
import { notes } from './schema';
import { Note, NotePayload } from '@/src/data/types';

function toNote(row: typeof notes.$inferSelect): Note {
  return {
    _id: String(row.id),
    title: row.title,
    text: row.text ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const notesDb = {
  async getNotes(): Promise<Note[]> {
    const rows = await db.select().from(notes).orderBy(desc(notes.updatedAt));
    return rows.map(toNote);
  },

  async getNote(id: string): Promise<Note> {
    const [row] = await db.select().from(notes).where(eq(notes.id, Number(id)));
    if (!row) throw new Error('Note not found');
    return toNote(row);
  },

  async createNote(payload: NotePayload): Promise<Note> {
    const now = new Date().toISOString();
    const [row] = await db
      .insert(notes)
      .values({
        title: payload.title,
        text: payload.text ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return toNote(row);
  },

  async updateNote(id: string, payload: NotePayload): Promise<Note> {
    const [row] = await db
      .update(notes)
      .set({
        title: payload.title,
        text: payload.text ?? null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(notes.id, Number(id)))
      .returning();
    if (!row) throw new Error('Note not found');
    return toNote(row);
  },

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, Number(id)));
  },
};
