// Subscription / free-quota state.
//
// Free quota: each scanner (DPP + Value) gets its own one-time pool of
// FREE_LIMIT attempts. After that, an active subscription is required.
//
// Counters + subscription flags are stored in the existing `user_profile`
// key-value SQLite table so they survive history deletion.
//
// The purchase/restore functions are placeholders for now — Phase 3 swaps
// activateSubscription()/restorePurchases() for the RevenueCat SDK
// (react-native-purchases). The rest of the app talks only to this module,
// so wiring real billing later is a localized change.

import { getDatabaseSync } from '../database/database';

export type ScannerSource = 'dpp' | 'value';
export type SubscriptionPlan = 'monthly' | 'yearly';

/** Free attempts per scanner before the paywall. */
export const FREE_LIMIT = 10;

/** Price points (Swedish Krona). */
export const PRICING = {
  monthly: { amount: 99, currency: 'kr', period: 'month' },
  yearly: { amount: 999, currency: 'kr', period: 'year' },
} as const;

const KEY_USED: Record<ScannerSource, string> = {
  dpp: 'dppAttemptsUsed',
  value: 'valueAttemptsUsed',
};
const KEY_SUB_ACTIVE = 'subscriptionActive';
const KEY_SUB_PLAN = 'subscriptionPlan';
const KEY_SUB_SINCE = 'subscriptionSince';

function ensureTable() {
  const db = getDatabaseSync();
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
}

function getVal(key: string): string {
  ensureTable();
  const db = getDatabaseSync();
  const row = db.getFirstSync<{ value: string }>(
    'SELECT value FROM user_profile WHERE key = ?',
    [key]
  );
  return row?.value ?? '';
}

function setVal(key: string, value: string) {
  ensureTable();
  const db = getDatabaseSync();
  db.runSync(
    'INSERT INTO user_profile (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
    [key, value, value]
  );
}

export function isSubscribed(): boolean {
  return getVal(KEY_SUB_ACTIVE) === '1';
}

export function getSubscriptionPlan(): SubscriptionPlan | null {
  const p = getVal(KEY_SUB_PLAN);
  return p === 'monthly' || p === 'yearly' ? p : null;
}

export function getAttemptsUsed(source: ScannerSource): number {
  const n = parseInt(getVal(KEY_USED[source]) || '0', 10);
  return Number.isNaN(n) ? 0 : n;
}

export function freeRemaining(source: ScannerSource): number {
  return Math.max(0, FREE_LIMIT - getAttemptsUsed(source));
}

/** True if the user may run this scanner right now. */
export function canScan(source: ScannerSource): boolean {
  if (isSubscribed()) return true;
  return getAttemptsUsed(source) < FREE_LIMIT;
}

/** Count one successful scan against the free quota. No-op once subscribed. */
export function recordScan(source: ScannerSource): void {
  if (isSubscribed()) return;
  setVal(KEY_USED[source], String(getAttemptsUsed(source) + 1));
}

// --- Billing (placeholder — replaced by RevenueCat in Phase 3) ---

export function activateSubscription(plan: SubscriptionPlan): void {
  setVal(KEY_SUB_ACTIVE, '1');
  setVal(KEY_SUB_PLAN, plan);
  setVal(KEY_SUB_SINCE, String(Date.now()));
}

export function deactivateSubscription(): void {
  setVal(KEY_SUB_ACTIVE, '0');
  setVal(KEY_SUB_PLAN, '');
}

/**
 * Placeholder restore. With RevenueCat this will query the store for an
 * existing entitlement and re-activate it. Locally there is nothing to
 * restore, so it just reports the current state.
 */
export function restorePurchases(): boolean {
  return isSubscribed();
}
