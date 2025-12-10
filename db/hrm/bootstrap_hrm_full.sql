-- =============================================================================
-- HRM BOOTSTRAP SCRIPT - COMPLETE SETUP
-- =============================================================================
-- Purpose: One-time initialization of the HRM database in Supabase.
-- Idempotent: YES - Safe to run multiple times.
-- Run: Copy entire contents into Supabase SQL Editor and execute once.
-- 
-- Contents:
--   Section 1: Enums (5 types)
--   Section 2: Tables (4 tables)
--   Section 3: Functions (12 security definer functions)
--   Section 4: RLS Policies (48 policies with DROP IF EXISTS for idempotency)
--   Section 5: Role Seeds (4 test user roles)
--   Section 6: HRM Test Data (3 org units, 4 positions, 4 employees)
--
-- Prerequisites:
--   - The 4 test users must exist in Supabase Auth:
--     admin@sozavo.sr, hr.manager@sozavo.sr, manager@sozavo.sr, employee@sozavo.sr
--
-- Author: SoZaVo HRM Team
-- Last Updated: 2025-01-09
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1: ENUMS
-- =============================================================================
-- Source: /db/hrm/enums.sql
-- Defines: app_role, employment_status, leave_status, attendance_status, document_type
-- =============================================================================

-- -----------------------------------------------------------------------------
-- app_role: User roles for RBAC
-- Used by: user_roles table
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'admin',        -- Full system access
            'hr_manager',   -- HR department management
            'manager',      -- Team/department manager
            'employee'      -- Regular employee (default)
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- employment_status: Employee employment state
-- Used by: hrm_employees table
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
        CREATE TYPE public.employment_status AS ENUM (
            'active',       -- Currently employed
            'inactive',     -- Temporarily inactive
            'on_leave',     -- On extended leave
            'terminated'    -- Employment ended
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- leave_status: Leave request status
-- Used by: hrm_leave_requests table (future)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE public.leave_status AS ENUM (
            'pending',      -- Awaiting approval
            'approved',     -- Approved by manager/HR
            'rejected',     -- Rejected
            'cancelled'     -- Cancelled by employee
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- attendance_status: Daily attendance state
-- Used by: hrm_attendance table (future)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE public.attendance_status AS ENUM (
            'present',      -- Present for work
            'absent',       -- Absent without leave
            'late',         -- Arrived late
            'half_day',     -- Half day attendance
            'on_leave'      -- On approved leave
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- document_type: Employee document classification
-- Used by: hrm_documents table (future)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE public.document_type AS ENUM (
            'contract',     -- Employment contract
            'id_document',  -- ID card, passport, etc.
            'certificate',  -- Certifications, diplomas
            'resume',       -- CV/Resume
            'other'         -- Other documents
        );
    END IF;
END
$$;


-- =============================================================================
-- SECTION 2: TABLES
-- =============================================================================
-- Source: /db/hrm/schema.sql
-- Creates: user_roles, hrm_organization_units, hrm_positions, hrm_employees
-- =============================================================================

-- -----------------------------------------------------------------------------
-- user_roles: RBAC role assignments
-- CRITICAL: Roles stored separately to prevent privilege escalation attacks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Each user can only have one instance of each role
    UNIQUE (user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'RBAC role assignments - CRITICAL security table';
COMMENT ON COLUMN public.user_roles.role IS 'User role from app_role enum';

-- -----------------------------------------------------------------------------
-- hrm_organization_units: Company org structure (departments, divisions, etc.)
-- Supports hierarchical structure via parent_id self-reference
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hrm_organization_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.hrm_organization_units(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Enforce lowercase codes for consistency
    CONSTRAINT chk_org_units_code_lowercase CHECK (code = LOWER(code))
);

COMMENT ON TABLE public.hrm_organization_units IS 'Organization hierarchy (departments, divisions, teams)';
COMMENT ON COLUMN public.hrm_organization_units.parent_id IS 'Self-reference for org hierarchy';
COMMENT ON COLUMN public.hrm_organization_units.code IS 'Unique code, must be lowercase';

-- -----------------------------------------------------------------------------
-- hrm_positions: Job positions/titles
-- Linked to organization units
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hrm_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    org_unit_id UUID REFERENCES public.hrm_organization_units(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Enforce lowercase codes for consistency
    CONSTRAINT chk_positions_code_lowercase CHECK (code = LOWER(code))
);

COMMENT ON TABLE public.hrm_positions IS 'Job positions/titles within the organization';
COMMENT ON COLUMN public.hrm_positions.org_unit_id IS 'Primary org unit for this position';
COMMENT ON COLUMN public.hrm_positions.code IS 'Unique code, must be lowercase';

-- -----------------------------------------------------------------------------
-- hrm_employees: Core employee records
-- Central table linking to positions, org units, and auth users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hrm_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Personal info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    
    -- Employment info
    position_id UUID REFERENCES public.hrm_positions(id),
    org_unit_id UUID REFERENCES public.hrm_organization_units(id),
    manager_id UUID REFERENCES public.hrm_employees(id) ON DELETE SET NULL,
    employment_status public.employment_status NOT NULL DEFAULT 'active',
    hire_date DATE,
    termination_date DATE,
    
    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.hrm_employees IS 'Core employee records';
COMMENT ON COLUMN public.hrm_employees.user_id IS 'Link to auth.users for login access';
COMMENT ON COLUMN public.hrm_employees.manager_id IS 'Self-reference for reporting hierarchy, SET NULL on delete';
COMMENT ON COLUMN public.hrm_employees.email IS 'Unique employee email address';


-- =============================================================================
-- SECTION 3: FUNCTIONS
-- =============================================================================
-- Source: /db/hrm/functions.sql
-- Creates: Security definer functions for RLS and helper utilities
-- =============================================================================

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
-- update_updated_at_column: Trigger function to auto-update updated_at
-- Returns: TRIGGER
-- Usage: Applied to all HRM tables with updated_at column
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
-- SECTION 4: RLS POLICIES
-- =============================================================================
-- Source: /db/hrm/rls_policies.sql
-- Creates: 48 RLS policies across 4 tables
-- Modified: Added DROP POLICY IF EXISTS before each CREATE for idempotency
-- =============================================================================

-- =============================================================================
-- TABLE 1: public.user_roles
-- =============================================================================

-- ENABLE RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SELECT Policies
DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_admin"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_select_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_select_hr_manager"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- INSERT Policies
DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_admin"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_insert_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_insert_hr_manager"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_insert_manager" ON public.user_roles;
CREATE POLICY "user_roles_insert_manager"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_insert_employee" ON public.user_roles;
CREATE POLICY "user_roles_insert_employee"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- UPDATE Policies
DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
CREATE POLICY "user_roles_update_admin"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_update_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_update_hr_manager"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_update_manager" ON public.user_roles;
CREATE POLICY "user_roles_update_manager"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_update_employee" ON public.user_roles;
CREATE POLICY "user_roles_update_employee"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- DELETE Policies
DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_admin"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_delete_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_delete_hr_manager"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "user_roles_delete_manager" ON public.user_roles;
CREATE POLICY "user_roles_delete_manager"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "user_roles_delete_employee" ON public.user_roles;
CREATE POLICY "user_roles_delete_employee"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- TABLE 2: public.hrm_organization_units
-- =============================================================================

-- ENABLE RLS
ALTER TABLE public.hrm_organization_units ENABLE ROW LEVEL SECURITY;

-- SELECT Policies
DROP POLICY IF EXISTS "org_units_select_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_admin"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_select_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_hr"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "org_units_select_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_manager"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "org_units_select_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_employee"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (FALSE);

-- INSERT Policies
DROP POLICY IF EXISTS "org_units_insert_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_admin"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_insert_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_hr"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "org_units_insert_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_manager"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "org_units_insert_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_employee"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- UPDATE Policies
DROP POLICY IF EXISTS "org_units_update_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_admin"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_update_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_hr"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "org_units_update_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_manager"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "org_units_update_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_employee"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- DELETE Policies
DROP POLICY IF EXISTS "org_units_delete_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_admin"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_delete_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_hr"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "org_units_delete_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_manager"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "org_units_delete_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_employee"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- TABLE 3: public.hrm_positions
-- =============================================================================

-- ENABLE RLS
ALTER TABLE public.hrm_positions ENABLE ROW LEVEL SECURITY;

-- SELECT Policies
DROP POLICY IF EXISTS "positions_select_admin" ON public.hrm_positions;
CREATE POLICY "positions_select_admin"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_select_hr" ON public.hrm_positions;
CREATE POLICY "positions_select_hr"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "positions_select_manager" ON public.hrm_positions;
CREATE POLICY "positions_select_manager"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "positions_select_employee" ON public.hrm_positions;
CREATE POLICY "positions_select_employee"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (FALSE);

-- INSERT Policies
DROP POLICY IF EXISTS "positions_insert_admin" ON public.hrm_positions;
CREATE POLICY "positions_insert_admin"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_insert_hr" ON public.hrm_positions;
CREATE POLICY "positions_insert_hr"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "positions_insert_manager" ON public.hrm_positions;
CREATE POLICY "positions_insert_manager"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "positions_insert_employee" ON public.hrm_positions;
CREATE POLICY "positions_insert_employee"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- UPDATE Policies
DROP POLICY IF EXISTS "positions_update_admin" ON public.hrm_positions;
CREATE POLICY "positions_update_admin"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_update_hr" ON public.hrm_positions;
CREATE POLICY "positions_update_hr"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "positions_update_manager" ON public.hrm_positions;
CREATE POLICY "positions_update_manager"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "positions_update_employee" ON public.hrm_positions;
CREATE POLICY "positions_update_employee"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- DELETE Policies
DROP POLICY IF EXISTS "positions_delete_admin" ON public.hrm_positions;
CREATE POLICY "positions_delete_admin"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_delete_hr" ON public.hrm_positions;
CREATE POLICY "positions_delete_hr"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "positions_delete_manager" ON public.hrm_positions;
CREATE POLICY "positions_delete_manager"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "positions_delete_employee" ON public.hrm_positions;
CREATE POLICY "positions_delete_employee"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- TABLE 4: public.hrm_employees
-- =============================================================================

-- ENABLE RLS
ALTER TABLE public.hrm_employees ENABLE ROW LEVEL SECURITY;

-- SELECT Policies
DROP POLICY IF EXISTS "hrm_employees_select_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_admin"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_select_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_hr_manager"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_select_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_manager"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (public.is_manager_of(auth.uid(), id));

DROP POLICY IF EXISTS "hrm_employees_select_own" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_own"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- INSERT Policies
DROP POLICY IF EXISTS "hrm_employees_insert_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_admin"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_insert_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_hr_manager"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_insert_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_manager"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "hrm_employees_insert_employee" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_employee"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- UPDATE Policies
DROP POLICY IF EXISTS "hrm_employees_update_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_admin"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_update_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_hr_manager"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_update_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_manager"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

DROP POLICY IF EXISTS "hrm_employees_update_employee" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_employee"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- DELETE Policies
DROP POLICY IF EXISTS "hrm_employees_delete_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_admin"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_delete_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_hr_manager"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "hrm_employees_delete_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_manager"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (FALSE);

DROP POLICY IF EXISTS "hrm_employees_delete_employee" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_employee"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- SECTION 5: ROLE SEEDS
-- =============================================================================
-- Source: /db/hrm/seed_roles.sql
-- Seeds: 4 role assignments for test users
-- =============================================================================

-- ADMIN ROLE ASSIGNMENT
INSERT INTO public.user_roles (user_id, role)
SELECT '185e5b0b-2d3c-4245-a0e3-8c07623c8ad4'::UUID, 'admin'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '185e5b0b-2d3c-4245-a0e3-8c07623c8ad4'::UUID 
      AND role = 'admin'::public.app_role
);

-- HR MANAGER ROLE ASSIGNMENT
INSERT INTO public.user_roles (user_id, role)
SELECT '4231ee5a-2bc8-47b0-93a0-c9fd172c24e3'::UUID, 'hr_manager'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '4231ee5a-2bc8-47b0-93a0-c9fd172c24e3'::UUID 
      AND role = 'hr_manager'::public.app_role
);

-- MANAGER ROLE ASSIGNMENT
INSERT INTO public.user_roles (user_id, role)
SELECT 'a6bffd30-455c-491e-87cf-7a41d5f4fffe'::UUID, 'manager'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = 'a6bffd30-455c-491e-87cf-7a41d5f4fffe'::UUID 
      AND role = 'manager'::public.app_role
);

-- EMPLOYEE ROLE ASSIGNMENT
INSERT INTO public.user_roles (user_id, role)
SELECT '8628fd46-b774-4b5f-91fc-3a8e1ba56d9a'::UUID, 'employee'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '8628fd46-b774-4b5f-91fc-3a8e1ba56d9a'::UUID 
      AND role = 'employee'::public.app_role
);


-- =============================================================================
-- SECTION 6: HRM TEST DATA
-- =============================================================================
-- Source: /db/hrm/seed_hrm_test_data.sql
-- Seeds: 3 org units, 4 positions, 4 employees
-- =============================================================================

-- ORGANIZATION UNITS

-- Root Organization Unit: SoZaVo HQ
INSERT INTO public.hrm_organization_units (id, code, name, parent_id)
SELECT 
    gen_random_uuid(),
    'sozavo_hq',
    'SoZaVo Hoofdkantoor',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_organization_units WHERE code = 'sozavo_hq'
);

-- HR Department (child of HQ)
INSERT INTO public.hrm_organization_units (id, code, name, parent_id)
SELECT 
    gen_random_uuid(),
    'sozavo_hr',
    'Afdeling Human Resources',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hq')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_organization_units WHERE code = 'sozavo_hr'
);

-- Volkshuisvesting Department (child of HQ)
INSERT INTO public.hrm_organization_units (id, code, name, parent_id)
SELECT 
    gen_random_uuid(),
    'sozavo_volkshuisvesting',
    'Afdeling Volkshuisvesting',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hq')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting'
);

-- POSITIONS

-- HR Director (Admin-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'hr_director',
    'Directeur Human Resources',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'hr_director'
);

-- HR Officer (HR Manager-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'hr_officer',
    'HR Medewerker',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'hr_officer'
);

-- Department Manager Volkshuisvesting (Manager-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'dept_manager_volkshuisvesting',
    'Afdelingshoofd Volkshuisvesting',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'dept_manager_volkshuisvesting'
);

-- Staff Member (Employee-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'staff_volkshuisvesting',
    'Medewerker Volkshuisvesting',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'staff_volkshuisvesting'
);

-- EMPLOYEES

-- Admin Employee (HR Director)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-ADMIN-001',
    '185e5b0b-2d3c-4245-a0e3-8c07623c8ad4'::UUID,
    'Karel',
    'Adminstra',
    'admin@sozavo.sr',
    '+597 8001001',
    (SELECT id FROM public.hrm_positions WHERE code = 'hr_director'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr'),
    NULL,
    'active'::public.employment_status,
    '2020-01-15'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-ADMIN-001'
);

-- HR Manager Employee (HR Officer)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-HR-001',
    '4231ee5a-2bc8-47b0-93a0-c9fd172c24e3'::UUID,
    'Sandra',
    'Personeelszaken',
    'hr.manager@sozavo.sr',
    '+597 8001002',
    (SELECT id FROM public.hrm_positions WHERE code = 'hr_officer'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr'),
    (SELECT id FROM public.hrm_employees WHERE employee_code = 'EMP-ADMIN-001'),
    'active'::public.employment_status,
    '2021-03-01'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-HR-001'
);

-- Manager Employee (Department Manager Volkshuisvesting)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-MANAGER-001',
    'a6bffd30-455c-491e-87cf-7a41d5f4fffe'::UUID,
    'Ricardo',
    'Leidinggevende',
    'manager@sozavo.sr',
    '+597 8001003',
    (SELECT id FROM public.hrm_positions WHERE code = 'dept_manager_volkshuisvesting'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting'),
    NULL,
    'active'::public.employment_status,
    '2019-06-01'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-MANAGER-001'
);

-- Employee (Staff Member Volkshuisvesting)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-EMP-001',
    '8628fd46-b774-4b5f-91fc-3a8e1ba56d9a'::UUID,
    'Maria',
    'Werknemer',
    'employee@sozavo.sr',
    '+597 8001004',
    (SELECT id FROM public.hrm_positions WHERE code = 'staff_volkshuisvesting'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting'),
    (SELECT id FROM public.hrm_employees WHERE employee_code = 'EMP-MANAGER-001'),
    'active'::public.employment_status,
    '2022-09-15'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-EMP-001'
);


COMMIT;

-- =============================================================================
-- END OF BOOTSTRAP SCRIPT
-- =============================================================================
-- After running this script, verify with:
--   SELECT table_name FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name IN ('user_roles','hrm_employees','hrm_positions','hrm_organization_units');
-- =============================================================================
