import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/UserProfile';
import { getDatabaseSync } from '../database/database';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  company: 'CirTag Industry',
  role: 'Sustainability',
  avatarUrl: '',
};

function ensureTable() {
  const db = getDatabaseSync();
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
}

function loadProfile(): UserProfile {
  ensureTable();
  const db = getDatabaseSync();
  const rows = db.getAllSync<{ key: string; value: string }>('SELECT key, value FROM user_profile');
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    name: map.name || DEFAULT_PROFILE.name,
    email: map.email || DEFAULT_PROFILE.email,
    phone: map.phone || DEFAULT_PROFILE.phone,
    company: map.company || DEFAULT_PROFILE.company,
    role: map.role || DEFAULT_PROFILE.role,
    avatarUrl: map.avatarUrl || DEFAULT_PROFILE.avatarUrl,
  };
}

function saveField(key: string, value: string) {
  ensureTable();
  const db = getDatabaseSync();
  db.runSync(
    'INSERT INTO user_profile (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
    [key, value, value]
  );
}

/** Read profile directly from DB — always fresh */
export function getProfileSync(): UserProfile {
  return loadProfile();
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    for (const [key, value] of Object.entries(updates)) {
      saveField(key, value as string);
    }
    setProfile(loadProfile());
  }, []);

  return { profile, updateProfile };
}
