import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

export interface Note {
  _id: string;
  title: string;
  text?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotePayload {
  title: string;
  text?: string;
}

@Injectable({ providedIn: 'root' })
export class NoteService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private get base() { return this.config.apiUrl; }

  getNotes() {
    return this.http.get<Note[]>(`${this.base}/api/notes`);
  }

  getNote(id: string) {
    return this.http.get<Note>(`${this.base}/api/notes/${id}`);
  }

  createNote(payload: NotePayload) {
    return this.http.post<Note>(`${this.base}/api/notes`, payload);
  }

  updateNote(id: string, payload: NotePayload) {
    return this.http.put<Note>(`${this.base}/api/notes/${id}`, payload);
  }

  deleteNote(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/api/notes/${id}`);
  }
}
