/**
 * QiHome Feature Module
 * 
 * Household management module ported from qihome-test.
 * Provides shared expense tracking, ledger management,
 * and bill history for multi-tenant households.
 * 
 * Components:
 *   - LedgerView: Display user balances with settlement
 *   - ActivityFeed: Realtime transaction feed
 *   - BillHistory: Historical bill records
 *   - BillEntry: Form to log new bill estimates
 *   - Avatar: Supabase-backed avatar upload
 * 
 * Hooks:
 *   - useBills: Bill CRUD with tenant isolation
 *   - useLedger: Ledger data with realtime subscriptions
 */

// Components
export { default as LedgerView } from './components/LedgerView';
export { default as ActivityFeed } from './components/ActivityFeed';
export { default as BillHistory } from './components/BillHistory';
export { default as BillEntry } from './components/BillEntry';
export { default as Avatar } from './components/Avatar';

// Hooks
export { useBills } from './hooks/useBills';
export { useLedger } from './hooks/useLedger';

// Types
export type { Bill, BillSplit } from './hooks/useBills';
export type { UserBalance, LedgerEntry } from './hooks/useLedger';
