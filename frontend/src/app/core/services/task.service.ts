import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface TaskStatus {
  _id: string;
  name: string;
  order: number;
}

export interface Task {
  _id: string;
  shortDescription: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  shortDescription: string;
  description?: string;
  dueDate?: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getTasks(statusId?: string) {
    let params = new HttpParams();
    if (statusId) params = params.set('status', statusId);
    return this.http.get<Task[]>(`${this.base}/api/tasks`, { params });
  }

  getTask(id: string) {
    return this.http.get<Task>(`${this.base}/api/tasks/${id}`);
  }

  createTask(payload: TaskPayload) {
    return this.http.post<Task>(`${this.base}/api/tasks`, payload);
  }

  updateTask(id: string, payload: Partial<TaskPayload>) {
    return this.http.put<Task>(`${this.base}/api/tasks/${id}`, payload);
  }

  deleteTask(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/api/tasks/${id}`);
  }

  getStatuses() {
    return this.http.get<TaskStatus[]>(`${this.base}/api/task-statuses`);
  }
}
