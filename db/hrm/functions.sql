-- =============================================================================
-- HRM DATABASE FUNCTIONS
-- =============================================================================
-- Purpose: Security definer functions for RLS and helper utilities.
-- Run Order: 3 (after schema.sql)
-- Dependencies: enums.sql, schema.sql must be run first
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECURITY DEFINER FUNCTIONS FOR RLS
-- These functions bypass RLS to prevent infinite recursion in policies
-- -----------------------------------------------------------------------------

-- TODO: Implement in next Phase 1 step
-- 
-- has_role(_user_id UUID, _role app_role) -> BOOLEAN
--   Check if a user has a specific role
--   Used by all RLS policies for role-based access
--
-- get_user_org_unit(_user_id UUID) -> UUID
--   Get the org unit ID for a user (via their employee record)
--   Used for org-unit scoped access policies
--
-- is_manager_of(_manager_user_id UUID, _employee_id UUID) -> BOOLEAN
--   Check if a user is the manager of a specific employee
--   Used for manager-level access policies

-- -----------------------------------------------------------------------------
-- UTILITY FUNCTIONS
-- -----------------------------------------------------------------------------

-- TODO: Implement in next Phase 1 step
--
-- update_updated_at_column() -> TRIGGER
--   Automatically set updated_at to now() on UPDATE
--   Applied to all HRM tables with updated_at column

-- =============================================================================
-- END OF FUNCTIONS
-- =============================================================================
