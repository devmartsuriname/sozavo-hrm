-- =============================================================================
-- HRM DATABASE FUNCTIONS
-- =============================================================================
-- Purpose: Security definer functions for RLS and helper utilities.
-- Run Order: 3 (after schema.sql)
-- Dependencies: enums.sql, schema.sql must be run first
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CORE AUTHENTICATION WRAPPER
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- get_current_user_id: Wrapper function for auth.uid()
-- Returns: Current authenticated user's UUID, or NULL if not authenticated
-- Usage: Consistency wrapper for all RLS policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.uid()
$$;

COMMENT ON FUNCTION public.get_current_user_id() IS 
    'Wrapper for auth.uid() providing consistent access to current user ID.';

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
-- ROLE CONVENIENCE WRAPPERS
-- These functions wrap has_role() for cleaner policy definitions
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- user_is_admin: Check if a user has the admin role
-- Parameters:
--   _user_id: The UUID of the user to check
-- Returns: TRUE if user is admin, FALSE otherwise
-- Usage: Convenience wrapper for RLS policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin'::public.app_role)
$$;

COMMENT ON FUNCTION public.user_is_admin(UUID) IS 
    'Check if a user has the admin role. Wrapper for has_role().';

-- -----------------------------------------------------------------------------
-- user_is_hr_manager: Check if a user has the hr_manager role
-- Parameters:
--   _user_id: The UUID of the user to check
-- Returns: TRUE if user is HR manager, FALSE otherwise
-- Usage: Convenience wrapper for RLS policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_is_hr_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'hr_manager'::public.app_role)
$$;

COMMENT ON FUNCTION public.user_is_hr_manager(UUID) IS 
    'Check if a user has the hr_manager role. Wrapper for has_role().';

-- -----------------------------------------------------------------------------
-- user_is_manager: Check if a user has the manager role
-- Parameters:
--   _user_id: The UUID of the user to check
-- Returns: TRUE if user is manager, FALSE otherwise
-- Usage: Convenience wrapper for RLS policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_is_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'manager'::public.app_role)
$$;

COMMENT ON FUNCTION public.user_is_manager(UUID) IS 
    'Check if a user has the manager role. Wrapper for has_role().';

-- -----------------------------------------------------------------------------
-- user_is_employee: Check if a user has the employee role
-- Parameters:
--   _user_id: The UUID of the user to check
-- Returns: TRUE if user is employee, FALSE otherwise
-- Usage: Convenience wrapper for RLS policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_is_employee(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'employee'::public.app_role)
$$;

COMMENT ON FUNCTION public.user_is_employee(UUID) IS 
    'Check if a user has the employee role. Wrapper for has_role().';

-- -----------------------------------------------------------------------------
-- ORGANIZATIONAL LOOKUP FUNCTIONS
-- -----------------------------------------------------------------------------

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
-- get_employee_record: Get the full employee record for a user
-- Parameters:
--   _user_id: The UUID of the user (auth.users.id)
-- Returns: SETOF hrm_employees (0 or 1 row) for debugging & policy evaluation
-- Usage: Used for debugging and complex policy evaluation
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_employee_record(_user_id UUID)
RETURNS SETOF public.hrm_employees
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT *
    FROM public.hrm_employees
    WHERE user_id = _user_id
    LIMIT 1
$$;

COMMENT ON FUNCTION public.get_employee_record(UUID) IS 
    'Get full employee record for a user. Returns empty set if not found. SECURITY DEFINER to bypass RLS.';

-- -----------------------------------------------------------------------------
-- get_manager_chain: Get array of manager UUIDs up the hierarchy
-- Parameters:
--   _employee_user_id: The UUID of the employee (auth.users.id)
-- Returns: UUID[] array of manager user_ids from immediate manager up to root
-- Usage: Used for advanced hierarchical RLS rules
-- Note: Uses recursive CTE to walk the manager_id chain
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_manager_chain(_employee_user_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH RECURSIVE manager_hierarchy AS (
        -- Base case: Get the employee's direct manager
        SELECT 
            m.id AS manager_employee_id,
            m.user_id AS manager_user_id,
            1 AS depth
        FROM public.hrm_employees e
        INNER JOIN public.hrm_employees m ON e.manager_id = m.id
        WHERE e.user_id = _employee_user_id
        
        UNION ALL
        
        -- Recursive case: Get each manager's manager
        SELECT 
            m.id AS manager_employee_id,
            m.user_id AS manager_user_id,
            mh.depth + 1 AS depth
        FROM manager_hierarchy mh
        INNER JOIN public.hrm_employees e ON e.id = mh.manager_employee_id
        INNER JOIN public.hrm_employees m ON e.manager_id = m.id
        WHERE mh.depth < 10  -- Prevent infinite loops, max 10 levels
    )
    SELECT COALESCE(
        ARRAY_AGG(manager_user_id ORDER BY depth),
        ARRAY[]::UUID[]
    )
    FROM manager_hierarchy
$$;

COMMENT ON FUNCTION public.get_manager_chain(UUID) IS 
    'Get array of manager user_ids up the hierarchy. Returns empty array if no managers. Max 10 levels. SECURITY DEFINER to bypass RLS.';

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
