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

export interface TaskComment {
  _id: string;
  taskId: string;
  text: string;
  /** Only present in Team mode, where comments are attributed to a server-side user. */
  authorUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataRepo {
  tasks: {
    getTasks(statusId?: string): Promise<Task[]>;
    getTask(id: string): Promise<Task>;
    createTask(payload: TaskPayload): Promise<Task>;
    updateTask(id: string, payload: Partial<TaskPayload>): Promise<Task>;
    deleteTask(id: string): Promise<void>;
    getStatuses(): Promise<TaskStatus[]>;
  };
  notes: {
    getNotes(): Promise<Note[]>;
    getNote(id: string): Promise<Note>;
    createNote(payload: NotePayload): Promise<Note>;
    updateNote(id: string, payload: NotePayload): Promise<Note>;
    deleteNote(id: string): Promise<void>;
  };
  comments: {
    getComments(taskId: string): Promise<TaskComment[]>;
    addComment(taskId: string, text: string): Promise<TaskComment>;
    updateComment(taskId: string, commentId: string, text: string): Promise<TaskComment>;
    deleteComment(taskId: string, commentId: string): Promise<void>;
  };
}
