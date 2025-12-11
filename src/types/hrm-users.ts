/**
 * HRM Users & RBAC TypeScript Types
 * For Phase 3 – Step 1: Read-Only RBAC Visibility
 */

import type { AppRole } from '@/types/supabase-auth'

// =============================================================================
// ROW TYPES (match database schema exactly)
// =============================================================================

/**
 * User role row type - matches user_roles table
 */
export interface UserRoleRow {
  id: string
  user_id: string
  role: AppRole
  created_at: string
  created_by: string | null
}

// =============================================================================
// VIEW MODEL TYPES (derived display types for UI)
// =============================================================================

/**
 * User Directory ViewModel - for user listing table
 * Aggregates user_id with all roles and linked employee info
 */
export interface HrmUserDirectory {
  userId: string
  email: string | null
  roles: AppRole[]
  linkedEmployeeId: string | null
  linkedEmployeeName: string | null
  linkedEmployeeCode: string | null
}

/**
 * User Detail ViewModel - for single user profile view
 * Extends directory with more employee info
 */
export interface HrmUserDetail {
  userId: string
  email: string | null
  roles: AppRole[]
  linkedEmployeeId: string | null
  linkedEmployeeName: string | null
  linkedEmployeeCode: string | null
  linkedEmployeeOrgUnit: string | null
  linkedEmployeePosition: string | null
  createdAt: string | null // Earliest role assignment timestamp
}
