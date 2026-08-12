'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthUser, UserRole } from '@/types';

/**
 * AuthContext — Multi-user authentication context.
 *
 * Current state: Returns a stubbed guest user with 'admin' role.
 * All routes are effectively open.
 *
 * To activate real authentication:
 *   1. Backend: implement IAuthService + JwtAuthGuard (see auth.module.ts)
 *   2. Frontend: replace the stub user with a real JWT fetch:
 *      const response = await apiClient.post('/auth/login', { email, password });
 *      const { accessToken } = response.data;
 *      localStorage.setItem('auth_token', accessToken);
 *      const decoded = jwtDecode<AuthUser>(accessToken);
 *      setUser(decoded);
 *   3. Replace 'mock-dev-token' in api-client.ts with real token reads
 */

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Stub guest user — full admin access while auth is not enforced. */
const STUB_ADMIN_USER: AuthUser = {
  id: 'stub-user-001',
  email: 'admin@docexpiry.local',
  role: 'admin',
  companyIds: null,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // @future: Validate stored JWT token with backend here
    // const token = localStorage.getItem('auth_token');
    // if (token) { user = await apiClient.get('/auth/me'); setUser(user); }
    setUser(STUB_ADMIN_USER);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    // @future: POST /api/auth/login, store token, decode user
    setUser(STUB_ADMIN_USER);
  }, []);

  const logout = useCallback(() => {
    // @future: POST /api/auth/logout, clear token
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
}
