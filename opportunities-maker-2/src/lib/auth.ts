import { apiRequest } from './api';

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

const TOKEN_KEY = 'opportunities:token';
const USER_KEY = 'opportunities:user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function signIn(email: string, password: string) {
  const data = await apiRequest<AuthResponse>('/v1/auth/signin', {
    method: 'POST',
    body: { email, password },
  });
  setStoredAuth(data);
  return data;
}

export async function signUp(email: string, password: string, name?: string) {
  const data = await apiRequest<AuthResponse>('/v1/auth/signup', {
    method: 'POST',
    body: { email, password, name: name?.trim() ? name.trim() : undefined },
  });
  setStoredAuth(data);
  return data;
}

