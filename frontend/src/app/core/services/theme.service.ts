import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark$ = new BehaviorSubject<boolean>(
    localStorage.getItem('tk_theme') === 'dark'
  );

  dark$ = this._isDark$.asObservable();

  get isDark(): boolean {
    return this._isDark$.value;
  }

  /** Call once at app shell init to apply persisted preference. */
  init() {
    this._applyTheme(this._isDark$.value);
  }

  toggle() {
    const next = !this._isDark$.value;
    this._isDark$.next(next);
    localStorage.setItem('tk_theme', next ? 'dark' : 'light');
    this._applyTheme(next);
  }

  private _applyTheme(dark: boolean) {
    document.body.classList.toggle('dark-theme', dark);
  }
}
