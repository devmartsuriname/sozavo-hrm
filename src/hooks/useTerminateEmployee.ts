/**
 * useTerminateEmployee Hook
 * Manages state and logic for terminating an employee (soft delete)
 * Phase 4.2 implementation
 */

import { useState, useCallback } from 'react'
import { terminateEmployee } from '@/services/hrmEmployeeService'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'

interface UseTerminateEmployeeReturn {
  isTerminating: boolean
  error: string | null
  terminate: (employeeId: string, terminationDate: string, terminationReason: string | null) => Promise<boolean>
  clearError: () => void
}

export function useTerminateEmployee(): UseTerminateEmployeeReturn {
  const { user } = useSupabaseAuth()
  const [isTerminating, setIsTerminating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const terminate = useCallback(
    async (employeeId: string, terminationDate: string, terminationReason: string | null): Promise<boolean> => {
      if (!user?.id) {
        setError('You must be logged in to terminate an employee.')
        return false
      }

      setIsTerminating(true)
      setError(null)

      try {
        await terminateEmployee(employeeId, terminationDate, terminationReason, user.id)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to terminate employee'
        setError(message)
        return false
      } finally {
        setIsTerminating(false)
      }
    },
    [user?.id]
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
