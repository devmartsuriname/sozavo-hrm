/**
 * useHrmOrgUnits Hook
 * Fetches organization units using authenticated Supabase session
 */

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { fetchOrgUnits } from '@/services/hrmOrgUnitService'
import type { HrmOrgUnitDirectory } from '@/types/hrm'

interface UseHrmOrgUnitsResult {
  orgUnits: HrmOrgUnitDirectory[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHrmOrgUnits(): UseHrmOrgUnitsResult {
  const { status } = useSupabaseAuth()
  const [orgUnits, setOrgUnits] = useState<HrmOrgUnitDirectory[]>([])
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
      const data = await fetchOrgUnits()
      setOrgUnits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization units')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [status])

  return {
    orgUnits,
    isLoading,
    error,
    refetch: fetchData,
  }
}
