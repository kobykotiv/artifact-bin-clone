// src/lib/auth.ts
import { useState, useEffect, useCallback } from 'react';

// --- Types ---
export type AuthStatus = 'unauthenticated' | 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatarSeed?: string;
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

// --- Demo: In-memory user DB (replace with real API calls) ---
const DEMO_USERS: User[] = [
  { id: 'admin', email: 'admin@example.com', passwordHash: 'admin', role: 'admin' },
];

// --- Auth Hook ---
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ status: 'unauthenticated', user: null });

  // Simulate session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      setAuthState(JSON.parse(stored));
    }
  }, []);

  // Save session
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(authState));
  }, [authState]);

  // Login (email/password)
  const login = useCallback((email: string, password: string) => {
    // Replace with real API call
    const user = DEMO_USERS.find(u => u.email === email && u.passwordHash === password);
    if (user) {
      setAuthState({ status: user.role, user });
      return true;
    }
    return false;
  }, []);

  // Logout
  const logout = useCallback(() => {
    setAuthState({ status: 'unauthenticated', user: null });
  }, []);

  // Register (demo only)
  const register = useCallback((email: string, password: string) => {
    if (DEMO_USERS.find(u => u.email === email)) return false;
    const user: User = { id: Math.random().toString(36).slice(2), email, passwordHash: password, role: 'user' };
    DEMO_USERS.push(user);
    setAuthState({ status: 'user', user });
    return true;
  }, []);

  // Guest login
  const loginAsGuest = useCallback(() => {
    const user: User = { id: 'guest-' + Math.random().toString(36).slice(2), email: '', passwordHash: '', role: 'user' };
    setAuthState({ status: 'user', user });
  }, []);

  return { authState, login, logout, register, loginAsGuest };
}
