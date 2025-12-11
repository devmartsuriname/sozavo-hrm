/**
 * Hook for updating an employee record.
 * Manages loading, error, and success states.
 */

import { useState, useCallback } from 'react'
import { updateEmployee as updateEmployeeService } from '@/services/hrmEmployeeService'
import type { HrmEmployeeUpdatePayload, HrmEmployeeRow } from '@/types/hrm'

interface UseUpdateEmployeeReturn {
  updateEmployee: (payload: HrmEmployeeUpdatePayload) => Promise<HrmEmployeeRow | null>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
  reset: () => void
}

export function useUpdateEmployee(employeeId: string): UseUpdateEmployeeReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setIsSuccess(false)
  }, [])

  const updateEmployee = useCallback(
    async (payload: HrmEmployeeUpdatePayload): Promise<HrmEmployeeRow | null> => {
      if (!employeeId) {
        setError('Employee ID is required')
        return null
      }

      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      try {
        const result = await updateEmployeeService(employeeId, payload)
        setIsSuccess(true)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update employee'
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [employeeId]
  )

  return {
    updateEmployee,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}
