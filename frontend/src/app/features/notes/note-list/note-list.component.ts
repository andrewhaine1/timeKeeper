import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NoteService, Note } from '../../../core/services/note.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent implements OnInit {
  private noteService = inject(NoteService);
  private snack = inject(MatSnackBar);

  notes: Note[] = [];
  loading = true;

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.loading = true;
    this.noteService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  deleteNote(note: Note) {
    if (!confirm(`Delete "${note.title}"?`)) return;
    this.noteService.deleteNote(note._id).subscribe({
      next: () => {
        this.notes = this.notes.filter((n) => n._id !== note._id);
        this.snack.open('Note deleted', 'Dismiss', { duration: 2500 });
      },
      error: () =>
        this.snack.open('Failed to delete note', 'Dismiss', { duration: 3000 }),
    });
  }
}
