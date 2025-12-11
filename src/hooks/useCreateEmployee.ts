/**
 * Hook for creating new employee records
 * Handles employee code generation and submission
 */

import { useState } from 'react'
import { createEmployee, generateEmployeeCode } from '@/services/hrmEmployeeService'
import { supabase } from '@/integrations/supabase/client'
import type { HrmEmployeeCreatePayload, HrmEmployeeRow, EmploymentStatusType } from '@/types/hrm'

/** Form data type (without auto-generated fields) */
export interface EmployeeCreateFormData {
  first_name: string
  last_name: string
  email: string
  phone: string | null
  org_unit_id: string
  position_id: string
  manager_id: string | null
  employment_status: EmploymentStatusType
  hire_date: string | null
  termination_date: string | null
  is_active: boolean
}

export function useCreateEmployee() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (formData: EmployeeCreateFormData): Promise<HrmEmployeeRow | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user ID for audit fields
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || null

      // Generate unique employee code
      const employeeCode = await generateEmployeeCode(formData.org_unit_id)

      // Build full payload with auto-generated fields
      const payload: HrmEmployeeCreatePayload = {
        ...formData,
        employee_code: employeeCode,
        created_by: userId,
        updated_by: userId,
      }

      const result = await createEmployee(payload)
      return result
    } catch (e: any) {
      const message = e.message || 'Failed to create employee'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}
