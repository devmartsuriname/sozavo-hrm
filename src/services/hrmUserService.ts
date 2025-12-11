/**
 * HRM User Service
 * Provides read-only access to users with their roles and linked employees.
 * Phase 3 – Step 1: RBAC Visibility
 * 
 * NOTE: This service aggregates data from user_roles and hrm_employees tables.
 * It cannot directly query auth.users due to RLS constraints.
 * Users without assigned roles will NOT appear in the directory.
 */

import { supabase } from '@/integrations/supabase/client'
import type { AppRole } from '@/types/supabase-auth'
import type { HrmUserDirectory, HrmUserDetail } from '@/types/hrm-users'

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
