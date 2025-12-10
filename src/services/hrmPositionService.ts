/**
 * HRM Position Service
 * Fetches positions with derived fields using parallel-fetch + Map pattern
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmPositionDirectory, HrmPositionRow } from '@/types/hrm'

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
