-- =============================================================================
-- HRM ROW-LEVEL SECURITY POLICIES
-- =============================================================================
-- Purpose: Define granular access control for all HRM tables.
-- Run Order: 4 (after functions.sql)
-- Dependencies: enums.sql, schema.sql, functions.sql must be run first
-- Status: PHASE 1 STEP 5C - ALL WRITE policies ACTIVE for all 4 tables
-- =============================================================================

-- =============================================================================
-- STEP 5C ACTIVATION STATUS:
-- ✅ user_roles: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE ACTIVE
-- ✅ hrm_employees: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE ACTIVE
-- ✅ hrm_organization_units: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE ACTIVE
-- ✅ hrm_positions: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE ACTIVE
-- =============================================================================

-- =============================================================================
-- TABLE 1: public.user_roles
-- =============================================================================
-- Description: Stores Role-Based Access Control (RBAC) assignments.
-- Sensitivity: HIGH - Controls all system permissions.
-- Security Model: Admin/HR read access, users can see own roles only.
-- Status: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE policies ACTIVE (Step 5C)
-- =============================================================================

-- STEP 4: ENABLE RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for user_roles (ACTIVE - Step 4)
-- -----------------------------------------------------------------------------

-- Policy: user_roles_select_admin
-- Description: Admins can view all role assignments
-- Role: admin
CREATE POLICY "user_roles_select_admin"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: user_roles_select_hr_manager
-- Description: HR managers can view all role assignments for HR purposes
-- Role: hr_manager
CREATE POLICY "user_roles_select_hr_manager"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

-- Policy: user_roles_select_own
-- Description: All authenticated users can view their own roles
-- Role: all authenticated
CREATE POLICY "user_roles_select_own"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- INSERT Policies for user_roles (ACTIVE - Step 5C)
-- -----------------------------------------------------------------------------

-- Policy: user_roles_insert_admin
-- Description: Only admins can assign roles
-- Role: admin
CREATE POLICY "user_roles_insert_admin"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: user_roles_insert_hr_manager
-- Description: HR managers cannot assign roles
-- Role: hr_manager
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_insert_hr_manager"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- Policy: user_roles_insert_manager
-- Description: Managers cannot assign roles
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_insert_manager"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- Policy: user_roles_insert_employee
-- Description: Employees cannot assign roles
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_insert_employee"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- UPDATE Policies for user_roles (ACTIVE - Step 5C)
-- -----------------------------------------------------------------------------

-- Policy: user_roles_update_admin
-- Description: Only admins can modify role assignments
-- Role: admin
CREATE POLICY "user_roles_update_admin"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: user_roles_update_hr_manager
-- Description: HR managers cannot modify role assignments
-- Role: hr_manager
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_update_hr_manager"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy: user_roles_update_manager
-- Description: Managers cannot modify role assignments
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_update_manager"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy: user_roles_update_employee
-- Description: Employees cannot modify role assignments
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_update_employee"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- DELETE Policies for user_roles (ACTIVE - Step 5C)
-- -----------------------------------------------------------------------------

-- Policy: user_roles_delete_admin
-- Description: Only admins can remove role assignments
-- Role: admin
CREATE POLICY "user_roles_delete_admin"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: user_roles_delete_hr_manager
-- Description: HR managers cannot remove role assignments
-- Role: hr_manager
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_delete_hr_manager"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: user_roles_delete_manager
-- Description: Managers cannot remove role assignments
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_delete_manager"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: user_roles_delete_employee
-- Description: Employees cannot remove role assignments
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "user_roles_delete_employee"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- TABLE 2: public.hrm_organization_units
-- =============================================================================
-- Description: Stores organizational hierarchy (departments, divisions).
-- Sensitivity: MEDIUM - Organizational structure is restricted.
-- Security Model: Admin/HR full access, managers/employees no access.
-- Status: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE policies ACTIVE (Step 5B)
-- =============================================================================

-- STEP 5A: ENABLE RLS
ALTER TABLE public.hrm_organization_units ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for hrm_organization_units (ACTIVE - Step 5A)
-- -----------------------------------------------------------------------------

-- Policy: org_units_select_admin
-- Description: Admins can view all organization units
-- Role: admin
CREATE POLICY "org_units_select_admin"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: org_units_select_hr
-- Description: HR managers can view all organization units
-- Role: hr_manager
CREATE POLICY "org_units_select_hr"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

-- Policy: org_units_select_manager
-- Description: Managers cannot view organization units
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "org_units_select_manager"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (FALSE);

-- Policy: org_units_select_employee
-- Description: Employees cannot view organization units
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "org_units_select_employee"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (FALSE);

-- -----------------------------------------------------------------------------
-- INSERT Policies for hrm_organization_units (ACTIVE - Step 5B)
-- -----------------------------------------------------------------------------

-- Policy: org_units_insert_admin
-- Description: Admins can create organization units
-- Role: admin
CREATE POLICY "org_units_insert_admin"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: org_units_insert_hr
-- Description: HR managers can create organization units
-- Role: hr_manager
CREATE POLICY "org_units_insert_hr"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: org_units_insert_manager
-- Description: Managers cannot create organization units
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "org_units_insert_manager"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- Policy: org_units_insert_employee
-- Description: Employees cannot create organization units
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "org_units_insert_employee"
    ON public.hrm_organization_units
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- UPDATE Policies for hrm_organization_units (ACTIVE - Step 5B)
-- -----------------------------------------------------------------------------

-- Policy: org_units_update_admin
-- Description: Admins can modify organization units
-- Role: admin
CREATE POLICY "org_units_update_admin"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: org_units_update_hr
-- Description: HR managers can modify organization units
-- Role: hr_manager
CREATE POLICY "org_units_update_hr"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: org_units_update_manager
-- Description: Managers cannot modify organization units
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "org_units_update_manager"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy: org_units_update_employee
-- Description: Employees cannot modify organization units
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "org_units_update_employee"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- DELETE Policies for hrm_organization_units (ACTIVE - Step 5B)
-- -----------------------------------------------------------------------------

-- Policy: org_units_delete_admin
-- Description: Only admins can delete organization units
-- Role: admin
CREATE POLICY "org_units_delete_admin"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: org_units_delete_hr
-- Description: HR managers cannot delete organization units
-- Role: hr_manager
-- Rule: FALSE (no access)
CREATE POLICY "org_units_delete_hr"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: org_units_delete_manager
-- Description: Managers cannot delete organization units
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "org_units_delete_manager"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: org_units_delete_employee
-- Description: Employees cannot delete organization units
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "org_units_delete_employee"
    ON public.hrm_organization_units
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- TABLE 3: public.hrm_positions
-- =============================================================================
-- Description: Stores job positions and titles.
-- Sensitivity: MEDIUM - Position information is restricted.
-- Security Model: Admin/HR full access, managers/employees no access.
-- Status: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE policies ACTIVE (Step 5B)
-- =============================================================================

-- STEP 5A: ENABLE RLS
ALTER TABLE public.hrm_positions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for hrm_positions (ACTIVE - Step 5A)
-- -----------------------------------------------------------------------------

-- Policy: positions_select_admin
-- Description: Admins can view all positions
-- Role: admin
CREATE POLICY "positions_select_admin"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: positions_select_hr
-- Description: HR managers can view all positions
-- Role: hr_manager
CREATE POLICY "positions_select_hr"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

-- Policy: positions_select_manager
-- Description: Managers cannot view positions
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "positions_select_manager"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (FALSE);

-- Policy: positions_select_employee
-- Description: Employees cannot view positions
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "positions_select_employee"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (FALSE);

-- -----------------------------------------------------------------------------
-- INSERT Policies for hrm_positions (ACTIVE - Step 5B)
-- -----------------------------------------------------------------------------

-- Policy: positions_insert_admin
-- Description: Admins can create positions
-- Role: admin
CREATE POLICY "positions_insert_admin"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: positions_insert_hr
-- Description: HR managers can create positions
-- Role: hr_manager
CREATE POLICY "positions_insert_hr"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: positions_insert_manager
-- Description: Managers cannot create positions
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "positions_insert_manager"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- Policy: positions_insert_employee
-- Description: Employees cannot create positions
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "positions_insert_employee"
    ON public.hrm_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- UPDATE Policies for hrm_positions (ACTIVE - Step 5B)
-- -----------------------------------------------------------------------------

-- Policy: positions_update_admin
-- Description: Admins can modify positions
-- Role: admin
CREATE POLICY "positions_update_admin"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: positions_update_hr
-- Description: HR managers can modify positions
-- Role: hr_manager
CREATE POLICY "positions_update_hr"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: positions_update_manager
-- Description: Managers cannot modify positions
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "positions_update_manager"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy: positions_update_employee
-- Description: Employees cannot modify positions
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "positions_update_employee"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- DELETE Policies for hrm_positions (ACTIVE - Step 5B)
-- -----------------------------------------------------------------------------

-- Policy: positions_delete_admin
-- Description: Only admins can delete positions
-- Role: admin
CREATE POLICY "positions_delete_admin"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: positions_delete_hr
-- Description: HR managers cannot delete positions
-- Role: hr_manager
-- Rule: FALSE (no access)
CREATE POLICY "positions_delete_hr"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: positions_delete_manager
-- Description: Managers cannot delete positions
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "positions_delete_manager"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: positions_delete_employee
-- Description: Employees cannot delete positions
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "positions_delete_employee"
    ON public.hrm_positions
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- TABLE 4: public.hrm_employees
-- =============================================================================
-- Description: Core employee records with personal and employment data.
-- Sensitivity: HIGH - Contains PII and sensitive employment information.
-- Security Model: Hierarchical access based on roles and org structure.
-- Status: RLS ENABLED, SELECT + INSERT/UPDATE/DELETE policies ACTIVE (Step 5C)
-- =============================================================================

-- STEP 4: ENABLE RLS
ALTER TABLE public.hrm_employees ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for hrm_employees (ACTIVE - Step 4)
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_select_admin
-- Description: Admins can view all employee records
-- Role: admin
CREATE POLICY "hrm_employees_select_admin"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_select_hr_manager
-- Description: HR managers can view all employee records
-- Role: hr_manager
CREATE POLICY "hrm_employees_select_hr_manager"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()));

-- Policy: hrm_employees_select_manager
-- Description: Managers can view their direct reports
-- Role: manager
CREATE POLICY "hrm_employees_select_manager"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (public.is_manager_of(auth.uid(), id));

-- Policy: hrm_employees_select_own
-- Description: All employees can view their own record
-- Role: all authenticated
CREATE POLICY "hrm_employees_select_own"
    ON public.hrm_employees
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- NOTE: hrm_employees_select_same_org_unit policy DEFERRED
-- This policy allows employees to see colleagues in same org unit.
-- Requires careful consideration of PII exposure - moved to future phase.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- INSERT Policies for hrm_employees (ACTIVE - Step 5C)
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_insert_admin
-- Description: Admins can create employee records
-- Role: admin
CREATE POLICY "hrm_employees_insert_admin"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_insert_hr_manager
-- Description: HR managers can create employee records
-- Role: hr_manager
CREATE POLICY "hrm_employees_insert_hr_manager"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: hrm_employees_insert_manager
-- Description: Managers cannot create employee records
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "hrm_employees_insert_manager"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- Policy: hrm_employees_insert_employee
-- Description: Employees cannot create employee records
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "hrm_employees_insert_employee"
    ON public.hrm_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- UPDATE Policies for hrm_employees (ACTIVE - Step 5C)
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_update_admin
-- Description: Admins can update all employee records
-- Role: admin
CREATE POLICY "hrm_employees_update_admin"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_update_hr_manager
-- Description: HR managers can update all employee records
-- Role: hr_manager
CREATE POLICY "hrm_employees_update_hr_manager"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: hrm_employees_update_manager
-- Description: Managers cannot update employee records
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "hrm_employees_update_manager"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy: hrm_employees_update_employee
-- Description: Employees cannot update employee records (self-edit deferred)
-- Role: employee
-- Rule: FALSE (no access)
-- Note: Self-edit for limited fields may be added in future phase
CREATE POLICY "hrm_employees_update_employee"
    ON public.hrm_employees
    FOR UPDATE
    TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

-- -----------------------------------------------------------------------------
-- DELETE Policies for hrm_employees (ACTIVE - Step 5C)
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_delete_admin
-- Description: Only admins can delete employee records
-- Role: admin
-- Note: Soft delete preferred in practice (set employment_status to 'terminated')
CREATE POLICY "hrm_employees_delete_admin"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_delete_hr_manager
-- Description: HR managers cannot delete employee records
-- Role: hr_manager
-- Rule: FALSE (no access)
CREATE POLICY "hrm_employees_delete_hr_manager"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: hrm_employees_delete_manager
-- Description: Managers cannot delete employee records
-- Role: manager
-- Rule: FALSE (no access)
CREATE POLICY "hrm_employees_delete_manager"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (FALSE);

-- Policy: hrm_employees_delete_employee
-- Description: Employees cannot delete employee records
-- Role: employee
-- Rule: FALSE (no access)
CREATE POLICY "hrm_employees_delete_employee"
    ON public.hrm_employees
    FOR DELETE
    TO authenticated
    USING (FALSE);


-- =============================================================================
-- FUTURE TABLES (Phase 2+)
-- =============================================================================
-- The following tables will have RLS policies defined in later phases:
-- - hrm_leave_types (Phase 4)
-- - hrm_leave_requests (Phase 4)
-- - hrm_attendance_records (Phase 4)
-- - hrm_documents (Phase 5)
-- - hrm_audit_logs (Phase 7)
-- =============================================================================
