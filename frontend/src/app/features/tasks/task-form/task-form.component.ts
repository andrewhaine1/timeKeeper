import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService, TaskStatus } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);

  statuses: TaskStatus[] = [];
  taskId: string | null = null;
  loading = false;
  loadingData = false;

  form = this.fb.group({
    shortDescription: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    dueDate: [null as Date | null],
    dueTime: [''],
    status: ['', Validators.required],
  });

  get isEdit(): boolean {
    return !!this.taskId;
  }

  get descLength(): number {
    return (this.form.get('shortDescription')?.value ?? '').length;
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id');

    this.taskService.getStatuses().subscribe((statuses) => {
      this.statuses = statuses;
      if (!this.isEdit && statuses.length) {
        this.form.patchValue({ status: statuses[0]._id });
      }
    });

    if (this.isEdit) {
      this.loadingData = true;
      this.taskService.getTask(this.taskId!).subscribe({
        next: (task) => {
          let dueTime = '';
          let dueDate: Date | null = null;

          if (task.dueDate) {
            dueDate = new Date(task.dueDate);
            const h = dueDate.getHours().toString().padStart(2, '0');
            const m = dueDate.getMinutes().toString().padStart(2, '0');
            dueTime = `${h}:${m}`;
          }

          this.form.patchValue({
            shortDescription: task.shortDescription,
            description: task.description ?? '',
            dueDate,
            dueTime,
            status: task.status._id,
          });
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
          this.router.navigate(['/tasks']);
        },
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const v = this.form.value;
    let dueDate: string | undefined;

    if (v.dueDate) {
      const d = new Date(v.dueDate as Date);
      if (v.dueTime) {
        const [hours, minutes] = v.dueTime.split(':').map(Number);
        d.setHours(hours, minutes, 0, 0);
      } else {
        d.setHours(0, 0, 0, 0);
      }
      dueDate = d.toISOString();
    }

    const payload = {
      shortDescription: v.shortDescription!,
      description: v.description || undefined,
      dueDate,
      status: v.status!,
    };

    const request = this.isEdit
      ? this.taskService.updateTask(this.taskId!, payload)
      : this.taskService.createTask(payload);

    request.subscribe({
      next: () => {
        this.snack.open(
          `Task ${this.isEdit ? 'updated' : 'created'}`,
          'Dismiss',
          { duration: 2500 }
        );
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(
          err.error?.message ?? 'Failed to save task',
          'Dismiss',
          { duration: 3000 }
        );
      },
    });
  }
}
