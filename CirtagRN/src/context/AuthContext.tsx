import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getDatabaseSync } from '../database/database';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    try {
      const db = getDatabaseSync();
      const session = db.getFirstSync<{ userId: number; isLoggedIn: number }>(
        'SELECT userId, isLoggedIn FROM auth_session ORDER BY id DESC LIMIT 1'
      );

      if (session && session.isLoggedIn === 1) {
        const userData = db.getFirstSync<{ id: number; email: string; name: string }>(
          'SELECT id, email, name FROM auth_user WHERE id = ?',
          [session.userId]
        );
        if (userData) {
          setIsLoggedIn(true);
          setUser(userData);
          setIsLoading(false);
          return;
        }
      }
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
    } catch {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const db = getDatabaseSync();
      const userData = db.getFirstSync<{ id: number; email: string; name: string; password: string }>(
        'SELECT id, email, name, password FROM auth_user WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (!userData) {
        return { success: false, error: 'User not found. Please register first.' };
      }

      if (userData.password !== password) {
        return { success: false, error: 'Invalid password.' };
      }

      // Clear old sessions and create new one
      db.runSync('DELETE FROM auth_session');
      db.runSync(
        'INSERT INTO auth_session (userId, isLoggedIn, createdAt) VALUES (?, 1, ?)',
        [userData.id, Date.now()]
      );

      setIsLoggedIn(true);
      setUser({ id: userData.id, email: userData.email, name: userData.name });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const db = getDatabaseSync();
      const emailLower = email.toLowerCase().trim();

      // Check if user already exists
      const existing = db.getFirstSync<{ id: number }>(
        'SELECT id FROM auth_user WHERE email = ?',
        [emailLower]
      );

      if (existing) {
        return { success: false, error: 'Email already registered. Please login.' };
      }

      // Create user
      const result = db.runSync(
        'INSERT INTO auth_user (email, password, name, createdAt) VALUES (?, ?, ?, ?)',
        [emailLower, password, name.trim(), Date.now()]
      );

      const userId = result.lastInsertRowId;

      // Auto-login after registration
      db.runSync('DELETE FROM auth_session');
      db.runSync(
        'INSERT INTO auth_session (userId, isLoggedIn, createdAt) VALUES (?, 1, ?)',
        [userId, Date.now()]
      );

      setIsLoggedIn(true);
      setUser({ id: Number(userId), email: emailLower, name: name.trim() });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      const db = getDatabaseSync();
      db.runSync('UPDATE auth_session SET isLoggedIn = 0');
    } catch {
      // Ignore errors
    }
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
