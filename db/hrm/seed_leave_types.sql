-- ============================================================================
-- Phase 4.3: Leave Management — Seed Initial Leave Types
-- ============================================================================
-- Execution Order: 5 of 5 (run AFTER rls_leave.sql)
-- ============================================================================

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
