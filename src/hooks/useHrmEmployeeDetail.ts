/**
 * useHrmEmployeeDetail Hook
 * Fetches a single employee by ID using authenticated Supabase session
 */

import { useEffect, useState, useCallback } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { fetchEmployeeDetail } from '@/services/hrmEmployeeService'
import type { HrmEmployeeDetail } from '@/types/hrm'

interface UseHrmEmployeeDetailResult {
  employee: HrmEmployeeDetail | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHrmEmployeeDetail(employeeId: string): UseHrmEmployeeDetailResult {
  const { status } = useSupabaseAuth()
  const [employee, setEmployee] = useState<HrmEmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') {
        setIsLoading(false)
        return
      }

      if (!employeeId) {
        setError('Employee ID is required')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchEmployeeDetail(employeeId)
        if (data === null) {
          setError('Employee not found or you do not have access to this record.')
        }
        setEmployee(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employee')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [status, employeeId, refetchTrigger])

  return { employee, isLoading, error, refetch }
}
