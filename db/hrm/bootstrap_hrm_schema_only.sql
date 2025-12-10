-- =============================================================================
-- HRM BOOTSTRAP SCRIPT - SCHEMA ONLY (NO SEED DATA)
-- =============================================================================
-- Purpose: Initialize HRM database structure without test data.
-- Idempotent: YES - Safe to run multiple times.
-- Run: Copy entire contents into Supabase SQL Editor and execute once.
-- 
-- Contents:
--   Section 1: Enums (5 types)
--   Section 2: Tables (4 tables)
--   Section 3: Functions (12 security definer functions)
--   Section 4: RLS Policies (48 policies with DROP IF EXISTS for idempotency)
--
-- Use this script for production environments where you don't want test data.
--
-- Author: SoZaVo HRM Team
-- Last Updated: 2025-01-09
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1: ENUMS
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'admin',
            'hr_manager',
            'manager',
            'employee'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
        CREATE TYPE public.employment_status AS ENUM (
            'active',
            'inactive',
            'on_leave',
            'terminated'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE public.leave_status AS ENUM (
            'pending',
            'approved',
            'rejected',
            'cancelled'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE public.attendance_status AS ENUM (
            'present',
            'absent',
            'late',
            'half_day',
            'on_leave'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE public.document_type AS ENUM (
            'contract',
            'id_document',
            'certificate',
            'resume',
            'other'
        );
    END IF;
END
$$;


-- =============================================================================
-- SECTION 2: TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

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
    CONSTRAINT chk_org_units_code_lowercase CHECK (code = LOWER(code))
);

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
    CONSTRAINT chk_positions_code_lowercase CHECK (code = LOWER(code))
);

CREATE TABLE IF NOT EXISTS public.hrm_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    position_id UUID REFERENCES public.hrm_positions(id),
    org_unit_id UUID REFERENCES public.hrm_organization_units(id),
    manager_id UUID REFERENCES public.hrm_employees(id) ON DELETE SET NULL,
    employment_status public.employment_status NOT NULL DEFAULT 'active',
    hire_date DATE,
    termination_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);


-- =============================================================================
-- SECTION 3: FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.uid()
$$;

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

CREATE OR REPLACE FUNCTION public.user_is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.user_is_hr_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'hr_manager'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.user_is_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'manager'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.user_is_employee(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'employee'::public.app_role)
$$;

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

CREATE OR REPLACE FUNCTION public.get_manager_chain(_employee_user_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH RECURSIVE manager_hierarchy AS (
        SELECT 
            m.id AS manager_employee_id,
            m.user_id AS manager_user_id,
            1 AS depth
        FROM public.hrm_employees e
        INNER JOIN public.hrm_employees m ON e.manager_id = m.id
        WHERE e.user_id = _employee_user_id
        
        UNION ALL
        
        SELECT 
            m.id AS manager_employee_id,
            m.user_id AS manager_user_id,
            mh.depth + 1 AS depth
        FROM manager_hierarchy mh
        INNER JOIN public.hrm_employees e ON e.id = mh.manager_employee_id
        INNER JOIN public.hrm_employees m ON e.manager_id = m.id
        WHERE mh.depth < 10
    )
    SELECT COALESCE(
        ARRAY_AGG(manager_user_id ORDER BY depth),
        ARRAY[]::UUID[]
    )
    FROM manager_hierarchy
$$;

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


-- =============================================================================
-- SECTION 4: RLS POLICIES
-- =============================================================================

-- TABLE 1: user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_admin" ON public.user_roles FOR SELECT TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_select_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_select_hr_manager" ON public.user_roles FOR SELECT TO authenticated USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_admin" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_insert_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_insert_hr_manager" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_insert_manager" ON public.user_roles;
CREATE POLICY "user_roles_insert_manager" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_insert_employee" ON public.user_roles;
CREATE POLICY "user_roles_insert_employee" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
CREATE POLICY "user_roles_update_admin" ON public.user_roles FOR UPDATE TO authenticated USING (public.user_is_admin(auth.uid())) WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_update_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_update_hr_manager" ON public.user_roles FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_update_manager" ON public.user_roles;
CREATE POLICY "user_roles_update_manager" ON public.user_roles FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_update_employee" ON public.user_roles;
CREATE POLICY "user_roles_update_employee" ON public.user_roles FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_admin" ON public.user_roles FOR DELETE TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_delete_hr_manager" ON public.user_roles;
CREATE POLICY "user_roles_delete_hr_manager" ON public.user_roles FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "user_roles_delete_manager" ON public.user_roles;
CREATE POLICY "user_roles_delete_manager" ON public.user_roles FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "user_roles_delete_employee" ON public.user_roles;
CREATE POLICY "user_roles_delete_employee" ON public.user_roles FOR DELETE TO authenticated USING (FALSE);

-- TABLE 2: hrm_organization_units
ALTER TABLE public.hrm_organization_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_units_select_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_admin" ON public.hrm_organization_units FOR SELECT TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_select_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_hr" ON public.hrm_organization_units FOR SELECT TO authenticated USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "org_units_select_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_manager" ON public.hrm_organization_units FOR SELECT TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "org_units_select_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_select_employee" ON public.hrm_organization_units FOR SELECT TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "org_units_insert_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_admin" ON public.hrm_organization_units FOR INSERT TO authenticated WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_insert_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_hr" ON public.hrm_organization_units FOR INSERT TO authenticated WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "org_units_insert_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_manager" ON public.hrm_organization_units FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "org_units_insert_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_insert_employee" ON public.hrm_organization_units FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "org_units_update_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_admin" ON public.hrm_organization_units FOR UPDATE TO authenticated USING (public.user_is_admin(auth.uid())) WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_update_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_hr" ON public.hrm_organization_units FOR UPDATE TO authenticated USING (public.user_is_hr_manager(auth.uid())) WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "org_units_update_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_manager" ON public.hrm_organization_units FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "org_units_update_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_update_employee" ON public.hrm_organization_units FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "org_units_delete_admin" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_admin" ON public.hrm_organization_units FOR DELETE TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "org_units_delete_hr" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_hr" ON public.hrm_organization_units FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "org_units_delete_manager" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_manager" ON public.hrm_organization_units FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "org_units_delete_employee" ON public.hrm_organization_units;
CREATE POLICY "org_units_delete_employee" ON public.hrm_organization_units FOR DELETE TO authenticated USING (FALSE);

-- TABLE 3: hrm_positions
ALTER TABLE public.hrm_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "positions_select_admin" ON public.hrm_positions;
CREATE POLICY "positions_select_admin" ON public.hrm_positions FOR SELECT TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_select_hr" ON public.hrm_positions;
CREATE POLICY "positions_select_hr" ON public.hrm_positions FOR SELECT TO authenticated USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "positions_select_manager" ON public.hrm_positions;
CREATE POLICY "positions_select_manager" ON public.hrm_positions FOR SELECT TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "positions_select_employee" ON public.hrm_positions;
CREATE POLICY "positions_select_employee" ON public.hrm_positions FOR SELECT TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "positions_insert_admin" ON public.hrm_positions;
CREATE POLICY "positions_insert_admin" ON public.hrm_positions FOR INSERT TO authenticated WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_insert_hr" ON public.hrm_positions;
CREATE POLICY "positions_insert_hr" ON public.hrm_positions FOR INSERT TO authenticated WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "positions_insert_manager" ON public.hrm_positions;
CREATE POLICY "positions_insert_manager" ON public.hrm_positions FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "positions_insert_employee" ON public.hrm_positions;
CREATE POLICY "positions_insert_employee" ON public.hrm_positions FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "positions_update_admin" ON public.hrm_positions;
CREATE POLICY "positions_update_admin" ON public.hrm_positions FOR UPDATE TO authenticated USING (public.user_is_admin(auth.uid())) WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_update_hr" ON public.hrm_positions;
CREATE POLICY "positions_update_hr" ON public.hrm_positions FOR UPDATE TO authenticated USING (public.user_is_hr_manager(auth.uid())) WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "positions_update_manager" ON public.hrm_positions;
CREATE POLICY "positions_update_manager" ON public.hrm_positions FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "positions_update_employee" ON public.hrm_positions;
CREATE POLICY "positions_update_employee" ON public.hrm_positions FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "positions_delete_admin" ON public.hrm_positions;
CREATE POLICY "positions_delete_admin" ON public.hrm_positions FOR DELETE TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "positions_delete_hr" ON public.hrm_positions;
CREATE POLICY "positions_delete_hr" ON public.hrm_positions FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "positions_delete_manager" ON public.hrm_positions;
CREATE POLICY "positions_delete_manager" ON public.hrm_positions FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "positions_delete_employee" ON public.hrm_positions;
CREATE POLICY "positions_delete_employee" ON public.hrm_positions FOR DELETE TO authenticated USING (FALSE);

-- TABLE 4: hrm_employees
ALTER TABLE public.hrm_employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hrm_employees_select_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_admin" ON public.hrm_employees FOR SELECT TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_select_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_hr_manager" ON public.hrm_employees FOR SELECT TO authenticated USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_select_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_manager" ON public.hrm_employees FOR SELECT TO authenticated USING (public.is_manager_of(auth.uid(), id));

DROP POLICY IF EXISTS "hrm_employees_select_own" ON public.hrm_employees;
CREATE POLICY "hrm_employees_select_own" ON public.hrm_employees FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "hrm_employees_insert_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_admin" ON public.hrm_employees FOR INSERT TO authenticated WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_insert_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_hr_manager" ON public.hrm_employees FOR INSERT TO authenticated WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_insert_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_manager" ON public.hrm_employees FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "hrm_employees_insert_employee" ON public.hrm_employees;
CREATE POLICY "hrm_employees_insert_employee" ON public.hrm_employees FOR INSERT TO authenticated WITH CHECK (FALSE);

DROP POLICY IF EXISTS "hrm_employees_update_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_admin" ON public.hrm_employees FOR UPDATE TO authenticated USING (public.user_is_admin(auth.uid())) WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_update_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_hr_manager" ON public.hrm_employees FOR UPDATE TO authenticated USING (public.user_is_hr_manager(auth.uid())) WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_update_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_manager" ON public.hrm_employees FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "hrm_employees_update_employee" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_employee" ON public.hrm_employees FOR UPDATE TO authenticated USING (FALSE) WITH CHECK (FALSE);

DROP POLICY IF EXISTS "hrm_employees_delete_admin" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_admin" ON public.hrm_employees FOR DELETE TO authenticated USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "hrm_employees_delete_hr_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_hr_manager" ON public.hrm_employees FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "hrm_employees_delete_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_manager" ON public.hrm_employees FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "hrm_employees_delete_employee" ON public.hrm_employees;
CREATE POLICY "hrm_employees_delete_employee" ON public.hrm_employees FOR DELETE TO authenticated USING (FALSE);


COMMIT;

-- =============================================================================
-- END OF SCHEMA-ONLY BOOTSTRAP SCRIPT
-- =============================================================================
