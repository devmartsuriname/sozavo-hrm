/**
 * HRM Position Service
 * Fetches positions with derived fields using parallel-fetch + Map pattern
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmPositionDirectory, HrmPositionRow, HrmPositionDetail } from '@/types/hrm'

/**
 * Fetch all positions with org unit name lookup
 * Respects RLS - returns empty array if access denied
 */
export async function fetchPositions(): Promise<HrmPositionDirectory[]> {
  // Parallel fetch: positions + org units for name lookup
  const [positionsResult, orgUnitsResult] = await Promise.all([
    supabase
      .from('hrm_positions')
      .select('id, code, title, description, org_unit_id, is_active, created_at, created_by, updated_at, updated_by')
      .order('code', { ascending: true }),
    supabase
      .from('hrm_organization_units')
      .select('id, name'),
  ])

  if (positionsResult.error) {
    throw new Error(`Failed to fetch positions: ${positionsResult.error.message}`)
  }

  if (!positionsResult.data || positionsResult.data.length === 0) {
    return []
  }

  // Build lookup map for org unit names
  const orgUnitMap = new Map<string, string>()
  if (orgUnitsResult.data) {
    orgUnitsResult.data.forEach((ou) => orgUnitMap.set(ou.id, ou.name))
  }

  // Map results with derived orgUnitName
  return (positionsResult.data as HrmPositionRow[]).map((pos) => ({
    ...pos,
    orgUnitName: pos.org_unit_id ? orgUnitMap.get(pos.org_unit_id) ?? null : null,
  }))
}

/**
 * Fetch a single position by ID with org unit name lookup.
 * Returns null when:
 * - Position not found
 * - RLS denies access
 *
 * Throws only for genuine query errors.
 */
export async function fetchPositionDetail(
  positionId: string
): Promise<HrmPositionDetail | null> {
  // Parallel fetch: single position + org units for name lookup
  const [positionResult, orgUnitsResult] = await Promise.all([
    supabase
      .from('hrm_positions')
      .select('*')
      .eq('id', positionId)
      .maybeSingle(),
    supabase
      .from('hrm_organization_units')
      .select('id, name'),
  ])

  // Throw for genuine query errors
  if (positionResult.error) {
    throw new Error(`Failed to fetch position: ${positionResult.error.message}`)
  }

  // Return null if not found or RLS denied access
  if (!positionResult.data) {
    return null
  }

  const pos = positionResult.data as HrmPositionRow

  // Build lookup map (gracefully handle RLS blocking)
  const orgUnitMap = new Map<string, string>()
  if (!orgUnitsResult.error && orgUnitsResult.data) {
    orgUnitsResult.data.forEach((ou) => orgUnitMap.set(ou.id, ou.name))
  }

  return {
    ...pos,
    orgUnitName: pos.org_unit_id ? orgUnitMap.get(pos.org_unit_id) ?? null : null,
  }
}
