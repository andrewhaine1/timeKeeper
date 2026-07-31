import React, { createContext, useContext, useEffect, useState } from 'react';
import { secureStorage } from '@/src/storage';
import { authApi, User } from '@/src/api/auth';
import { TOKEN_KEY, USER_KEY } from '@/src/data/storageKeys';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await secureStorage.getItem(USER_KEY);
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
    })();
  }, []);

  const persistSession = async (token: string, nextUser: User) => {
    await secureStorage.setItem(TOKEN_KEY, token);
    await secureStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    await persistSession(res.token, res.user);
  };

  const register = async (username: string, password: string) => {
    const res = await authApi.register(username, password);
    await persistSession(res.token, res.user);
  };

  const logout = async () => {
    await secureStorage.deleteItem(TOKEN_KEY);
    await secureStorage.deleteItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
