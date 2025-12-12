/**
 * Hook for fetching HRM User Detail data
 * Phase 3 – Steps 1-2: RBAC Visibility & Role Management
 */

import { useEffect, useState, useCallback } from 'react'
import { fetchUsersWithRolesRpc } from '@/services/hrmUserService'
import type { HrmUserWithRoles } from '@/types/hrm-users'

interface UseHrmUserDetailResult {
  user: HrmUserWithRoles | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHrmUserDetail(userId: string | undefined): UseHrmUserDetailResult {
  const [user, setUser] = useState<HrmUserWithRoles | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = useCallback(async () => {
    if (!userId) {
      setUser(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all users via RPC and filter for the one we need
      const allUsers = await fetchUsersWithRolesRpc()
      const foundUser = allUsers.find(u => u.userId === userId) ?? null
      setUser(foundUser)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load user details'
      setError(message)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return { user, isLoading, error, refetch: loadUser }
}
