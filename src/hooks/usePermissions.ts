/**
 * usePermissions Hook
 * Centralized permission utilities for RBAC enforcement
 * Phase 3 – Step 3.3: Permission Utilities
 */

import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import type { AppRole } from '@/types/supabase-auth'

export interface UsePermissionsReturn {
  // Role boolean helpers (from context)
  isAdmin: boolean
  isHRManager: boolean
  isManager: boolean
  isEmployee: boolean
  
  // Current user ID for ownership checks
  userId: string | null
  
  // Permission checkers
  canViewUsers: () => boolean
  canModifyRoles: () => boolean
  canViewHRMData: () => boolean
  canEditEmployee: () => boolean
  canViewEmployee: (employeeUserId: string | null) => boolean
  
  // Utility
  hasAnyRole: (...roles: AppRole[]) => boolean
}

/**
 * Hook providing centralized permission checking utilities.
 * Maps role flags to permission helpers for consistent RBAC enforcement.
 * 
 * Permission Matrix:
 * | Permission       | Admin | HR Manager | Manager | Employee |
 * |-----------------|-------|------------|---------|----------|
 * | canViewUsers    | ✅    | ✅         | ❌      | ❌       |
 * | canModifyRoles  | ✅    | ❌         | ❌      | ❌       |
 * | canViewHRMData  | ✅    | ✅         | ❌      | ❌       |
 * | canEditEmployee | ✅    | ✅         | ❌      | ❌       |
 * | canViewEmployee | ✅    | ✅         | Direct  | Self     |
 */
export function usePermissions(): UsePermissionsReturn {
  const { 
    user, 
    isAdmin, 
    isHRManager, 
    isManager, 
    isEmployee,
    roles 
  } = useSupabaseAuth()
  
  const userId = user?.id ?? null
  
  /**
   * Check if user can view the Users & Roles management pages
   * Admin and HR Manager only
   */
  const canViewUsers = (): boolean => {
    return isAdmin || isHRManager
  }
  
  /**
   * Check if user can modify roles (assign/remove)
   * Admin only
   */
  const canModifyRoles = (): boolean => {
    return isAdmin
  }
  
  /**
   * Check if user can view structural HRM data (org units, positions)
   * Admin and HR Manager only
   */
  const canViewHRMData = (): boolean => {
    return isAdmin || isHRManager
  }
  
  /**
   * Check if user can edit employee records
   * Admin and HR Manager only
   */
  const canEditEmployee = (): boolean => {
    return isAdmin || isHRManager
  }
  
  /**
   * Check if user can view a specific employee record
   * - Admin / HR Manager → always true
   * - Manager → true for direct reports (handled by RLS, returns true here)
   * - Employee → true only if viewing own record
   * 
   * @param employeeUserId - The user_id of the employee being viewed
   */
  const canViewEmployee = (employeeUserId: string | null): boolean => {
    // Admin and HR Manager can view all
    if (isAdmin || isHRManager) {
      return true
    }
    
    // Manager visibility is handled by RLS (is_manager_of function)
    // Frontend shows the data if RLS returns it
    if (isManager) {
      return true
    }
    
    // Employee can only view their own record
    if (isEmployee && employeeUserId) {
      return userId === employeeUserId
    }
    
    return false
  }
  
  /**
   * Check if user has any of the specified roles
   * Utility for custom permission checks
   */
  const hasAnyRole = (...checkRoles: AppRole[]): boolean => {
    if (!roles || roles.length === 0) return false
    return checkRoles.some(role => roles.includes(role))
  }
  
  return {
    // Role flags
    isAdmin,
    isHRManager,
    isManager,
    isEmployee,
    
    // User ID
    userId,
    
    // Permission checkers
    canViewUsers,
    canModifyRoles,
    canViewHRMData,
    canEditEmployee,
    canViewEmployee,
    
    // Utility
    hasAnyRole,
  }
}
