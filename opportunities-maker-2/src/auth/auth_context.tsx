import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: 'user' | 'admin' | string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthed: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResponse>;
  signOut: () => void;
};

const TOKEN_KEY = 'opportunities:token';
const USER_KEY = 'opportunities:user';

function readInitialAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  let user: AuthUser | null = null;
  try {
    user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  } catch {
    user = null;
  }
  return { token, user };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = readInitialAuth();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);

  const setStoredAuth = useCallback((data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<AuthResponse>('/v1/auth/signin', {
        method: 'POST',
        body: { email, password },
      });
      setStoredAuth(data);
      return data;
    },
    [setStoredAuth],
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await apiRequest<AuthResponse>('/v1/auth/signup', {
        method: 'POST',
        body: { email, password, name: name?.trim() ? name.trim() : undefined },
      });
      setStoredAuth(data);
      return data;
    },
    [setStoredAuth],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthed: Boolean(token),
      signIn,
      signUp,
      signOut: clearStoredAuth,
    }),
    [token, user, signIn, signUp, clearStoredAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

