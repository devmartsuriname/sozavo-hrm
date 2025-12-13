/**
 * useReactivateEmployee Hook
 * Manages state and logic for reactivating a terminated employee
 * Phase 4.2.1 implementation
 * 
 * SECURITY: Does NOT accept userId parameter - service layer handles auth internally
 */

import { useState, useCallback } from 'react'
import { reactivateEmployee } from '@/services/hrmEmployeeService'

interface UseReactivateEmployeeReturn {
  isReactivating: boolean
  error: string | null
  reactivate: (employeeId: string, reactivationReason: string | null) => Promise<boolean>
  clearError: () => void
}

export function useReactivateEmployee(): UseReactivateEmployeeReturn {
  const [isReactivating, setIsReactivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reactivate = useCallback(
    async (employeeId: string, reactivationReason: string | null): Promise<boolean> => {
      setIsReactivating(true)
      setError(null)

      try {
        // Service handles auth internally — no userId passed
        await reactivateEmployee(employeeId, reactivationReason)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reactivate employee'
        setError(message)
        return false
      } finally {
        setIsReactivating(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isReactivating,
    error,
    reactivate,
    clearError,
  }
}
