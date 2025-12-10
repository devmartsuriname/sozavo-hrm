/**
 * HRM Employee Service
 * Provides data access to hrm_employees table via Supabase
 * Respects RLS - queries run as the authenticated user
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmEmployeeDirectory, HrmEmployeeQueryResult } from '@/types/hrm'

/**
 * Fetches employees for the directory listing.
 * RLS policies determine which employees the current user can see:
 * - Admins/HR Managers: all employees
 * - Managers: direct reports only
 * - Employees: self only
 *
 * fullName is derived via TypeScript concatenation (not stored in DB)
 */
export async function fetchEmployeeDirectory(): Promise<HrmEmployeeDirectory[]> {
  const { data, error } = await supabase
    .from('hrm_employees')
    .select(
      'id, employee_code, first_name, last_name, email, phone, org_unit_id, position_id, manager_id, employment_status'
    )
    .order('employee_code', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }

  // Map results to add derived fullName field
  const employees: HrmEmployeeDirectory[] = (data as HrmEmployeeQueryResult[]).map(
    (emp) => ({
      ...emp,
      fullName: `${emp.first_name} ${emp.last_name}`,
    })
  )

  return employees
}
