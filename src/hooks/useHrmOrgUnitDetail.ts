/**
 * useHrmOrgUnitDetail Hook
 * Fetches a single organization unit by ID using authenticated Supabase session
 */

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { fetchOrgUnitDetail } from '@/services/hrmOrgUnitService'
import type { HrmOrgUnitDetail } from '@/types/hrm'

interface UseHrmOrgUnitDetailResult {
  orgUnit: HrmOrgUnitDetail | null
  isLoading: boolean
  error: string | null
}

export function useHrmOrgUnitDetail(orgUnitId: string): UseHrmOrgUnitDetailResult {
  const { status } = useSupabaseAuth()
  const [orgUnit, setOrgUnit] = useState<HrmOrgUnitDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') {
        setIsLoading(false)
        return
      }

      if (!orgUnitId) {
        setError('Organization Unit ID is required')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchOrgUnitDetail(orgUnitId)
        if (data === null) {
          setError('Organization unit not found or you do not have access to this record.')
        }
        setOrgUnit(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organization unit')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [status, orgUnitId])

  return { orgUnit, isLoading, error }
}
