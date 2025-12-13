/**
 * useUpdatePosition Hook
 * Manages update state for position edit operations
 */

import { useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { updatePosition } from '@/services/hrmPositionService'
import type { HrmPositionUpdatePayload, HrmPositionRow } from '@/types/hrm'

interface UseUpdatePositionResult {
  update: (positionId: string, payload: Omit<HrmPositionUpdatePayload, 'updated_by'>) => Promise<HrmPositionRow | null>
  isUpdating: boolean
  updateError: string | null
}

export function useUpdatePosition(): UseUpdatePositionResult {
  const { user } = useSupabaseAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const update = async (
    positionId: string,
    payload: Omit<HrmPositionUpdatePayload, 'updated_by'>
  ): Promise<HrmPositionRow | null> => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const result = await updatePosition(positionId, {
        ...payload,
        updated_by: user?.id ?? null,
      })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update position'
      setUpdateError(message)
      return null
    } finally {
      setIsUpdating(false)
    }
  }

  return { update, isUpdating, updateError }
}
