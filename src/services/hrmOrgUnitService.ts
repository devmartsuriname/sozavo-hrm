/**
 * HRM Organization Unit Service
 * Fetches organization units with derived fields
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmOrgUnitDirectory, HrmOrgUnitRow } from '@/types/hrm'

/**
 * Fetch all organization units with parent name lookup
 * Respects RLS - returns empty array if access denied
 */
export async function fetchOrgUnits(): Promise<HrmOrgUnitDirectory[]> {
  const { data, error } = await supabase
    .from('hrm_organization_units')
    .select('id, code, name, description, parent_id, is_active, created_at, created_by, updated_at, updated_by')
    .order('code', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch organization units: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  // Build lookup map for parent name resolution (self-join)
  const orgUnitMap = new Map<string, string>()
  ;(data as HrmOrgUnitRow[]).forEach((ou) => orgUnitMap.set(ou.id, ou.name))

  // Map results with derived parentOrgUnitName
  return (data as HrmOrgUnitRow[]).map((ou) => ({
    ...ou,
    parentOrgUnitName: ou.parent_id ? orgUnitMap.get(ou.parent_id) ?? null : null,
  }))
}
