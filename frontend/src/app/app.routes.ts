import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      {
        path: 'tasks',
        loadComponent: () =>
          import(
            './features/tasks/task-list/task-list.component'
          ).then((m) => m.TaskListComponent),
      },
      {
        path: 'tasks/new',
        loadComponent: () =>
          import(
            './features/tasks/task-form/task-form.component'
          ).then((m) => m.TaskFormComponent),
      },
      {
        path: 'tasks/:id',
        loadComponent: () =>
          import(
            './features/tasks/task-detail/task-detail.component'
          ).then((m) => m.TaskDetailComponent),
      },
      {
        path: 'tasks/:id/edit',
        loadComponent: () =>
          import(
            './features/tasks/task-form/task-form.component'
          ).then((m) => m.TaskFormComponent),
      },
      {
        path: 'notes',
        loadComponent: () =>
          import(
            './features/notes/note-list/note-list.component'
          ).then((m) => m.NoteListComponent),
      },
      {
        path: 'notes/new',
        loadComponent: () =>
          import(
            './features/notes/note-form/note-form.component'
          ).then((m) => m.NoteFormComponent),
      },
      {
        path: 'notes/:id/edit',
        loadComponent: () =>
          import(
            './features/notes/note-form/note-form.component'
          ).then((m) => m.NoteFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
