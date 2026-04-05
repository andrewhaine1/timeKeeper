import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TaskService, Task, TaskStatus } from '../../../core/services/task.service';
import { getTaskUrgency, URGENCY_LABELS } from '../../../core/utils/task-urgency';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NgClass,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
      MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private snack = inject(MatSnackBar);

  tasks: Task[] = [];
  statuses: TaskStatus[] = [];
  selectedStatusId = '';
  loading = true;

  ngOnInit() {
    this.taskService.getStatuses().subscribe((s) => (this.statuses = s));
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks(this.selectedStatusId || undefined).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  isOverdue(task: Task): boolean {
    return getTaskUrgency(task) === 'overdue';
  }

  urgencyClass(task: Task): string {
    return `urgency-badge--${getTaskUrgency(task)}`;
  }

  urgencyLabel(task: Task): string {
    return URGENCY_LABELS[getTaskUrgency(task)];
  }

  updateStatus(task: Task, statusId: string) {
    const prev = task.status;
    const newStatus = this.statuses.find((s) => s._id === statusId);
    if (!newStatus) return;

    // Optimistic update
    task.status = newStatus;

    this.taskService.updateTask(task._id, { status: statusId }).subscribe({
      next: (updated) => {
        task.status = updated.status;
      },
      error: () => {
        task.status = prev;
        this.snack.open('Failed to update status', 'Dismiss', { duration: 3000 });
      },
    });
  }

  deleteTask(task: Task) {
    if (!confirm(`Delete "${task.shortDescription}"?`)) return;
    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t._id !== task._id);
        this.snack.open('Task deleted', 'Dismiss', { duration: 2500 });
      },
      error: () =>
        this.snack.open('Failed to delete task', 'Dismiss', { duration: 3000 }),
    });
  }
}
