/**
 * HRM Module TypeScript Types
 * Row/ViewModel Pattern: Row types match DB schema, ViewModels add derived fields
 */

// =============================================================================
// ROW TYPES (match database schema exactly)
// =============================================================================

/**
 * Base employee row type - matches hrm_employees table
 */
export interface HrmEmployeeRow {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  org_unit_id: string | null
  position_id: string | null
  manager_id: string | null
  employment_status: string
  hire_date: string | null
  termination_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// =============================================================================
// VIEW MODEL TYPES (Row + derived display fields)
// =============================================================================

/**
 * Employee Directory ViewModel - for table listing
 * Extends row with derived display fields
 */
export interface HrmEmployeeDirectory extends HrmEmployeeRow {
  fullName: string           // Derived: first_name + ' ' + last_name
  orgUnitName: string | null // Lookup from hrm_organization_units.name
  positionTitle: string | null // Lookup from hrm_positions.title
  managerName: string | null   // Lookup from hrm_employees (manager_id → fullName)
}

/**
 * Employee Detail ViewModel - for single employee profile view
 * Uses same derived fields as directory
 */
export interface HrmEmployeeDetail extends HrmEmployeeRow {
  fullName: string
  orgUnitName: string | null
  positionTitle: string | null
  managerName: string | null
}

// =============================================================================
// QUERY RESULT TYPES (for service layer)
// =============================================================================

/**
 * Query result for directory (minimal columns)
 */
export type HrmEmployeeDirectoryQuery = Pick<
  HrmEmployeeRow,
  | 'id'
  | 'employee_code'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'org_unit_id'
  | 'position_id'
  | 'manager_id'
  | 'employment_status'
>

/**
 * Query result for detail (all columns)
 */
export type HrmEmployeeDetailQuery = HrmEmployeeRow

// =============================================================================
// ORGANIZATION UNIT TYPES
// =============================================================================

/**
 * Organization Unit row type - matches hrm_organization_units table
 */
export interface HrmOrgUnitRow {
  id: string
  code: string
  name: string
  description: string | null
  parent_id: string | null
  is_active: boolean
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

/**
 * Organization Unit Directory ViewModel - for table listing
 * Extends row with derived display fields
 */
export interface HrmOrgUnitDirectory extends HrmOrgUnitRow {
  parentOrgUnitName: string | null  // Lookup from parent_id → name
}

// =============================================================================
// POSITION TYPES
// =============================================================================

/**
 * Position row type - matches hrm_positions table
 */
export interface HrmPositionRow {
  id: string
  code: string
  title: string
  description: string | null
  org_unit_id: string | null
  is_active: boolean
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

/**
 * Position Directory ViewModel - for table listing
 * Extends row with derived display fields
 */
export interface HrmPositionDirectory extends HrmPositionRow {
  orgUnitName: string | null  // Lookup from org_unit_id → hrm_organization_units.name
}
