/**
 * useHrmPositions Hook
 * Fetches positions using authenticated Supabase session
 */

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { fetchPositions } from '@/services/hrmPositionService'
import type { HrmPositionDirectory } from '@/types/hrm'

interface UseHrmPositionsResult {
  positions: HrmPositionDirectory[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHrmPositions(): UseHrmPositionsResult {
  const { status } = useSupabaseAuth()
  const [positions, setPositions] = useState<HrmPositionDirectory[]>([])
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
      const data = await fetchPositions()
      setPositions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load positions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [status])

  return {
    positions,
    isLoading,
    error,
    refetch: fetchData,
  }
}
