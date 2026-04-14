import { useState, useEffect, useCallback } from 'react';
import { getDatabaseSync } from '../database/database';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: AuthUser | null;
}

// Sync function to check auth state (for initial load)
export function getAuthStateSync(): { isLoggedIn: boolean; user: AuthUser | null } {
  try {
    const db = getDatabaseSync();
    const session = db.getFirstSync<{ userId: number; isLoggedIn: number }>(
      'SELECT userId, isLoggedIn FROM auth_session ORDER BY id DESC LIMIT 1'
    );

    if (session && session.isLoggedIn === 1) {
      const user = db.getFirstSync<{ id: number; email: string; name: string }>(
        'SELECT id, email, name FROM auth_user WHERE id = ?',
        [session.userId]
      );
      if (user) {
        return { isLoggedIn: true, user };
      }
    }
    return { isLoggedIn: false, user: null };
  } catch {
    return { isLoggedIn: false, user: null };
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
    user: null,
  });

  const checkAuth = useCallback(() => {
    const { isLoggedIn, user } = getAuthStateSync();
    setState({ isLoading: false, isLoggedIn, user });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const db = getDatabaseSync();
      const user = db.getFirstSync<{ id: number; email: string; name: string; password: string }>(
        'SELECT id, email, name, password FROM auth_user WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (!user) {
        return { success: false, error: 'User not found. Please register first.' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Invalid password.' };
      }

      // Clear old sessions and create new one
      db.runSync('DELETE FROM auth_session');
      db.runSync(
        'INSERT INTO auth_session (userId, isLoggedIn, createdAt) VALUES (?, 1, ?)',
        [user.id, Date.now()]
      );

      setState({
        isLoading: false,
        isLoggedIn: true,
        user: { id: user.id, email: user.email, name: user.name },
      });

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

      setState({
        isLoading: false,
        isLoggedIn: true,
        user: { id: Number(userId), email: emailLower, name: name.trim() },
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      const db = getDatabaseSync();
      db.runSync('UPDATE auth_session SET isLoggedIn = 0');
      setState({ isLoading: false, isLoggedIn: false, user: null });
    } catch {
      setState({ isLoading: false, isLoggedIn: false, user: null });
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };
}
