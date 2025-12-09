-- =============================================================================
-- HRM TABLE DEFINITIONS
-- =============================================================================
-- Purpose: Define core HRM tables (structure only, no RLS policies).
-- Run Order: 2 (after enums.sql)
-- Dependencies: enums.sql must be run first
-- Note: RLS is NOT enabled here; see rls_policies.sql
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
-- END OF TABLE DEFINITIONS
-- =============================================================================
-- TODO: Indexes will be added in a later step
-- TODO: Triggers for updated_at will use update_updated_at_column() from functions.sql
-- =============================================================================
