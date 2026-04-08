import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark$ = new BehaviorSubject<boolean>(
    localStorage.getItem('tk_theme') === 'dark'
  );

  dark$ = this._isDark$.asObservable();

  constructor() {
    this._applyTheme(this._isDark$.value);
  }

  get isDark(): boolean {
    return this._isDark$.value;
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
