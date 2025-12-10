/**
 * HRM Employee Service
 * Provides data access to hrm_employees table via Supabase
 * Respects RLS - queries run as the authenticated user
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmEmployeeDirectory, HrmEmployeeQueryResult } from '@/types/hrm'

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
      .select('id, employee_code, first_name, last_name, email, phone, org_unit_id, position_id, manager_id, employment_status')
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
  const employeeMap = new Map<string, HrmEmployeeQueryResult>()
  ;(employeesResult.data as HrmEmployeeQueryResult[]).forEach((e) => employeeMap.set(e.id, e))

  // Map results to add derived fields
  const employees: HrmEmployeeDirectory[] = (employeesResult.data as HrmEmployeeQueryResult[]).map(
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
        fullName: `${emp.first_name} ${emp.last_name}`,
        orgUnitName: emp.org_unit_id ? orgUnitMap.get(emp.org_unit_id) ?? null : null,
        positionTitle: emp.position_id ? positionMap.get(emp.position_id) ?? null : null,
        managerName,
      }
    }
  )

  return employees
}
