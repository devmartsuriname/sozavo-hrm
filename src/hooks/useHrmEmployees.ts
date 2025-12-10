/**
 * useHrmEmployees Hook
 * Fetches employee directory data using authenticated Supabase session
 */

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { fetchEmployeeDirectory } from '@/services/hrmEmployeeService'
import type { HrmEmployeeDirectory } from '@/types/hrm'

interface UseHrmEmployeesResult {
  employees: HrmEmployeeDirectory[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHrmEmployees(): UseHrmEmployeesResult {
  const { status } = useSupabaseAuth()
  const [employees, setEmployees] = useState<HrmEmployeeDirectory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (status !== 'authenticated') {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchEmployeeDirectory()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [status])

  return {
    employees,
    isLoading,
    error,
    refetch: fetchData,
  }
}
