/**
 * Hook for fetching HRM User Directory data
 * Phase 3 – Step 1: RBAC Visibility
 */

import { useEffect, useState } from 'react'
import { fetchUsersWithRoles } from '@/services/hrmUserService'
import type { HrmUserDirectory } from '@/types/hrm-users'

interface UseHrmUsersResult {
  users: HrmUserDirectory[]
  isLoading: boolean
  error: string | null
}

export function useHrmUsers(): UseHrmUsersResult {
  const [users, setUsers] = useState<HrmUserDirectory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchUsersWithRoles()
        if (!cancelled) {
          setUsers(data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load users'
          setError(message)
          setUsers([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [])

  return { users, isLoading, error }
}
