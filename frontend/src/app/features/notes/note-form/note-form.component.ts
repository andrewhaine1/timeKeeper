import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteService } from '../../../core/services/note.service';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.scss',
})
export class NoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private noteService = inject(NoteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);

  noteId: string | null = null;
  loading = false;
  loadingData = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    text: [''],
  });

  get isEdit(): boolean {
    return !!this.noteId;
  }

  ngOnInit() {
    this.noteId = this.route.snapshot.paramMap.get('id');
    if (this.isEdit) {
      this.loadingData = true;
      this.noteService.getNote(this.noteId!).subscribe({
        next: (note) => {
          this.form.patchValue({ title: note.title, text: note.text ?? '' });
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
          this.router.navigate(['/notes']);
        },
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const payload = {
      title: this.form.value.title!,
      text: this.form.value.text || undefined,
    };

    const request = this.isEdit
      ? this.noteService.updateNote(this.noteId!, payload)
      : this.noteService.createNote(payload);

    request.subscribe({
      next: () => {
        this.snack.open(
          `Note ${this.isEdit ? 'updated' : 'created'}`,
          'Dismiss',
          { duration: 2500 }
        );
        this.router.navigate(['/notes']);
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(
          err.error?.message ?? 'Failed to save note',
          'Dismiss',
          { duration: 3000 }
        );
      },
    });
  }
}
