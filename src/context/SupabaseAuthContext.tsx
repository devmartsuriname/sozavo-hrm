// IMPORTANT:
// This context is NOT wired into the app yet.
// Do NOT import or use SupabaseAuthProvider until Phase 7B.
// Phase 7A only scaffolds the infrastructure; existing auth must remain unchanged.

/**
 * Supabase Auth Context for SoZaVo HRM System
 * 
 * Provides session management, role fetching, and permission flags.
 * Implements hybrid failure mode: session can exist but blocked if roles fail to load.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  SupabaseAuthContextValue,
  SupabaseUserLite,
  SupabaseSessionLite,
  AppRole,
  AuthStatus,
} from '@/types/supabase-auth';
import { fetchUserRoles, deriveRoleFlags } from '@/services/roleService';

/**
 * The Supabase Auth Context.
 * Undefined until wrapped by SupabaseAuthProvider.
 */
const SupabaseAuthContext = createContext<SupabaseAuthContextValue | undefined>(undefined);

/**
 * Props for the SupabaseAuthProvider component.
 */
interface SupabaseAuthProviderProps {
  children: ReactNode;
}

/**
 * Default error message for role loading failures.
 */
const ROLES_ERROR_MESSAGE = 
  'Unable to load user roles. Please try again or contact the system administrator.';

/**
 * SupabaseAuthProvider manages authentication state and role resolution.
 * 
 * HYBRID FAILURE MODE:
 * - If roles fail to load, session remains valid but rolesError is set
 * - UI should check rolesError and block access rather than proceeding with empty roles
 * - This prevents silent "guest mode" when permissions cannot be verified
 */
export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  // Core auth state
  const [user, setUser] = useState<SupabaseUserLite | null>(null);
  const [session, setSession] = useState<SupabaseSessionLite | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Role state
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Derived role flags
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHRManager, setIsHRManager] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  /**
   * Update role flags from roles array.
   */
  const updateRoleFlags = (userRoles: AppRole[]) => {
    const flags = deriveRoleFlags(userRoles);
    setIsAdmin(flags.isAdmin);
    setIsHRManager(flags.isHRManager);
    setIsManager(flags.isManager);
    setIsEmployee(flags.isEmployee);
  };

  /**
   * Reset all role state to defaults.
   */
  const resetRoleState = () => {
    setRoles([]);
    setRolesError(null);
    setIsAdmin(false);
    setIsHRManager(false);
    setIsManager(false);
    setIsEmployee(false);
  };

  /**
   * Fetch roles for a user and update state.
   * Implements hybrid failure mode on error.
   */
  const loadRolesForUser = async (userId: string) => {
    try {
      const userRoles = await fetchUserRoles(userId);
      setRoles(userRoles);
      setRolesError(null);
      updateRoleFlags(userRoles);
    } catch (error) {
      // HYBRID FAILURE MODE:
      // Do NOT clear session, but set error and empty roles
      console.error('Failed to load user roles:', error);
      setRoles([]);
      setRolesError(ROLES_ERROR_MESSAGE);
      setIsAdmin(false);
      setIsHRManager(false);
      setIsManager(false);
      setIsEmployee(false);
    }
  };

  /**
   * Convert Supabase user to our lightweight type.
   */
  const toLiteUser = (supabaseUser: any): SupabaseUserLite | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? null,
    };
  };

  /**
   * Convert Supabase session to our lightweight type.
   */
  const toLiteSession = (supabaseSession: any): SupabaseSessionLite | null => {
    if (!supabaseSession) return null;
    return {
      accessToken: supabaseSession.access_token ?? null,
      expiresAt: supabaseSession.expires_at ?? null,
    };
  };

  /**
   * Public method to refresh roles from the database.
   */
  const refreshRoles = async (): Promise<void> => {
    if (!user) {
      console.warn('Cannot refresh roles: no user is authenticated');
      return;
    }
    await loadRolesForUser(user.id);
  };

  /**
   * Sign out the current user and reset all state.
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
    // Reset all state regardless of signOut result
    setUser(null);
    setSession(null);
    setStatus('unauthenticated');
    resetRoleState();
  };

  /**
   * Effect #1: Set up auth state change listener.
   * 
   * IMPORTANT: Role fetching is deferred via setTimeout(0) to avoid
   * deadlock/recursive issues with Supabase's internal state management.
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, supabaseSession) => {
        // Update session and user state synchronously
        const liteSession = toLiteSession(supabaseSession);
        const liteUser = toLiteUser(supabaseSession?.user);
        
        setSession(liteSession);
        setUser(liteUser);

        if (supabaseSession?.user) {
          setStatus('authenticated');
          
          // CRITICAL: Defer role fetch to avoid Supabase deadlock
          // See: supabase-adding-login-logout guidelines
          setTimeout(() => {
            loadRolesForUser(supabaseSession.user.id);
          }, 0);
        } else {
          setStatus('unauthenticated');
          resetRoleState();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Effect #2: Initial session check on mount.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setStatus('checking');
      setIsLoading(true);

      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();

        if (supabaseSession?.user) {
          const liteSession = toLiteSession(supabaseSession);
          const liteUser = toLiteUser(supabaseSession.user);

          setSession(liteSession);
          setUser(liteUser);
          setStatus('authenticated');

          // Fetch roles for the authenticated user
          await loadRolesForUser(supabaseSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setStatus('unauthenticated');
          resetRoleState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setStatus('unauthenticated');
        setUser(null);
        setSession(null);
        resetRoleState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Assemble the context value
  const value: SupabaseAuthContextValue = {
    user,
    session,
    roles,
    status,
    isLoading,
    rolesError,
    isAdmin,
    isHRManager,
    isManager,
    isEmployee,
    refreshRoles,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

/**
 * Hook to access the Supabase auth context.
 * 
 * @throws Error if used outside of SupabaseAuthProvider
 * @returns The auth context value with session, user, roles, and methods
 */
export function useSupabaseAuth(): SupabaseAuthContextValue {
  const context = useContext(SupabaseAuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useSupabaseAuth must be used within a SupabaseAuthProvider. ' +
      'Do not use it until Phase 7B wires the provider.'
    );
  }
  
  return context;
}
