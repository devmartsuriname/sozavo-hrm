-- =============================================================================
-- HRM ENUM DEFINITIONS
-- =============================================================================
-- Purpose: Define all custom enum types for the HRM system.
-- Run Order: 1 (before schema.sql)
-- Idempotent: Yes (uses DO $$ IF NOT EXISTS pattern)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- app_role: User roles for RBAC
-- Used by: user_roles table
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'admin',        -- Full system access
            'hr_manager',   -- HR department management
            'manager',      -- Team/department manager
            'employee'      -- Regular employee (default)
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- employment_status: Employee employment state
-- Used by: hrm_employees table
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
        CREATE TYPE public.employment_status AS ENUM (
            'active',       -- Currently employed
            'inactive',     -- Temporarily inactive
            'on_leave',     -- On extended leave
            'terminated'    -- Employment ended
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- leave_status: Leave request status
-- Used by: hrm_leave_requests table (future)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE public.leave_status AS ENUM (
            'pending',      -- Awaiting approval
            'approved',     -- Approved by manager/HR
            'rejected',     -- Rejected
            'cancelled'     -- Cancelled by employee
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- attendance_status: Daily attendance state
-- Used by: hrm_attendance table (future)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE public.attendance_status AS ENUM (
            'present',      -- Present for work
            'absent',       -- Absent without leave
            'late',         -- Arrived late
            'half_day',     -- Half day attendance
            'on_leave'      -- On approved leave
        );
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- document_type: Employee document classification
-- Used by: hrm_documents table (future)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE public.document_type AS ENUM (
            'contract',     -- Employment contract
            'id_document',  -- ID card, passport, etc.
            'certificate',  -- Certifications, diplomas
            'resume',       -- CV/Resume
            'other'         -- Other documents
        );
    END IF;
END
$$;

-- =============================================================================
-- END OF ENUM DEFINITIONS
-- =============================================================================
