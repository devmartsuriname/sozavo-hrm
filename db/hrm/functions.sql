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
-- All functions use SECURITY DEFINER and set search_path for security
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- has_role: Check if a user has a specific role
-- Parameters:
--   _user_id: The UUID of the user to check
--   _role: The role to check for (app_role enum)
-- Returns: TRUE if user has the role, FALSE otherwise (handles NULLs safely)
-- Usage: Used by all RLS policies for role-based access
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

COMMENT ON FUNCTION public.has_role(UUID, public.app_role) IS 
    'Check if a user has a specific role. SECURITY DEFINER to bypass RLS.';

-- -----------------------------------------------------------------------------
-- get_user_roles: Get all roles assigned to a user
-- Parameters:
--   _user_id: The UUID of the user
-- Returns: Array of role names as TEXT[], empty array if no roles
-- Usage: Useful for UI permission checks, debugging, and audits
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        ARRAY_AGG(role::TEXT),
        ARRAY[]::TEXT[]
    )
    FROM public.user_roles
    WHERE user_id = _user_id
$$;

COMMENT ON FUNCTION public.get_user_roles(UUID) IS 
    'Get all roles assigned to a user as TEXT array. SECURITY DEFINER to bypass RLS.';

-- -----------------------------------------------------------------------------
-- get_user_org_unit: Get the organization unit for a user
-- Parameters:
--   _user_id: The UUID of the user (auth.users.id)
-- Returns: UUID of the org_unit_id from hrm_employees, or NULL if not found
-- Usage: Used for org-unit scoped access policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_org_unit(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT org_unit_id
    FROM public.hrm_employees
    WHERE user_id = _user_id
    LIMIT 1
$$;

COMMENT ON FUNCTION public.get_user_org_unit(UUID) IS 
    'Get org_unit_id for a user via their employee record. SECURITY DEFINER to bypass RLS.';

-- -----------------------------------------------------------------------------
-- is_manager_of: Check if a user is the manager of a specific employee
-- Parameters:
--   _manager_user_id: The UUID of the potential manager (auth.users.id)
--   _employee_id: The UUID of the employee (hrm_employees.id)
-- Returns: TRUE if user is the manager, FALSE otherwise
-- Usage: Used for manager-level access policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_manager_of(_manager_user_id UUID, _employee_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.hrm_employees e
        INNER JOIN public.hrm_employees m ON e.manager_id = m.id
        WHERE e.id = _employee_id
          AND m.user_id = _manager_user_id
    )
$$;

COMMENT ON FUNCTION public.is_manager_of(UUID, UUID) IS 
    'Check if a user is the manager of a specific employee. SECURITY DEFINER to bypass RLS.';

-- -----------------------------------------------------------------------------
-- UTILITY FUNCTIONS
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- update_updated_at_column: Trigger function to auto-update updated_at
-- Returns: TRIGGER
-- Usage: Applied to all HRM tables with updated_at column
-- Note: Trigger creation will be done in a later step
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
    'Trigger function to automatically set updated_at to now() on UPDATE.';

-- =============================================================================
-- END OF FUNCTIONS
-- =============================================================================
