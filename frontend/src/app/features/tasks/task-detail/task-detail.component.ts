import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TaskService, Task, TaskStatus } from '../../../core/services/task.service';
import { CommentService, Comment } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { getTaskUrgency, URGENCY_LABELS, UrgencyLevel } from '../../../core/utils/task-urgency';

@Component({
  selector: 'app-task-detail',
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
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private snack = inject(MatSnackBar);

  task: Task | null = null;
  statuses: TaskStatus[] = [];
  loading = true;
  updatingStatus = false;

  comments: Comment[] = [];
  loadingComments = true;
  newCommentText = '';
  savingComment = false;
  editingCommentId: string | null = null;
  editText = '';

  get currentUsername(): string {
    return this.authService.currentUser?.username ?? '';
  }

  get urgency(): UrgencyLevel {
    return this.task ? getTaskUrgency(this.task) : 'normal';
  }

  get urgencyClass(): string {
    return `urgency-badge--${this.urgency}`;
  }

  get urgencyLabel(): string {
    return URGENCY_LABELS[this.urgency];
  }

  get isOverdue(): boolean {
    return this.urgency === 'overdue';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.taskService.getStatuses().subscribe((s) => (this.statuses = s));

    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
        this.loadComments(id);
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/tasks']);
      },
    });
  }

  // ── Status ──────────────────────────────────────────────────────────────────

  updateStatus(statusId: string) {
    if (!this.task) return;
    const prev = this.task.status;
    const next = this.statuses.find((s) => s._id === statusId);
    if (!next) return;

    this.task.status = next;
    this.updatingStatus = true;

    this.taskService.updateTask(this.task._id, { status: statusId }).subscribe({
      next: (updated) => {
        this.task!.status = updated.status;
        this.updatingStatus = false;
        this.snack.open('Status updated', 'Dismiss', { duration: 2000 });
      },
      error: () => {
        this.task!.status = prev;
        this.updatingStatus = false;
        this.snack.open('Failed to update status', 'Dismiss', { duration: 3000 });
      },
    });
  }

  // ── Delete task ──────────────────────────────────────────────────────────────

  deleteTask() {
    if (!this.task || !confirm(`Delete "${this.task.shortDescription}"?`)) return;
    this.taskService.deleteTask(this.task._id).subscribe({
      next: () => {
        this.snack.open('Task deleted', 'Dismiss', { duration: 2000 });
        this.router.navigate(['/tasks']);
      },
      error: () =>
        this.snack.open('Failed to delete task', 'Dismiss', { duration: 3000 }),
    });
  }

  // ── Comments ─────────────────────────────────────────────────────────────────

  private loadComments(taskId: string) {
    this.loadingComments = true;
    this.commentService.getComments(taskId).subscribe({
      next: (c) => {
        this.comments = c;
        this.loadingComments = false;
      },
      error: () => {
        this.loadingComments = false;
      },
    });
  }

  addComment() {
    if (!this.task || !this.newCommentText.trim()) return;
    this.savingComment = true;
    this.commentService.addComment(this.task._id, this.newCommentText.trim()).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newCommentText = '';
        this.savingComment = false;
      },
      error: () => {
        this.savingComment = false;
        this.snack.open('Failed to post comment', 'Dismiss', { duration: 3000 });
      },
    });
  }

  startEdit(comment: Comment) {
    this.editingCommentId = comment._id;
    this.editText = comment.text;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editText = '';
  }

  saveEdit(comment: Comment) {
    if (!this.task || !this.editText.trim()) return;
    this.commentService.updateComment(this.task._id, comment._id, this.editText.trim()).subscribe({
      next: (updated) => {
        const idx = this.comments.findIndex((c) => c._id === updated._id);
        if (idx !== -1) this.comments[idx] = updated;
        this.cancelEdit();
        this.snack.open('Comment updated', 'Dismiss', { duration: 2000 });
      },
      error: () =>
        this.snack.open('Failed to update comment', 'Dismiss', { duration: 3000 }),
    });
  }

  deleteComment(comment: Comment) {
    if (!this.task || !confirm('Delete this comment?')) return;
    this.commentService.deleteComment(this.task._id, comment._id).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c._id !== comment._id);
        this.snack.open('Comment deleted', 'Dismiss', { duration: 2000 });
      },
      error: () =>
        this.snack.open('Failed to delete comment', 'Dismiss', { duration: 3000 }),
    });
  }
}
