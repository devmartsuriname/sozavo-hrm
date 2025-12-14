-- ============================================================================
-- Phase 4.3: Leave Management — RLS Policies
-- ============================================================================
-- Execution Order: 4 of 5 (run AFTER triggers_leave.sql)
-- ============================================================================

-- =============================================================================
-- ENABLE RLS
-- =============================================================================
ALTER TABLE public.hrm_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_leave_requests ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- hrm_leave_types POLICIES
-- =============================================================================

-- SELECT: Admin/HR see all, Manager/Employee see active only
DROP POLICY IF EXISTS "leave_types_select_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_admin"
    ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_select_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_hr_manager"
    ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_types_select_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_manager"
    ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_manager(auth.uid()) AND is_active = true);

DROP POLICY IF EXISTS "leave_types_select_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_employee"
    ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_employee(auth.uid()) AND is_active = true);

-- INSERT: Admin/HR only
DROP POLICY IF EXISTS "leave_types_insert_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_admin"
    ON public.hrm_leave_types FOR INSERT
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_insert_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_hr_manager"
    ON public.hrm_leave_types FOR INSERT
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_types_insert_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_manager"
    ON public.hrm_leave_types FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "leave_types_insert_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_employee"
    ON public.hrm_leave_types FOR INSERT
    WITH CHECK (false);

-- UPDATE: Admin/HR only
DROP POLICY IF EXISTS "leave_types_update_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_admin"
    ON public.hrm_leave_types FOR UPDATE
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_update_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_hr_manager"
    ON public.hrm_leave_types FOR UPDATE
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_types_update_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_manager"
    ON public.hrm_leave_types FOR UPDATE
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS "leave_types_update_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_employee"
    ON public.hrm_leave_types FOR UPDATE
    USING (false)
    WITH CHECK (false);

-- DELETE: Admin only
DROP POLICY IF EXISTS "leave_types_delete_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_admin"
    ON public.hrm_leave_types FOR DELETE
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_delete_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_hr_manager"
    ON public.hrm_leave_types FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_types_delete_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_manager"
    ON public.hrm_leave_types FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_types_delete_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_employee"
    ON public.hrm_leave_types FOR DELETE
    USING (false);

-- =============================================================================
-- hrm_leave_requests POLICIES
-- =============================================================================

-- SELECT: Admin/HR see all, Manager see direct reports, Employee see own
DROP POLICY IF EXISTS "leave_requests_select_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_admin"
    ON public.hrm_leave_requests FOR SELECT
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_select_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_hr_manager"
    ON public.hrm_leave_requests FOR SELECT
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_select_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_manager"
    ON public.hrm_leave_requests FOR SELECT
    USING (
        public.user_is_manager(auth.uid()) 
        AND public.is_manager_of(auth.uid(), employee_id)
    );

DROP POLICY IF EXISTS "leave_requests_select_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_employee"
    ON public.hrm_leave_requests FOR SELECT
    USING (employee_id = public.get_employee_id(auth.uid()));

-- INSERT: Admin/HR can insert for any employee, Employee can insert for self only
DROP POLICY IF EXISTS "leave_requests_insert_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_admin"
    ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_insert_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_hr_manager"
    ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_insert_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_manager"
    ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (false);

-- CRITICAL: Employee INSERT enforces ownership via get_employee_id
DROP POLICY IF EXISTS "leave_requests_insert_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_employee"
    ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (employee_id = public.get_employee_id(auth.uid()));

-- UPDATE: Admin/HR full, Manager for direct reports (trigger enforces approve/reject only), Employee for own (trigger enforces cancel only)
DROP POLICY IF EXISTS "leave_requests_update_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_admin"
    ON public.hrm_leave_requests FOR UPDATE
    USING (public.user_is_admin(auth.uid()))
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_update_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_hr_manager"
    ON public.hrm_leave_requests FOR UPDATE
    USING (public.user_is_hr_manager(auth.uid()))
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_update_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_manager"
    ON public.hrm_leave_requests FOR UPDATE
    USING (
        public.user_is_manager(auth.uid()) 
        AND public.is_manager_of(auth.uid(), employee_id)
    )
    WITH CHECK (
        public.user_is_manager(auth.uid()) 
        AND public.is_manager_of(auth.uid(), employee_id)
    );

DROP POLICY IF EXISTS "leave_requests_update_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_employee"
    ON public.hrm_leave_requests FOR UPDATE
    USING (employee_id = public.get_employee_id(auth.uid()))
    WITH CHECK (employee_id = public.get_employee_id(auth.uid()));

-- DELETE: Admin/HR only (hard delete is discouraged; prefer status changes)
DROP POLICY IF EXISTS "leave_requests_delete_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_admin"
    ON public.hrm_leave_requests FOR DELETE
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_delete_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_hr_manager"
    ON public.hrm_leave_requests FOR DELETE
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_delete_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_manager"
    ON public.hrm_leave_requests FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_requests_delete_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_employee"
    ON public.hrm_leave_requests FOR DELETE
    USING (false);
