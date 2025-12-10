/**
 * HRM Module TypeScript Types
 * Used for Employee Directory and related HRM functionality
 */

import type { Database } from '@/integrations/supabase/types'

// Base employee row type from Supabase
export type HrmEmployeeRow = Database['public']['Tables']['hrm_employees']['Row']

// Employee directory display type (with derived fullName)
export interface HrmEmployeeDirectory {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  fullName: string // Derived: first_name + ' ' + last_name
  email: string
  phone: string | null
  org_unit_id: string | null
  position_id: string | null
  manager_id: string | null
  employment_status: string
}

// Query result type (raw from Supabase, before adding fullName)
export type HrmEmployeeQueryResult = Pick<
  HrmEmployeeRow,
  | 'id'
  | 'employee_code'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'org_unit_id'
  | 'position_id'
  | 'manager_id'
  | 'employment_status'
>
