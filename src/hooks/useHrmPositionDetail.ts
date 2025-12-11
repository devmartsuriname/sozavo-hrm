/**
 * useHrmPositionDetail Hook
 * Fetches a single position by ID using authenticated Supabase session
 */

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { fetchPositionDetail } from '@/services/hrmPositionService'
import type { HrmPositionDetail } from '@/types/hrm'

interface UseHrmPositionDetailResult {
  position: HrmPositionDetail | null
  isLoading: boolean
  error: string | null
}

export function useHrmPositionDetail(positionId: string): UseHrmPositionDetailResult {
  const { status } = useSupabaseAuth()
  const [position, setPosition] = useState<HrmPositionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') {
        setIsLoading(false)
        return
      }

      if (!positionId) {
        setError('Position ID is required')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchPositionDetail(positionId)
        if (data === null) {
          setError('Position not found or you do not have access to this record.')
        }
        setPosition(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load position')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [status, positionId])

  return { position, isLoading, error }
}
