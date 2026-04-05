import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Comment {
  _id: string;
  task: string;
  text: string;
  author: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getComments(taskId: string) {
    return this.http.get<Comment[]>(`${this.base}/api/tasks/${taskId}/comments`);
  }

  addComment(taskId: string, text: string) {
    return this.http.post<Comment>(`${this.base}/api/tasks/${taskId}/comments`, { text });
  }

  updateComment(taskId: string, commentId: string, text: string) {
    return this.http.put<Comment>(`${this.base}/api/tasks/${taskId}/comments/${commentId}`, { text });
  }

  deleteComment(taskId: string, commentId: string) {
    return this.http.delete<{ message: string }>(`${this.base}/api/tasks/${taskId}/comments/${commentId}`);
  }
}
