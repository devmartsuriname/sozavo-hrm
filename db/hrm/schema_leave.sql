-- ============================================================================
-- Phase 4.3: Leave Management — Table Schemas
-- ============================================================================
-- Execution Order: 2 of 5 (run AFTER functions_leave.sql)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- hrm_leave_types: Leave type definitions (Annual, Sick, Unpaid, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hrm_leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_days INTEGER NOT NULL DEFAULT 0,
    is_paid BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_leave_types_code_lowercase CHECK (code = LOWER(code)),
    CONSTRAINT chk_leave_types_default_days_positive CHECK (default_days >= 0)
);

-- -----------------------------------------------------------------------------
-- hrm_leave_requests: Employee leave requests with full audit trail
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hrm_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core request data
    employee_id UUID NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.hrm_leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(5,1) NOT NULL,
    reason TEXT,
    
    -- Status (uses existing leave_status enum: pending/approved/rejected/cancelled)
    status public.leave_status NOT NULL DEFAULT 'pending',
    
    -- Submission audit (immutable after INSERT)
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Decision audit (unified for approve/reject)
    decided_by UUID REFERENCES auth.users(id),
    decided_at TIMESTAMPTZ,
    decision_reason TEXT,
    
    -- Cancellation audit
    cancelled_by UUID REFERENCES auth.users(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_leave_end_after_start CHECK (end_date >= start_date),
    CONSTRAINT chk_leave_total_days_positive CHECK (total_days > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON public.hrm_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.hrm_leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.hrm_leave_requests(start_date, end_date);
