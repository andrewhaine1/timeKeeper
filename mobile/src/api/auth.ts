import { api } from './client';

export interface User {
  _id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { username, password }),
  register: (username: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { username, password }),
};
