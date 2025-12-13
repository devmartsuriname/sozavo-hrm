/**
 * HRM Organization Unit Service
 * Fetches organization units with derived fields
 */

import { supabase } from '@/integrations/supabase/client'
import type { HrmOrgUnitDetail, HrmOrgUnitDirectory, HrmOrgUnitRow } from '@/types/hrm'

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

/**
 * Fetch a single organization unit by ID with parent name lookup.
 * Returns null when:
 * - Org unit not found
 * - RLS denies access
 *
 * Throws only for genuine query errors.
 */
export async function fetchOrgUnitDetail(orgUnitId: string): Promise<HrmOrgUnitDetail | null> {
  // Parallel fetch: single org unit + all org units for parent name lookup
  const [orgUnitResult, allOrgUnitsResult] = await Promise.all([
    supabase
      .from('hrm_organization_units')
      .select('id, code, name, description, parent_id, is_active, created_at, created_by, updated_at, updated_by')
      .eq('id', orgUnitId)
      .maybeSingle(),
    supabase
      .from('hrm_organization_units')
      .select('id, name'),
  ])

  if (orgUnitResult.error) {
    throw new Error(`Failed to fetch organization unit: ${orgUnitResult.error.message}`)
  }

  if (!orgUnitResult.data) {
    return null
  }

  // Build lookup map for parent name resolution
  const orgUnitMap = new Map<string, string>()
  if (allOrgUnitsResult.data) {
    allOrgUnitsResult.data.forEach((ou) => orgUnitMap.set(ou.id, ou.name))
  }

  const orgUnit = orgUnitResult.data as HrmOrgUnitRow

  return {
    ...orgUnit,
    parentOrgUnitName: orgUnit.parent_id ? orgUnitMap.get(orgUnit.parent_id) ?? null : null,
  }
}

/**
 * Update an organization unit by ID.
 * RLS enforces access: Admin/HR Manager full access, Manager scoped to own org unit.
 * 
 * @param orgUnitId - The UUID of the org unit to update
 * @param payload - The update payload (name, description, parent_id, is_active, updated_by)
 * @returns Updated org unit row or null if not found/access denied
 * @throws Error for genuine query errors
 */
export async function updateOrgUnit(
  orgUnitId: string,
  payload: {
    name: string
    description: string | null
    parent_id: string | null
    is_active: boolean
    updated_by: string | null
  }
): Promise<HrmOrgUnitRow | null> {
  const { data, error } = await supabase
    .from('hrm_organization_units')
    .update({
      name: payload.name,
      description: payload.description,
      parent_id: payload.parent_id,
      is_active: payload.is_active,
      updated_by: payload.updated_by,
    })
    .eq('id', orgUnitId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update organization unit: ${error.message}`)
  }

  return data as HrmOrgUnitRow
}
