-- =============================================================================
-- HRM ROW-LEVEL SECURITY POLICIES
-- =============================================================================
-- Purpose: Define granular access control for all HRM tables.
-- Run Order: 4 (after functions.sql)
-- Dependencies: enums.sql, schema.sql, functions.sql must be run first
-- Status: SCAFFOLDING ONLY - Policies NOT activated until Phase 1 Step 4
-- =============================================================================

-- =============================================================================
-- IMPORTANT: DO NOT ENABLE RLS OR CREATE POLICIES UNTIL STEP 4
-- This file contains the complete policy structure in comments.
-- Activation will occur in Phase 1 – Step 4 after validation.
-- =============================================================================

-- =============================================================================
-- TABLE 1: public.user_roles
-- =============================================================================
-- Description: Stores Role-Based Access Control (RBAC) assignments.
-- Sensitivity: HIGH - Controls all system permissions.
-- Security Model: Admin-only write access, restricted read access.
-- =============================================================================

-- ENABLE RLS (Step 4):
-- ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for user_roles
-- -----------------------------------------------------------------------------

-- Policy: user_roles_select_admin
-- Description: Admins can view all role assignments
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "user_roles_select_admin"
--     ON public.user_roles
--     FOR SELECT
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()));

-- Policy: user_roles_select_hr_manager
-- Description: HR managers can view all role assignments for HR purposes
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "user_roles_select_hr_manager"
--     ON public.user_roles
--     FOR SELECT
--     TO authenticated
--     USING (public.user_is_hr_manager(auth.uid()));

-- Policy: user_roles_select_own
-- Description: All authenticated users can view their own roles
-- Role: all authenticated
-- Rule: user_id = auth.uid()
-- SQL (Step 4):
-- CREATE POLICY "user_roles_select_own"
--     ON public.user_roles
--     FOR SELECT
--     TO authenticated
--     USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- INSERT Policies for user_roles
-- -----------------------------------------------------------------------------

-- Policy: user_roles_insert_admin
-- Description: Only admins can assign roles
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "user_roles_insert_admin"
--     ON public.user_roles
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- UPDATE Policies for user_roles
-- -----------------------------------------------------------------------------

-- Policy: user_roles_update_admin
-- Description: Only admins can modify role assignments
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "user_roles_update_admin"
--     ON public.user_roles
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()))
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- DELETE Policies for user_roles
-- -----------------------------------------------------------------------------

-- Policy: user_roles_delete_admin
-- Description: Only admins can remove role assignments
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "user_roles_delete_admin"
--     ON public.user_roles
--     FOR DELETE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()));


-- =============================================================================
-- TABLE 2: public.hrm_organization_units
-- =============================================================================
-- Description: Stores organizational hierarchy (departments, divisions).
-- Sensitivity: MEDIUM - Organizational structure is generally readable.
-- Security Model: Wide read access, admin/HR write access.
-- =============================================================================

-- ENABLE RLS (Step 4):
-- ALTER TABLE public.hrm_organization_units ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for hrm_organization_units
-- -----------------------------------------------------------------------------

-- Policy: hrm_organization_units_select_authenticated
-- Description: All authenticated users can view organization structure
-- Role: all authenticated
-- Rule: TRUE (authenticated users only via TO authenticated)
-- SQL (Step 4):
-- CREATE POLICY "hrm_organization_units_select_authenticated"
--     ON public.hrm_organization_units
--     FOR SELECT
--     TO authenticated
--     USING (TRUE);

-- -----------------------------------------------------------------------------
-- INSERT Policies for hrm_organization_units
-- -----------------------------------------------------------------------------

-- Policy: hrm_organization_units_insert_admin
-- Description: Only admins can create organization units
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_organization_units_insert_admin"
--     ON public.hrm_organization_units
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_organization_units_insert_hr_manager
-- Description: HR managers can create organization units
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_organization_units_insert_hr_manager"
--     ON public.hrm_organization_units
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- -----------------------------------------------------------------------------
-- UPDATE Policies for hrm_organization_units
-- -----------------------------------------------------------------------------

-- Policy: hrm_organization_units_update_admin
-- Description: Only admins can modify organization units
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_organization_units_update_admin"
--     ON public.hrm_organization_units
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()))
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_organization_units_update_hr_manager
-- Description: HR managers can modify organization units
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_organization_units_update_hr_manager"
--     ON public.hrm_organization_units
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_hr_manager(auth.uid()))
--     WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- -----------------------------------------------------------------------------
-- DELETE Policies for hrm_organization_units
-- -----------------------------------------------------------------------------

-- Policy: hrm_organization_units_delete_admin
-- Description: Only admins can delete organization units
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_organization_units_delete_admin"
--     ON public.hrm_organization_units
--     FOR DELETE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()));


-- =============================================================================
-- TABLE 3: public.hrm_positions
-- =============================================================================
-- Description: Stores job positions and titles.
-- Sensitivity: MEDIUM - Position information is generally readable.
-- Security Model: Wide read access, admin/HR write access.
-- =============================================================================

-- ENABLE RLS (Step 4):
-- ALTER TABLE public.hrm_positions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for hrm_positions
-- -----------------------------------------------------------------------------

-- Policy: hrm_positions_select_authenticated
-- Description: All authenticated users can view positions
-- Role: all authenticated
-- Rule: TRUE (authenticated users only via TO authenticated)
-- SQL (Step 4):
-- CREATE POLICY "hrm_positions_select_authenticated"
--     ON public.hrm_positions
--     FOR SELECT
--     TO authenticated
--     USING (TRUE);

-- -----------------------------------------------------------------------------
-- INSERT Policies for hrm_positions
-- -----------------------------------------------------------------------------

-- Policy: hrm_positions_insert_admin
-- Description: Only admins can create positions
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_positions_insert_admin"
--     ON public.hrm_positions
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_positions_insert_hr_manager
-- Description: HR managers can create positions
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_positions_insert_hr_manager"
--     ON public.hrm_positions
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- -----------------------------------------------------------------------------
-- UPDATE Policies for hrm_positions
-- -----------------------------------------------------------------------------

-- Policy: hrm_positions_update_admin
-- Description: Only admins can modify positions
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_positions_update_admin"
--     ON public.hrm_positions
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()))
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_positions_update_hr_manager
-- Description: HR managers can modify positions
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_positions_update_hr_manager"
--     ON public.hrm_positions
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_hr_manager(auth.uid()))
--     WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- -----------------------------------------------------------------------------
-- DELETE Policies for hrm_positions
-- -----------------------------------------------------------------------------

-- Policy: hrm_positions_delete_admin
-- Description: Only admins can delete positions
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_positions_delete_admin"
--     ON public.hrm_positions
--     FOR DELETE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()));


-- =============================================================================
-- TABLE 4: public.hrm_employees
-- =============================================================================
-- Description: Core employee records with personal and employment data.
-- Sensitivity: HIGH - Contains PII and sensitive employment information.
-- Security Model: Hierarchical access based on roles and org structure.
-- =============================================================================

-- ENABLE RLS (Step 4):
-- ALTER TABLE public.hrm_employees ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT Policies for hrm_employees
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_select_admin
-- Description: Admins can view all employee records
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_select_admin"
--     ON public.hrm_employees
--     FOR SELECT
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_select_hr_manager
-- Description: HR managers can view all employee records
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_select_hr_manager"
--     ON public.hrm_employees
--     FOR SELECT
--     TO authenticated
--     USING (public.user_is_hr_manager(auth.uid()));

-- Policy: hrm_employees_select_manager
-- Description: Managers can view their direct reports
-- Role: manager
-- Rule: is_manager_of(auth.uid(), id) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_select_manager"
--     ON public.hrm_employees
--     FOR SELECT
--     TO authenticated
--     USING (public.is_manager_of(auth.uid(), id));

-- Policy: hrm_employees_select_own
-- Description: All employees can view their own record
-- Role: all authenticated
-- Rule: user_id = auth.uid()
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_select_own"
--     ON public.hrm_employees
--     FOR SELECT
--     TO authenticated
--     USING (user_id = auth.uid());

-- Policy: hrm_employees_select_same_org_unit
-- Description: Employees can view basic info of colleagues in same org unit
-- Role: employee
-- Rule: org_unit_id = get_user_org_unit(auth.uid())
-- Note: May need column-level restrictions in application layer
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_select_same_org_unit"
--     ON public.hrm_employees
--     FOR SELECT
--     TO authenticated
--     USING (org_unit_id = public.get_user_org_unit(auth.uid()));

-- -----------------------------------------------------------------------------
-- INSERT Policies for hrm_employees
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_insert_admin
-- Description: Only admins can create employee records
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_insert_admin"
--     ON public.hrm_employees
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_insert_hr_manager
-- Description: HR managers can create employee records
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_insert_hr_manager"
--     ON public.hrm_employees
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- -----------------------------------------------------------------------------
-- UPDATE Policies for hrm_employees
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_update_admin
-- Description: Admins can update all employee records
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_update_admin"
--     ON public.hrm_employees
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()))
--     WITH CHECK (public.user_is_admin(auth.uid()));

-- Policy: hrm_employees_update_hr_manager
-- Description: HR managers can update all employee records
-- Role: hr_manager
-- Rule: user_is_hr_manager(auth.uid()) = TRUE
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_update_hr_manager"
--     ON public.hrm_employees
--     FOR UPDATE
--     TO authenticated
--     USING (public.user_is_hr_manager(auth.uid()))
--     WITH CHECK (public.user_is_hr_manager(auth.uid()));

-- Policy: hrm_employees_update_own_limited
-- Description: Employees can update limited fields on their own record
-- Role: employee (own record)
-- Rule: user_id = auth.uid()
-- Note: Column restrictions enforced in application layer (phone, email, etc.)
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_update_own"
--     ON public.hrm_employees
--     FOR UPDATE
--     TO authenticated
--     USING (user_id = auth.uid())
--     WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- DELETE Policies for hrm_employees
-- -----------------------------------------------------------------------------

-- Policy: hrm_employees_delete_admin
-- Description: Only admins can delete employee records
-- Role: admin
-- Rule: user_is_admin(auth.uid()) = TRUE
-- Note: Soft delete preferred in practice (set employment_status to 'terminated')
-- SQL (Step 4):
-- CREATE POLICY "hrm_employees_delete_admin"
--     ON public.hrm_employees
--     FOR DELETE
--     TO authenticated
--     USING (public.user_is_admin(auth.uid()));


-- =============================================================================
-- FUTURE TABLES (Phase 2+)
-- =============================================================================
-- The following tables will have RLS policies defined in later phases:
-- - hrm_leave_types (Phase 4)
-- - hrm_leave_requests (Phase 4)
-- - hrm_attendance_records (Phase 4)
-- - hrm_documents (Phase 5)
-- - hrm_audit_logs (Phase 7)
-- - hrm_settings (Phase 7)
-- =============================================================================


-- =============================================================================
-- END OF RLS POLICIES SCAFFOLDING
-- =============================================================================
