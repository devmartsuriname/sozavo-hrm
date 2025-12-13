/**
 * useUpdateOrgUnit Hook
 * Manages update state for organization unit edit operations
 */

import { useState } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { updateOrgUnit } from '@/services/hrmOrgUnitService'
import type { HrmOrgUnitUpdatePayload, HrmOrgUnitRow } from '@/types/hrm'

interface UseUpdateOrgUnitResult {
  update: (orgUnitId: string, payload: Omit<HrmOrgUnitUpdatePayload, 'updated_by'>) => Promise<HrmOrgUnitRow | null>
  isUpdating: boolean
  updateError: string | null
}

export function useUpdateOrgUnit(): UseUpdateOrgUnitResult {
  const { user } = useSupabaseAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const update = async (
    orgUnitId: string,
    payload: Omit<HrmOrgUnitUpdatePayload, 'updated_by'>
  ): Promise<HrmOrgUnitRow | null> => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const result = await updateOrgUnit(orgUnitId, {
        ...payload,
        updated_by: user?.id ?? null,
      })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update organization unit'
      setUpdateError(message)
      return null
    } finally {
      setIsUpdating(false)
    }
  }

  return { update, isUpdating, updateError }
}
