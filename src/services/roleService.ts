/**
 * Role Service for SoZaVo HRM System
 * 
 * Provides centralized role fetching and permission checking.
 * Uses RLS-protected queries against public.user_roles table.
 * 
 * IMPORTANT: This service is scaffolded in Phase 7A and will be
 * used by SupabaseAuthContext in Phase 7B.
 */

import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/supabase-auth';

/**
 * Fetch all roles for a given user from the database.
 * 
 * @param userId - The Supabase auth.users UUID
 * @returns Promise resolving to array of AppRole values
 * @throws Error if the Supabase query fails
 * 
 * RLS EXPECTATIONS:
 * - This query is subject to RLS policies on public.user_roles
 * - Admin/HR roles can see all user roles
 * - Regular users may only see their own roles (depending on policy)
 */
export async function fetchUserRoles(userId: string): Promise<AppRole[]> {
  // Note: user_roles table exists in database but may not be in generated Supabase types yet.
  // Using REST API directly until types are regenerated after the migration is applied.
  
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const headers: Record<string, string> = {
    'apikey': supabaseKey,
    'Content-Type': 'application/json',
  };
  
  // Add auth header if we have a session
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&select=role`,
    { headers }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch user roles: ${response.statusText} (${response.status}): ${errorText}`
    );
  }
  
  const rows: { role: string }[] = await response.json();
  
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map((row) => row.role as AppRole);
}

/**
 * Check if a roles array contains a specific role.
 * 
 * @param roles - Array of user roles
 * @param role - Role to check for
 * @returns True if the role is present
 */
export function hasRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}

/**
 * Derive boolean permission flags from a roles array.
 * 
 * @param roles - Array of user roles
 * @returns Object with isAdmin, isHRManager, isManager, isEmployee flags
 */
export function deriveRoleFlags(roles: AppRole[]): {
  isAdmin: boolean;
  isHRManager: boolean;
  isManager: boolean;
  isEmployee: boolean;
} {
  return {
    isAdmin: hasRole(roles, 'admin'),
    isHRManager: hasRole(roles, 'hr_manager'),
    isManager: hasRole(roles, 'manager'),
    isEmployee: hasRole(roles, 'employee'),
  };
}
