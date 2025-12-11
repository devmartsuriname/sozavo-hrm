/**
 * Hook for fetching HRM User Detail data
 * Phase 3 – Step 1: RBAC Visibility
 */

import { useEffect, useState } from 'react'
import { fetchUserDetail } from '@/services/hrmUserService'
import type { HrmUserDetail } from '@/types/hrm-users'

interface UseHrmUserDetailResult {
  user: HrmUserDetail | null
  isLoading: boolean
  error: string | null
}

export function useHrmUserDetail(userId: string | undefined): UseHrmUserDetailResult {
  const [user, setUser] = useState<HrmUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setUser(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const loadUser = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchUserDetail(userId)
        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load user details'
          setError(message)
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [userId])

  return { user, isLoading, error }
}
