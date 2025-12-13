/**
 * useTerminateEmployee Hook
 * Manages state and logic for terminating an employee (soft delete)
 * Phase 4.2.1 implementation
 * 
 * SECURITY: Does NOT accept userId parameter - service layer handles auth internally
 */

import { useState, useCallback } from 'react'
import { terminateEmployee } from '@/services/hrmEmployeeService'

interface UseTerminateEmployeeReturn {
  isTerminating: boolean
  error: string | null
  terminate: (employeeId: string, terminationDate: string, terminationReason: string | null) => Promise<boolean>
  clearError: () => void
}

export function useTerminateEmployee(): UseTerminateEmployeeReturn {
  const [isTerminating, setIsTerminating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const terminate = useCallback(
    async (employeeId: string, terminationDate: string, terminationReason: string | null): Promise<boolean> => {
      setIsTerminating(true)
      setError(null)

      try {
        // Service handles auth internally — no userId passed
        await terminateEmployee(employeeId, terminationDate, terminationReason)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to terminate employee'
        setError(message)
        return false
      } finally {
        setIsTerminating(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isTerminating,
    error,
    terminate,
    clearError,
  }
}
