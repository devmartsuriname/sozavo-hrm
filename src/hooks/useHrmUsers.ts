/**
 * Hook for fetching HRM User Directory data
 * Phase 3 – Steps 1-2: RBAC Visibility & Role Management
 * 
 * Uses RPC function get_all_users_with_roles() to fetch ALL auth users
 * including those without roles (Step 2 enhancement).
 */

import { useEffect, useState, useCallback } from 'react'
import { fetchUsersWithRolesRpc } from '@/services/hrmUserService'
import type { HrmUserWithRoles } from '@/types/hrm-users'

interface UseHrmUsersResult {
  users: HrmUserWithRoles[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHrmUsers(): UseHrmUsersResult {
  const [users, setUsers] = useState<HrmUserWithRoles[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchUsersWithRolesRpc()
      setUsers(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users'
      setError(message)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return { users, isLoading, error, refetch: loadUsers }
}
