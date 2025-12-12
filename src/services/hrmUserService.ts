/**
 * HRM User Service
 * Provides access to users with their roles and linked employees.
 * Phase 3 – Steps 1-2: RBAC Visibility & Role Management
 * 
 * Step 1: Read-only aggregation from user_roles + hrm_employees
 * Step 2: RPC-based fetching via get_all_users_with_roles() + role/linking mutations
 */

import { supabase } from '@/integrations/supabase/client'
import type { AppRole } from '@/types/supabase-auth'
import type { HrmUserDirectory, HrmUserDetail, HrmUserWithRoles } from '@/types/hrm-users'

// =============================================================================
// RPC-BASED FETCHING (Phase 3 – Step 2)
// =============================================================================

/**
 * Fetch all users with roles via RPC function.
 * Uses SECURITY DEFINER function to safely access auth.users.
 * Returns ALL auth users, including those without roles.
 */
export async function fetchUsersWithRolesRpc(): Promise<HrmUserWithRoles[]> {
  const { data, error } = await supabase.rpc('get_all_users_with_roles')

  if (error) {
    throw new Error(`Failed to fetch users with roles: ${error.message}`)
  }

  if (!data) return []

  return data.map((row: {
    user_id: string
    email: string | null
    created_at: string | null
    roles: AppRole[] | null
    employee_id: string | null
    employee_code: string | null
    employee_name: string | null
  }) => ({
    userId: row.user_id,
    email: row.email ?? null,
    createdAt: row.created_at ?? null,
    roles: (row.roles ?? []) as AppRole[],
    employeeId: row.employee_id ?? null,
    employeeCode: row.employee_code ?? null,
    employeeName: row.employee_name ?? null,
  }))
}

// =============================================================================
// ROLE MANAGEMENT (Phase 3 – Step 2)
// =============================================================================

/**
 * Assign a role to a user.
 * Inserts into user_roles if the (userId, role) combination does not exist.
 * RLS: Only admin can insert roles.
 */
export async function assignRole(userId: string, role: AppRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role,
    })

  if (error) {
    // Check for unique constraint violation (role already exists)
    if (error.code === '23505') {
      // Role already assigned, not an error
      return
    }
    throw new Error(`Failed to assign role: ${error.message}`)
  }
}

/**
 * Remove a role from a user.
 * Deletes the entry from user_roles table.
 * RLS: Only admin can delete roles.
 */
export async function removeRole(userId: string, role: AppRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)

  if (error) {
    throw new Error(`Failed to remove role: ${error.message}`)
  }
}

// =============================================================================
// USER–EMPLOYEE LINKING (Phase 3 – Step 2)
// =============================================================================

/**
 * Link a user to an employee (1:1 mapping).
 * First clears any existing user_id on other employees,
 * then sets user_id on the target employee.
 * RLS: Only admin/HR manager can update employees.
 */
export async function linkUserToEmployee(userId: string, employeeId: string): Promise<void> {
  // Step 1: Clear any existing link for this user
  const { error: clearError } = await supabase
    .from('hrm_employees')
    .update({ user_id: null })
    .eq('user_id', userId)

  if (clearError) {
    throw new Error(`Failed to clear existing employee link: ${clearError.message}`)
  }

  // Step 2: Set user_id on the target employee
  const { error: linkError } = await supabase
    .from('hrm_employees')
    .update({ user_id: userId })
    .eq('id', employeeId)

  if (linkError) {
    throw new Error(`Failed to link user to employee: ${linkError.message}`)
  }
}

/**
 * Unlink a user from their employee record.
 * Sets user_id = null for the employee currently linked to this user.
 * RLS: Only admin/HR manager can update employees.
 */
export async function unlinkUserFromEmployee(userId: string): Promise<void> {
  const { error } = await supabase
    .from('hrm_employees')
    .update({ user_id: null })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to unlink user from employee: ${error.message}`)
  }
}

/**
 * Fetch all users with their roles and linked employee information.
 * 
 * Strategy:
 * 1. Query user_roles to get all users with roles
 * 2. Query hrm_employees to get employee linkages
 * 3. Aggregate in TypeScript
 * 
 * RLS: Only admin/hr_manager can see all user_roles records
 */
export async function fetchUsersWithRoles(): Promise<HrmUserDirectory[]> {
  // Fetch all user_roles records
  const { data: roleRows, error: roleError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .order('user_id')

  if (roleError) {
    throw new Error(`Failed to fetch user roles: ${roleError.message}`)
  }

  if (!roleRows || roleRows.length === 0) {
    return []
  }

  // Fetch all employees to link with users
  const { data: employees, error: empError } = await supabase
    .from('hrm_employees')
    .select('id, user_id, employee_code, first_name, last_name')

  if (empError) {
    console.warn('Failed to fetch employees for user linkage:', empError.message)
    // Continue without employee data - don't throw
  }

  // Create employee lookup map by user_id
  const employeeByUserId = new Map<string, {
    id: string
    code: string
    fullName: string
  }>()

  if (employees) {
    for (const emp of employees) {
      if (emp.user_id) {
        employeeByUserId.set(emp.user_id, {
          id: emp.id,
          code: emp.employee_code,
          fullName: `${emp.first_name} ${emp.last_name}`.trim(),
        })
      }
    }
  }

  // Aggregate roles by user_id
  const userRolesMap = new Map<string, AppRole[]>()
  for (const row of roleRows) {
    const existing = userRolesMap.get(row.user_id) || []
    existing.push(row.role as AppRole)
    userRolesMap.set(row.user_id, existing)
  }

  // Build directory entries
  const result: HrmUserDirectory[] = []

  for (const [userId, roles] of userRolesMap.entries()) {
    const linkedEmployee = employeeByUserId.get(userId)
    
    // We don't have access to auth.users email directly
    // Email will be populated from hrm_employees if linked
    const linkedEmployeeEntry = employees?.find(e => e.user_id === userId)

    result.push({
      userId,
      email: linkedEmployeeEntry?.first_name && linkedEmployeeEntry?.last_name 
        ? null // We'll populate from employee if available, or show user ID
        : null,
      roles,
      linkedEmployeeId: linkedEmployee?.id ?? null,
      linkedEmployeeName: linkedEmployee?.fullName ?? null,
      linkedEmployeeCode: linkedEmployee?.code ?? null,
    })
  }

  // Sort by userId for consistent ordering
  result.sort((a, b) => a.userId.localeCompare(b.userId))

  return result
}

/**
 * Fetch details for a single user by their user_id.
 * 
 * Returns null if user not found or access denied by RLS.
 */
export async function fetchUserDetail(userId: string): Promise<HrmUserDetail | null> {
  // Fetch user's roles
  const { data: roleRows, error: roleError } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (roleError) {
    throw new Error(`Failed to fetch user roles: ${roleError.message}`)
  }

  if (!roleRows || roleRows.length === 0) {
    return null
  }

  const roles = roleRows.map(r => r.role as AppRole)
  const createdAt = roleRows[0]?.created_at ?? null

  // Fetch linked employee with org unit and position
  const { data: employees, error: empError } = await supabase
    .from('hrm_employees')
    .select('id, employee_code, first_name, last_name, org_unit_id, position_id')
    .eq('user_id', userId)
    .maybeSingle()

  let linkedEmployee: {
    id: string
    code: string
    fullName: string
    orgUnitId: string | null
    positionId: string | null
  } | null = null

  if (!empError && employees) {
    linkedEmployee = {
      id: employees.id,
      code: employees.employee_code,
      fullName: `${employees.first_name} ${employees.last_name}`.trim(),
      orgUnitId: employees.org_unit_id,
      positionId: employees.position_id,
    }
  }

  // Fetch org unit and position names if we have IDs
  let orgUnitName: string | null = null
  let positionTitle: string | null = null

  if (linkedEmployee?.orgUnitId) {
    const { data: orgUnit } = await supabase
      .from('hrm_organization_units')
      .select('name')
      .eq('id', linkedEmployee.orgUnitId)
      .maybeSingle()
    orgUnitName = orgUnit?.name ?? null
  }

  if (linkedEmployee?.positionId) {
    const { data: position } = await supabase
      .from('hrm_positions')
      .select('title')
      .eq('id', linkedEmployee.positionId)
      .maybeSingle()
    positionTitle = position?.title ?? null
  }

  return {
    userId,
    email: null, // Can't access auth.users directly
    roles,
    linkedEmployeeId: linkedEmployee?.id ?? null,
    linkedEmployeeName: linkedEmployee?.fullName ?? null,
    linkedEmployeeCode: linkedEmployee?.code ?? null,
    linkedEmployeeOrgUnit: orgUnitName,
    linkedEmployeePosition: positionTitle,
    createdAt,
  }
}
