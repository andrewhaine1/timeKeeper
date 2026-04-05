import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = environment.apiUrl;

  private currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.currentUser$.asObservable();

  get token(): string | null {
    return localStorage.getItem('tk_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get currentUser(): User | null {
    return this.currentUser$.value;
  }

  private loadUser(): User | null {
    const stored = localStorage.getItem('tk_user');
    return stored ? (JSON.parse(stored) as User) : null;
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/api/auth/login`, { username, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/api/auth/register`, { username, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout() {
    localStorage.removeItem('tk_token');
    localStorage.removeItem('tk_user');
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('tk_token', res.token);
    localStorage.setItem('tk_user', JSON.stringify(res.user));
    this.currentUser$.next(res.user);
  }
}
