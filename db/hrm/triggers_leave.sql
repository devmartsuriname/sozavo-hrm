-- ============================================================================
-- Phase 4.3: Leave Management — Unified Trigger Function
-- ============================================================================
-- Execution Order: 3 of 5 (run AFTER schema_leave.sql)
-- ============================================================================
-- DESIGN: ONE single BEFORE INSERT OR UPDATE trigger for hrm_leave_requests
-- Performs in order: A) Audit normalization, B) Guardrails, C) Overlap prevention
-- ============================================================================

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
    -- Get current user roles
    is_admin := public.user_is_admin(auth.uid());
    is_hr_manager := public.user_is_hr_manager(auth.uid());
    is_manager := public.user_is_manager(auth.uid());
    current_employee_id := public.get_employee_id(auth.uid());

    -- =========================================================================
    -- A) AUDIT NORMALIZATION (DB-authoritative)
    -- =========================================================================
    IF TG_OP = 'INSERT' THEN
        -- Force all audit fields on INSERT (override any client values)
        NEW.created_by := auth.uid();
        NEW.created_at := now();
        NEW.updated_by := auth.uid();
        NEW.updated_at := now();
        NEW.submitted_at := now();
        NEW.status := 'pending';  -- Always start as pending
        
        -- Clear decision/cancellation fields
        NEW.decided_by := NULL;
        NEW.decided_at := NULL;
        NEW.cancelled_by := NULL;
        NEW.cancelled_at := NULL;
    ELSE
        -- UPDATE: Set updated_by/at
        NEW.updated_by := auth.uid();
        NEW.updated_at := now();

        -- IMMUTABLE audit fields (prevent tampering)
        NEW.created_by := OLD.created_by;
        NEW.created_at := OLD.created_at;
        NEW.submitted_at := OLD.submitted_at;

        -- Decision audit on pending → approved/rejected
        IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
            NEW.decided_by := auth.uid();
            NEW.decided_at := now();
        ELSE
            -- Preserve existing decision fields
            NEW.decided_by := OLD.decided_by;
            NEW.decided_at := OLD.decided_at;
        END IF;

        -- Cancellation audit on pending → cancelled
        IF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
            NEW.cancelled_by := auth.uid();
            NEW.cancelled_at := now();
        ELSE
            -- Preserve existing cancellation fields
            NEW.cancelled_by := OLD.cancelled_by;
            NEW.cancelled_at := OLD.cancelled_at;
        END IF;
    END IF;

    -- =========================================================================
    -- B) GUARDRAILS
    -- =========================================================================

    -- B1) No linked employee record for non-Admin/HR on INSERT
    IF TG_OP = 'INSERT' THEN
        IF NOT is_admin AND NOT is_hr_manager AND current_employee_id IS NULL THEN
            RAISE EXCEPTION 'No linked employee record for this user.';
        END IF;
    END IF;

    -- B2) Post-decision immutability (non-Admin/HR cannot modify finalized requests)
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status IN ('approved', 'rejected', 'cancelled') THEN
            IF NOT is_admin AND NOT is_hr_manager THEN
                RAISE EXCEPTION 'Record is locked. Only Admin or HR Manager can modify finalized requests.';
            END IF;
        END IF;
    END IF;

    -- B3) Employee restrictions: cancel only (pending → cancelled), no other edits
    IF TG_OP = 'UPDATE' AND NOT is_admin AND NOT is_hr_manager AND NOT is_manager THEN
        -- Must be own request
        IF current_employee_id IS NULL OR current_employee_id != OLD.employee_id THEN
            RAISE EXCEPTION 'Employees can only act on their own leave requests.';
        END IF;

        -- Only allowed transition: pending → cancelled
        IF NOT (OLD.status = 'pending' AND NEW.status = 'cancelled') THEN
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                RAISE EXCEPTION 'Employees can only cancel their pending requests.';
            END IF;
            -- Status unchanged but UPDATE attempted = edit attempt
            RAISE EXCEPTION 'Employees cannot edit leave request details. Only cancellation is allowed.';
        END IF;

        -- Even during cancellation, core fields must remain unchanged
        IF NEW.employee_id IS DISTINCT FROM OLD.employee_id
            OR NEW.leave_type_id IS DISTINCT FROM OLD.leave_type_id
            OR NEW.start_date IS DISTINCT FROM OLD.start_date
            OR NEW.end_date IS DISTINCT FROM OLD.end_date
            OR NEW.total_days IS DISTINCT FROM OLD.total_days
            OR NEW.reason IS DISTINCT FROM OLD.reason THEN
            RAISE EXCEPTION 'Employees cannot modify request details. Only cancellation is allowed.';
        END IF;
    END IF;

    -- B4) Manager restrictions: approve/reject pending direct reports only
    IF TG_OP = 'UPDATE' AND is_manager AND NOT is_admin AND NOT is_hr_manager THEN
        -- Must be direct report
        IF NOT public.is_manager_of(auth.uid(), OLD.employee_id) THEN
            RAISE EXCEPTION 'Managers can only approve/reject direct reports.';
        END IF;

        -- Self-approval block
        IF current_employee_id IS NOT NULL AND current_employee_id = OLD.employee_id THEN
            RAISE EXCEPTION 'Managers cannot approve their own leave requests.';
        END IF;

        -- Must be acting on pending request
        IF OLD.status != 'pending' THEN
            RAISE EXCEPTION 'Managers can only act on pending requests.';
        END IF;

        -- Only approve/reject allowed
        IF NEW.status NOT IN ('approved', 'rejected') THEN
            RAISE EXCEPTION 'Managers can only approve or reject pending requests.';
        END IF;

        -- Block field edits (only status + decision_reason allowed to change)
        IF NEW.employee_id IS DISTINCT FROM OLD.employee_id
            OR NEW.leave_type_id IS DISTINCT FROM OLD.leave_type_id
            OR NEW.start_date IS DISTINCT FROM OLD.start_date
            OR NEW.end_date IS DISTINCT FROM OLD.end_date
            OR NEW.total_days IS DISTINCT FROM OLD.total_days
            OR NEW.reason IS DISTINCT FROM OLD.reason THEN
            RAISE EXCEPTION 'Managers cannot modify request details. Only status decision allowed.';
        END IF;
    END IF;

    -- B5) HR Manager rejection requires decision_reason
    IF TG_OP = 'UPDATE' AND is_hr_manager AND NOT is_admin THEN
        IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
            IF NEW.decision_reason IS NULL OR TRIM(NEW.decision_reason) = '' THEN
                RAISE EXCEPTION 'HR Managers must provide a decision reason when rejecting.';
            END IF;
        END IF;
    END IF;

    -- B6) Self-approval guard for ANY role (belt-and-suspenders)
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
            IF current_employee_id IS NOT NULL AND OLD.employee_id = current_employee_id THEN
                RAISE EXCEPTION 'Cannot approve or reject your own leave request.';
            END IF;
        END IF;
    END IF;

    -- =========================================================================
    -- C) OVERLAP PREVENTION
    -- =========================================================================
    -- Check on:
    -- 1) INSERT (new request)
    -- 2) pending → approved transition
    -- 3) Any update where status='approved' AND dates changed (Admin/HR corrections)
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

-- =============================================================================
-- ATTACH TRIGGERS
-- =============================================================================

-- hrm_leave_types: Standard updated_at trigger
DROP TRIGGER IF EXISTS trg_leave_types_updated_at ON public.hrm_leave_types;
CREATE TRIGGER trg_leave_types_updated_at
    BEFORE UPDATE ON public.hrm_leave_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- hrm_leave_requests: ONE unified trigger for audit + guardrails + overlap
DROP TRIGGER IF EXISTS trg_leave_requests_before_write ON public.hrm_leave_requests;
CREATE TRIGGER trg_leave_requests_before_write
    BEFORE INSERT OR UPDATE ON public.hrm_leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.leave_requests_before_write();
