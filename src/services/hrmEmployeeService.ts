/**
 * HRM Employee Service
 * Provides data access to hrm_employees table via Supabase
 * Respects RLS - queries run as the authenticated user
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmEmployeeDirectory, HrmEmployeeDetail, HrmEmployeeDirectoryQuery, HrmEmployeeTerminatePayload } from '@/types/hrm'

/**
 * Fetches employees for the directory listing with org unit and position names.
 * Uses parallel queries + TypeScript merge pattern (no FK constraints in DB).
 * 
 * RLS policies determine which employees the current user can see:
 * - Admins/HR Managers: all employees + can read org units/positions
 * - Managers: direct reports only, org unit/position names may be null (RLS)
 * - Employees: self only, org unit/position names may be null (RLS)
 *
 * Derived fields (not stored in DB):
 * - fullName: first_name + ' ' + last_name
 * - orgUnitName: from hrm_organization_units.name
 * - positionTitle: from hrm_positions.title
 */
export async function fetchEmployeeDirectory(): Promise<HrmEmployeeDirectory[]> {
  // Parallel fetch: employees, org units, positions
  const [employeesResult, orgUnitsResult, positionsResult] = await Promise.all([
    supabase
      .from('hrm_employees')
      .select('id, employee_code, first_name, last_name, email, phone, org_unit_id, position_id, manager_id, employment_status, hire_date, termination_date, is_active, created_at, updated_at')
      .order('employee_code', { ascending: true }),
    supabase
      .from('hrm_organization_units')
      .select('id, name'),
    supabase
      .from('hrm_positions')
      .select('id, title'),
  ])

  if (employeesResult.error) {
    throw new Error(`Failed to fetch employees: ${employeesResult.error.message}`)
  }

  // Note: org units and positions may fail due to RLS for non-admin users
  // We handle this gracefully by using empty maps
  const orgUnitMap = new Map<string, string>()
  if (!orgUnitsResult.error && orgUnitsResult.data) {
    orgUnitsResult.data.forEach((ou) => orgUnitMap.set(ou.id, ou.name))
  }

  const positionMap = new Map<string, string>()
  if (!positionsResult.error && positionsResult.data) {
    positionsResult.data.forEach((p) => positionMap.set(p.id, p.title))
  }

  // Build employee lookup map for manager name resolution
  const employeeMap = new Map<string, HrmEmployeeDirectoryQuery>()
  ;(employeesResult.data as HrmEmployeeDirectoryQuery[]).forEach((e) => employeeMap.set(e.id, e))

  // Map results to add derived fields
  const employees: HrmEmployeeDirectory[] = (employeesResult.data as HrmEmployeeDirectoryQuery[]).map(
    (emp) => {
      // Derive manager name from the same employee dataset
      let managerName: string | null = null
      if (emp.manager_id) {
        const manager = employeeMap.get(emp.manager_id)
        if (manager) {
          managerName = `${manager.first_name} ${manager.last_name}`
        }
      }

      return {
        ...emp,
        // Add missing fields with defaults for directory view
        hire_date: null,
        termination_date: null,
        is_active: true,
        created_at: '',
        updated_at: '',
        terminated_by: null,
        termination_reason: null,
        fullName: `${emp.first_name} ${emp.last_name}`,
        orgUnitName: emp.org_unit_id ? orgUnitMap.get(emp.org_unit_id) ?? null : null,
        positionTitle: emp.position_id ? positionMap.get(emp.position_id) ?? null : null,
        managerName,
      }
    }
  )

  return employees
}

/**
 * Fetches a single employee by ID with derived fields.
 * Returns null when:
 * - Employee not found
 * - RLS denies access
 * 
 * Throws only for genuine query errors.
 */
export async function fetchEmployeeDetail(
  employeeId: string
): Promise<HrmEmployeeDetail | null> {
  // Parallel fetch: single employee, org units, positions, all employees (for manager name)
  const [employeeResult, orgUnitsResult, positionsResult, allEmployeesResult] = await Promise.all([
    supabase
      .from('hrm_employees')
      .select('*')
      .eq('id', employeeId)
      .maybeSingle(),
    supabase
      .from('hrm_organization_units')
      .select('id, name'),
    supabase
      .from('hrm_positions')
      .select('id, title'),
    supabase
      .from('hrm_employees')
      .select('id, first_name, last_name'),
  ])

  // Throw for genuine query errors
  if (employeeResult.error) {
    throw new Error(`Failed to fetch employee: ${employeeResult.error.message}`)
  }

  // Return null if not found or RLS denied access
  if (!employeeResult.data) {
    return null
  }

  const emp = employeeResult.data

  // Build lookup maps (gracefully handle RLS blocking related tables)
  const orgUnitMap = new Map<string, string>()
  if (!orgUnitsResult.error && orgUnitsResult.data) {
    orgUnitsResult.data.forEach((ou) => orgUnitMap.set(ou.id, ou.name))
  }

  const positionMap = new Map<string, string>()
  if (!positionsResult.error && positionsResult.data) {
    positionsResult.data.forEach((p) => positionMap.set(p.id, p.title))
  }

  const employeeMap = new Map<string, { first_name: string; last_name: string }>()
  if (!allEmployeesResult.error && allEmployeesResult.data) {
    allEmployeesResult.data.forEach((e) => employeeMap.set(e.id, e))
  }

  // Derive manager name
  let managerName: string | null = null
  if (emp.manager_id) {
    const manager = employeeMap.get(emp.manager_id)
    if (manager) {
      managerName = `${manager.first_name} ${manager.last_name}`
    }
  }

  return {
    ...emp,
    fullName: `${emp.first_name} ${emp.last_name}`,
    orgUnitName: emp.org_unit_id ? orgUnitMap.get(emp.org_unit_id) ?? null : null,
    positionTitle: emp.position_id ? positionMap.get(emp.position_id) ?? null : null,
    managerName,
  }
}

/**
 * Updates an employee record by ID.
 * RLS enforces access: only admins and HR managers can update.
 * Returns the updated employee row or throws an error.
 */
export async function updateEmployee(
  employeeId: string,
  payload: import('@/types/hrm').HrmEmployeeUpdatePayload
): Promise<import('@/types/hrm').HrmEmployeeRow> {
  const { data, error } = await supabase
    .from('hrm_employees')
    .update(payload)
    .eq('id', employeeId)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`)
  }

  return data as import('@/types/hrm').HrmEmployeeRow
}

/**
 * Generates a unique employee code based on organization unit.
 * Pattern: EMP-{ORG_PREFIX}-{SEQUENCE}
 * e.g., EMP-HR-001, EMP-VHV-002
 */
export async function generateEmployeeCode(orgUnitId: string): Promise<string> {
  // 1. Get org unit code
  const { data: orgUnit, error: orgError } = await supabase
    .from('hrm_organization_units')
    .select('code')
    .eq('id', orgUnitId)
    .single()

  if (orgError || !orgUnit) {
    // Fallback to generic prefix if org unit lookup fails
    console.warn('Could not fetch org unit code, using GEN prefix')
  }

  // 2. Extract prefix (last segment of code, uppercase, alphanumeric only)
  const rawCode = orgUnit?.code || 'GEN'
  const prefix = rawCode
    .split('_')
    .pop()
    ?.replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase() || 'GEN'

  // 3. Count existing employees with this prefix pattern
  const { count, error: countError } = await supabase
    .from('hrm_employees')
    .select('*', { count: 'exact', head: true })
    .like('employee_code', `EMP-${prefix}-%`)

  if (countError) {
    console.warn('Could not count existing employees:', countError.message)
  }

  // 4. Generate next sequence number (zero-padded to 3 digits)
  const sequence = String((count || 0) + 1).padStart(3, '0')

  return `EMP-${prefix}-${sequence}`
}

/**
 * Creates a new employee record.
 * RLS enforces access: only admins and HR managers can insert.
 * Returns the created employee row or throws an error.
 */
export async function createEmployee(
  payload: import('@/types/hrm').HrmEmployeeCreatePayload
): Promise<import('@/types/hrm').HrmEmployeeRow> {
  const { data, error } = await supabase
    .from('hrm_employees')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`)
  }

  return data as import('@/types/hrm').HrmEmployeeRow
}

/**
 * Terminates an employee (soft delete with audit trail).
 * Sets employment_status='terminated', is_active=false, termination_date, 
 * terminated_by, and termination_reason.
 * 
 * RLS enforces access:
 * - Admins: can terminate any employee
 * - HR Managers: can terminate any employee
 * - Managers: can only terminate employees in their org unit
 * 
 * Phase 4.2 implementation.
 */
export async function terminateEmployee(
  employeeId: string,
  terminationDate: string,
  terminationReason: string | null,
  terminatedByUserId: string
): Promise<import('@/types/hrm').HrmEmployeeRow> {
  const payload: HrmEmployeeTerminatePayload = {
    employment_status: 'terminated',
    termination_date: terminationDate,
    is_active: false,
    terminated_by: terminatedByUserId,
    termination_reason: terminationReason,
    updated_by: terminatedByUserId,
  }

  const { data, error } = await supabase
    .from('hrm_employees')
    .update(payload)
    .eq('id', employeeId)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to terminate employee: ${error.message}`)
  }

  return data as import('@/types/hrm').HrmEmployeeRow
}
