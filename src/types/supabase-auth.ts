/**
 * Supabase Auth Types for SoZaVo HRM System
 * 
 * IMPORTANT: This file defines types for the Supabase-based authentication layer.
 * These types are scaffolded in Phase 7A and will be wired into the app in Phase 7B.
 */

/**
 * AppRole mirrors the public.app_role enum in the database.
 * 
 * SYNC WARNING: This type MUST always be kept in sync with the database enum.
 * If you add/remove roles in the database, update this type accordingly.
 * 
 * Database definition (db/hrm/enums.sql):
 *   CREATE TYPE public.app_role AS ENUM ('admin', 'hr_manager', 'manager', 'employee');
 */
export type AppRole = 'admin' | 'hr_manager' | 'manager' | 'employee';

/**
 * Lightweight representation of a Supabase user.
 * Intentionally minimal to avoid tight coupling with Supabase SDK types.
 */
export interface SupabaseUserLite {
  id: string;
  email: string | null;
  [key: string]: any;
}

/**
 * Lightweight representation of a Supabase session.
 * Contains only the fields needed by our auth context.
 */
export interface SupabaseSessionLite {
  accessToken?: string | null;
  expiresAt?: number | null;
  [key: string]: any;
}

/**
 * Authentication status states.
 * - 'idle': Initial state before any auth check
 * - 'checking': Currently verifying session
 * - 'authenticated': Valid session exists
 * - 'unauthenticated': No valid session
 */
export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated';

/**
 * Role flags derived from the user's roles array.
 * Used for quick permission checks in UI components.
 */
export interface RoleFlags {
  isAdmin: boolean;
  isHRManager: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

/**
 * Complete auth context state.
 * Combines session, user, roles, and derived permission flags.
 */
export interface AuthContextState extends RoleFlags {
  /** Current Supabase user (null if not authenticated) */
  user: SupabaseUserLite | null;
  
  /** Current Supabase session (null if not authenticated) */
  session: SupabaseSessionLite | null;
  
  /** User's roles fetched from public.user_roles */
  roles: AppRole[];
  
  /** Current authentication status */
  status: AuthStatus;
  
  /** True while checking session or fetching roles */
  isLoading: boolean;
  
  /**
   * Error message if role fetching failed.
   * 
   * HYBRID FAILURE MODE:
   * When this is non-null, the user may have a valid session but roles
   * could not be loaded. UI should block access and show this message
   * rather than treating the user as having no permissions.
   */
  rolesError: string | null;
  
  /** Re-fetch roles from the database */
  refreshRoles: () => Promise<void>;
  
  /** Sign out the current user */
  signOut: () => Promise<void>;
}

/**
 * The value type exposed by SupabaseAuthContext.
 * Used by the useSupabaseAuth hook.
 */
export type SupabaseAuthContextValue = AuthContextState;
