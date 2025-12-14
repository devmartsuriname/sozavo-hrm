-- ============================================================================
-- Phase 4.3: Leave Management — Complete Bootstrap Migration (Corrected Order)
-- ============================================================================
-- Order: Tables → Functions → Triggers → RLS → Seed

-- STEP 1: Create Tables First
CREATE TABLE IF NOT EXISTS public.hrm_leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_days INTEGER NOT NULL DEFAULT 0,
    is_paid BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT chk_leave_types_code_lowercase CHECK (code = LOWER(code)),
    CONSTRAINT chk_leave_types_default_days_positive CHECK (default_days >= 0)
);

CREATE TABLE IF NOT EXISTS public.hrm_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.hrm_leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(5,1) NOT NULL,
    reason TEXT,
    status public.leave_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_by UUID REFERENCES auth.users(id),
    decided_at TIMESTAMPTZ,
    decision_reason TEXT,
    cancelled_by UUID REFERENCES auth.users(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT chk_leave_end_after_start CHECK (end_date >= start_date),
    CONSTRAINT chk_leave_total_days_positive CHECK (total_days > 0)
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON public.hrm_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.hrm_leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.hrm_leave_requests(start_date, end_date);

-- STEP 2: Security Definer Functions (after tables exist)
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

-- STEP 3: Unified Trigger Function
CREATE OR REPLACE FUNCTION public.leave_requests_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    is_hr_manager BOOLEAN;
    is_manager BOOLEAN;
    current_employee_id UUID;
    has_overlap BOOLEAN;
BEGIN
    is_admin := public.user_is_admin(auth.uid());
    is_hr_manager := public.user_is_hr_manager(auth.uid());
    is_manager := public.user_is_manager(auth.uid());
    current_employee_id := public.get_employee_id(auth.uid());

    -- A) AUDIT NORMALIZATION
    IF TG_OP = 'INSERT' THEN
        NEW.created_by := auth.uid();
        NEW.created_at := now();
        NEW.updated_by := auth.uid();
        NEW.updated_at := now();
        NEW.submitted_at := now();
        NEW.status := 'pending';
        NEW.decided_by := NULL;
        NEW.decided_at := NULL;
        NEW.cancelled_by := NULL;
        NEW.cancelled_at := NULL;
    ELSE
        NEW.updated_by := auth.uid();
        NEW.updated_at := now();
        NEW.created_by := OLD.created_by;
        NEW.created_at := OLD.created_at;
        NEW.submitted_at := OLD.submitted_at;

        IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
            NEW.decided_by := auth.uid();
            NEW.decided_at := now();
        ELSE
            NEW.decided_by := OLD.decided_by;
            NEW.decided_at := OLD.decided_at;
        END IF;

        IF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
            NEW.cancelled_by := auth.uid();
            NEW.cancelled_at := now();
        ELSE
            NEW.cancelled_by := OLD.cancelled_by;
            NEW.cancelled_at := OLD.cancelled_at;
        END IF;
    END IF;

    -- B) GUARDRAILS
    IF TG_OP = 'INSERT' THEN
        IF NOT is_admin AND NOT is_hr_manager AND current_employee_id IS NULL THEN
            RAISE EXCEPTION 'No linked employee record for this user.';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status IN ('approved', 'rejected', 'cancelled') THEN
            IF NOT is_admin AND NOT is_hr_manager THEN
                RAISE EXCEPTION 'Record is locked. Only Admin or HR Manager can modify finalized requests.';
            END IF;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' AND NOT is_admin AND NOT is_hr_manager AND NOT is_manager THEN
        IF current_employee_id IS NULL OR current_employee_id != OLD.employee_id THEN
            RAISE EXCEPTION 'Employees can only act on their own leave requests.';
        END IF;

        IF NOT (OLD.status = 'pending' AND NEW.status = 'cancelled') THEN
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                RAISE EXCEPTION 'Employees can only cancel their pending requests.';
            END IF;
            RAISE EXCEPTION 'Employees cannot edit leave request details. Only cancellation is allowed.';
        END IF;

        IF NEW.employee_id IS DISTINCT FROM OLD.employee_id
            OR NEW.leave_type_id IS DISTINCT FROM OLD.leave_type_id
            OR NEW.start_date IS DISTINCT FROM OLD.start_date
            OR NEW.end_date IS DISTINCT FROM OLD.end_date
            OR NEW.total_days IS DISTINCT FROM OLD.total_days
            OR NEW.reason IS DISTINCT FROM OLD.reason THEN
            RAISE EXCEPTION 'Employees cannot modify request details. Only cancellation is allowed.';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' AND is_manager AND NOT is_admin AND NOT is_hr_manager THEN
        IF NOT public.is_manager_of(auth.uid(), OLD.employee_id) THEN
            RAISE EXCEPTION 'Managers can only approve/reject direct reports.';
        END IF;

        IF current_employee_id IS NOT NULL AND current_employee_id = OLD.employee_id THEN
            RAISE EXCEPTION 'Managers cannot approve their own leave requests.';
        END IF;

        IF OLD.status != 'pending' THEN
            RAISE EXCEPTION 'Managers can only act on pending requests.';
        END IF;

        IF NEW.status NOT IN ('approved', 'rejected') THEN
            RAISE EXCEPTION 'Managers can only approve or reject pending requests.';
        END IF;

        IF NEW.employee_id IS DISTINCT FROM OLD.employee_id
            OR NEW.leave_type_id IS DISTINCT FROM OLD.leave_type_id
            OR NEW.start_date IS DISTINCT FROM OLD.start_date
            OR NEW.end_date IS DISTINCT FROM OLD.end_date
            OR NEW.total_days IS DISTINCT FROM OLD.total_days
            OR NEW.reason IS DISTINCT FROM OLD.reason THEN
            RAISE EXCEPTION 'Managers cannot modify request details. Only status decision allowed.';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' AND is_hr_manager AND NOT is_admin THEN
        IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
            IF NEW.decision_reason IS NULL OR TRIM(NEW.decision_reason) = '' THEN
                RAISE EXCEPTION 'HR Managers must provide a decision reason when rejecting.';
            END IF;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
            IF current_employee_id IS NOT NULL AND OLD.employee_id = current_employee_id THEN
                RAISE EXCEPTION 'Cannot approve or reject your own leave request.';
            END IF;
        END IF;
    END IF;

    -- C) OVERLAP PREVENTION
    IF TG_OP = 'INSERT'
       OR (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'approved')
       OR (TG_OP = 'UPDATE' AND NEW.status = 'approved' 
           AND (NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date)) THEN

        SELECT EXISTS (
            SELECT 1
            FROM public.hrm_leave_requests existing
            WHERE existing.employee_id = NEW.employee_id
              AND existing.status = 'approved'
              AND existing.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
              AND NOT (NEW.end_date < existing.start_date OR NEW.start_date > existing.end_date)
        ) INTO has_overlap;

        IF has_overlap THEN
            RAISE EXCEPTION 'Leave request overlaps with an existing approved leave.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- STEP 4: Attach Triggers
DROP TRIGGER IF EXISTS trg_leave_types_updated_at ON public.hrm_leave_types;
CREATE TRIGGER trg_leave_types_updated_at
    BEFORE UPDATE ON public.hrm_leave_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_leave_requests_before_write ON public.hrm_leave_requests;
CREATE TRIGGER trg_leave_requests_before_write
    BEFORE INSERT OR UPDATE ON public.hrm_leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.leave_requests_before_write();

-- STEP 5: Enable RLS + Create Policies
ALTER TABLE public.hrm_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_leave_requests ENABLE ROW LEVEL SECURITY;

-- hrm_leave_types SELECT policies
DROP POLICY IF EXISTS "leave_types_select_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_admin" ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_select_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_hr_manager" ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_types_select_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_manager" ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_manager(auth.uid()) AND is_active = true);

DROP POLICY IF EXISTS "leave_types_select_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_select_employee" ON public.hrm_leave_types FOR SELECT
    USING (public.user_is_employee(auth.uid()) AND is_active = true);

-- hrm_leave_types INSERT policies
DROP POLICY IF EXISTS "leave_types_insert_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_admin" ON public.hrm_leave_types FOR INSERT
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_insert_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_hr_manager" ON public.hrm_leave_types FOR INSERT
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_types_insert_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_manager" ON public.hrm_leave_types FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "leave_types_insert_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_insert_employee" ON public.hrm_leave_types FOR INSERT
    WITH CHECK (false);

-- hrm_leave_types UPDATE policies
DROP POLICY IF EXISTS "leave_types_update_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_admin" ON public.hrm_leave_types FOR UPDATE
    USING (public.user_is_admin(auth.uid())) WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_update_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_hr_manager" ON public.hrm_leave_types FOR UPDATE
    USING (public.user_is_hr_manager(auth.uid())) WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_types_update_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_manager" ON public.hrm_leave_types FOR UPDATE
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "leave_types_update_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_update_employee" ON public.hrm_leave_types FOR UPDATE
    USING (false) WITH CHECK (false);

-- hrm_leave_types DELETE policies
DROP POLICY IF EXISTS "leave_types_delete_admin" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_admin" ON public.hrm_leave_types FOR DELETE
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_types_delete_hr_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_hr_manager" ON public.hrm_leave_types FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_types_delete_manager" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_manager" ON public.hrm_leave_types FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_types_delete_employee" ON public.hrm_leave_types;
CREATE POLICY "leave_types_delete_employee" ON public.hrm_leave_types FOR DELETE
    USING (false);

-- hrm_leave_requests SELECT policies
DROP POLICY IF EXISTS "leave_requests_select_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_admin" ON public.hrm_leave_requests FOR SELECT
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_select_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_hr_manager" ON public.hrm_leave_requests FOR SELECT
    USING (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_select_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_manager" ON public.hrm_leave_requests FOR SELECT
    USING (public.user_is_manager(auth.uid()) AND public.is_manager_of(auth.uid(), employee_id));

DROP POLICY IF EXISTS "leave_requests_select_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_select_employee" ON public.hrm_leave_requests FOR SELECT
    USING (employee_id = public.get_employee_id(auth.uid()));

-- hrm_leave_requests INSERT policies
DROP POLICY IF EXISTS "leave_requests_insert_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_admin" ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_insert_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_hr_manager" ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_insert_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_manager" ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "leave_requests_insert_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_insert_employee" ON public.hrm_leave_requests FOR INSERT
    WITH CHECK (employee_id = public.get_employee_id(auth.uid()));

-- hrm_leave_requests UPDATE policies
DROP POLICY IF EXISTS "leave_requests_update_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_admin" ON public.hrm_leave_requests FOR UPDATE
    USING (public.user_is_admin(auth.uid())) WITH CHECK (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_update_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_hr_manager" ON public.hrm_leave_requests FOR UPDATE
    USING (public.user_is_hr_manager(auth.uid())) WITH CHECK (public.user_is_hr_manager(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_update_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_manager" ON public.hrm_leave_requests FOR UPDATE
    USING (public.user_is_manager(auth.uid()) AND public.is_manager_of(auth.uid(), employee_id))
    WITH CHECK (public.user_is_manager(auth.uid()) AND public.is_manager_of(auth.uid(), employee_id));

DROP POLICY IF EXISTS "leave_requests_update_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_update_employee" ON public.hrm_leave_requests FOR UPDATE
    USING (employee_id = public.get_employee_id(auth.uid()))
    WITH CHECK (employee_id = public.get_employee_id(auth.uid()));

-- hrm_leave_requests DELETE policies
DROP POLICY IF EXISTS "leave_requests_delete_admin" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_admin" ON public.hrm_leave_requests FOR DELETE
    USING (public.user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "leave_requests_delete_hr_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_hr_manager" ON public.hrm_leave_requests FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_requests_delete_manager" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_manager" ON public.hrm_leave_requests FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "leave_requests_delete_employee" ON public.hrm_leave_requests;
CREATE POLICY "leave_requests_delete_employee" ON public.hrm_leave_requests FOR DELETE
    USING (false);

-- STEP 6: Seed Initial Leave Types
INSERT INTO public.hrm_leave_types (code, name, description, default_days, is_paid, requires_approval)
VALUES
    ('annual', 'Annual Leave', 'Regular paid vacation leave', 20, true, true),
    ('sick', 'Sick Leave', 'Leave due to illness or medical appointments', 10, true, false),
    ('unpaid', 'Unpaid Leave', 'Leave without pay for personal matters', 0, false, true),
    ('maternity', 'Maternity Leave', 'Leave for childbirth and postnatal care', 90, true, true),
    ('paternity', 'Paternity Leave', 'Leave for new fathers', 5, true, true),
    ('bereavement', 'Bereavement Leave', 'Leave due to death of family member', 3, true, true),
    ('study', 'Study Leave', 'Leave for educational purposes', 5, true, true),
    ('compassionate', 'Compassionate Leave', 'Leave for family emergencies', 3, true, true)
ON CONFLICT (code) DO NOTHING;