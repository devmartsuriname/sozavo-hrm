-- Phase 4.2.1: Reactivation + Audit Guardrails
-- Add terminated_at for immutable termination timestamp (cooldown logic)
-- Add reactivation audit fields
-- Add BEFORE UPDATE trigger for manager guardrails

-- Step 1: Add new columns to hrm_employees
ALTER TABLE public.hrm_employees
ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS reactivated_by UUID NULL REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS reactivation_reason TEXT NULL;

-- Compliance comments
COMMENT ON COLUMN public.hrm_employees.terminated_at IS 'Immutable timestamp of termination for cooldown logic (audit trail)';
COMMENT ON COLUMN public.hrm_employees.reactivated_by IS 'User who reactivated this employee (audit trail)';
COMMENT ON COLUMN public.hrm_employees.reactivated_at IS 'Timestamp of reactivation (audit trail)';
COMMENT ON COLUMN public.hrm_employees.reactivation_reason IS 'Reason for reactivation (compliance)';

-- Step 2: Create SECURITY DEFINER function for update guardrails
CREATE OR REPLACE FUNCTION public.enforce_employee_update_guardrails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    is_hr_manager BOOLEAN;
    is_manager BOOLEAN;
    cooldown_active BOOLEAN;
    reactivation_has_reason BOOLEAN;
BEGIN
    -- Determine user roles
    is_admin := public.user_is_admin(auth.uid());
    is_hr_manager := public.user_is_hr_manager(auth.uid());
    is_manager := public.user_is_manager(auth.uid());

    -- =========================================================================
    -- GUARDRAILS FOR MANAGER ROLE (most restrictive)
    -- =========================================================================
    IF is_manager AND NOT is_admin AND NOT is_hr_manager THEN
        
        -- Guardrail 1A: Block updates to orphan employees (OLD.org_unit_id IS NULL)
        IF OLD.org_unit_id IS NULL THEN
            RAISE EXCEPTION 'Managers cannot update orphan employees (org_unit_id is NULL).';
        END IF;
        
        -- Guardrail 1B: Block org_unit_id changes (prevent reassignment/making NULL)
        IF NEW.org_unit_id IS DISTINCT FROM OLD.org_unit_id THEN
            RAISE EXCEPTION 'Managers cannot change employee org unit assignment.';
        END IF;
        
        -- Guardrail 2: Block ALL updates on terminated records
        IF OLD.employment_status = 'terminated' THEN
            RAISE EXCEPTION 'Managers cannot modify terminated employee records. Contact HR or Administrator.';
        END IF;
        
    END IF;

    -- =========================================================================
    -- REACTIVATION GUARDRAILS (applies to HR Manager and specific conditions)
    -- =========================================================================
    -- Only check if this IS a reactivation attempt (status changing from terminated to active)
    IF OLD.employment_status = 'terminated' AND NEW.employment_status = 'active' THEN
        
        -- Managers cannot reactivate (already blocked above by Guardrail 2)
        -- This is a belt-and-suspenders check
        IF is_manager AND NOT is_admin AND NOT is_hr_manager THEN
            RAISE EXCEPTION 'Managers cannot reactivate terminated employees.';
        END IF;
        
        -- Check if reason is provided
        reactivation_has_reason := (NEW.reactivation_reason IS NOT NULL AND TRIM(NEW.reactivation_reason) <> '');
        
        -- HR Manager MUST provide reactivation reason
        IF is_hr_manager AND NOT is_admin THEN
            IF NOT reactivation_has_reason THEN
                RAISE EXCEPTION 'HR Managers must provide a reactivation reason.';
            END IF;
        END IF;
        
        -- Cooldown check: If terminated_at was within last 5 minutes, reason is REQUIRED (even for Admin)
        -- Use OLD.terminated_at for immutable cooldown check
        cooldown_active := (OLD.terminated_at IS NOT NULL AND OLD.terminated_at >= NOW() - INTERVAL '5 minutes');
        IF cooldown_active AND NOT reactivation_has_reason THEN
            RAISE EXCEPTION 'Reactivation within 5 minutes of termination requires a reason.';
        END IF;
        
    END IF;

    RETURN NEW;
END;
$$;

-- Step 3: Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_employee_update_guardrails ON public.hrm_employees;
CREATE TRIGGER trg_employee_update_guardrails
    BEFORE UPDATE ON public.hrm_employees
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_employee_update_guardrails();