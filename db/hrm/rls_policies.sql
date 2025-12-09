-- =============================================================================
-- HRM ROW-LEVEL SECURITY POLICIES
-- =============================================================================
-- Purpose: RLS policies for all HRM tables.
-- Run Order: 4 (after functions.sql)
-- Dependencies: All previous SQL files must be run first
-- Status: SCAFFOLDING ONLY - No active policies yet
-- =============================================================================

-- =============================================================================
-- USER ROLES (public.user_roles)
-- CRITICAL: This table controls all access - policies must be very restrictive
-- =============================================================================

-- admin
--   - Can view all user roles
--   - Can assign/remove roles

-- hr_manager
--   - Can view all user roles
--   - Cannot modify roles (admin only)

-- manager
--   - Can view roles of their team members only

-- employee
--   - Can view only their own role(s)

-- =============================================================================
-- ORGANIZATION UNITS (public.hrm_organization_units)
-- =============================================================================

-- admin
--   - Full CRUD access

-- hr_manager
--   - Full CRUD access

-- manager
--   - Read access to all org units
--   - No write access

-- employee
--   - Read access to all org units (needed for dropdowns, etc.)
--   - No write access

-- =============================================================================
-- POSITIONS (public.hrm_positions)
-- =============================================================================

-- admin
--   - Full CRUD access

-- hr_manager
--   - Full CRUD access

-- manager
--   - Read access to all positions
--   - No write access

-- employee
--   - Read access to all positions
--   - No write access

-- =============================================================================
-- EMPLOYEES (public.hrm_employees)
-- =============================================================================

-- admin
--   - Full CRUD access to all employees

-- hr_manager
--   - Full CRUD access to all employees

-- manager
--   - Read access to their direct reports
--   - Limited update access to their direct reports (non-sensitive fields)
--   - Read access to their own record

-- employee
--   - Read access to their own record only
--   - Limited update access to their own record (contact info only)

-- =============================================================================
-- FUTURE MODULES (to be added as tables are created)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- LEAVE REQUESTS (public.hrm_leave_requests)
-- -----------------------------------------------------------------------------
-- admin       - Full access
-- hr_manager  - Full access
-- manager     - CRUD for direct reports, read own
-- employee    - CRUD for own requests only

-- -----------------------------------------------------------------------------
-- ATTENDANCE (public.hrm_attendance)
-- -----------------------------------------------------------------------------
-- admin       - Full access
-- hr_manager  - Full access
-- manager     - Read for direct reports, read own
-- employee    - Read own only

-- -----------------------------------------------------------------------------
-- DOCUMENTS (public.hrm_documents)
-- -----------------------------------------------------------------------------
-- admin       - Full access
-- hr_manager  - Full access
-- manager     - Read for direct reports (non-sensitive)
-- employee    - Read/upload own only

-- -----------------------------------------------------------------------------
-- AUDIT LOGS (public.hrm_audit_logs)
-- -----------------------------------------------------------------------------
-- admin       - Read all (no delete/update)
-- hr_manager  - Read all (no delete/update)
-- manager     - No access
-- employee    - No access

-- =============================================================================
-- END OF RLS POLICY SCAFFOLDING
-- =============================================================================
-- NOTE: Actual policies will be implemented after functions.sql is complete
-- =============================================================================
