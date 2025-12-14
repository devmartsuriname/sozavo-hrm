-- ============================================================================
-- Phase 4.3: Leave Management — Security Definer Functions
-- ============================================================================
-- Execution Order: 1 of 5 (run BEFORE schema_leave.sql)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- get_employee_id: Get employee.id from auth user's user_id
-- Returns NULL if user has no linked employee record
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_employee_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id 
    FROM public.hrm_employees 
    WHERE user_id = _user_id 
    LIMIT 1
$$;

-- -----------------------------------------------------------------------------
-- is_leave_request_owner: Check if user owns a specific leave request
-- Returns FALSE if user has no employee record or doesn't own the request
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_leave_request_owner(_user_id UUID, _leave_request_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.hrm_leave_requests lr
        WHERE lr.id = _leave_request_id
          AND lr.employee_id = public.get_employee_id(_user_id)
    )
$$;

-- -----------------------------------------------------------------------------
-- can_approve_leave_request: Check if user can approve/reject a request
-- True for Admin/HR Manager (any request)
-- True for Manager if is_manager_of the request's employee
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_approve_leave_request(_user_id UUID, _leave_request_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        public.user_is_admin(_user_id) 
        OR public.user_is_hr_manager(_user_id) 
        OR (
            public.user_is_manager(_user_id) 
            AND EXISTS (
                SELECT 1 
                FROM public.hrm_leave_requests lr
                WHERE lr.id = _leave_request_id
                  AND public.is_manager_of(_user_id, lr.employee_id)
            )
        )
$$;
