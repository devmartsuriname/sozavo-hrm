-- =============================================================================
-- HRM SEED DATA: Test Roles for RLS Validation
-- =============================================================================
-- Purpose: Insert role assignments for test users to validate RLS policies.
-- Run Order: 4 (after functions.sql)
-- Dependencies: enums.sql, schema.sql must be run first
-- Note: This file is IDEMPOTENT - safe to run multiple times
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PLACEHOLDER USER IDs
-- -----------------------------------------------------------------------------
-- These UUIDs are placeholders that MUST be replaced with real auth.users IDs
-- after creating actual test users in Supabase Authentication.
--
-- ADMIN_USER_ID:        00000000-0000-0000-0000-000000000001
-- HR_MANAGER_USER_ID:   00000000-0000-0000-0000-000000000002
-- MANAGER_USER_ID:      00000000-0000-0000-0000-000000000003
-- EMPLOYEE_USER_ID:     00000000-0000-0000-0000-000000000004
--
-- To find real user IDs after signup:
--   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
-- Then update the placeholder UUIDs in this file with the real IDs.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- ADMIN ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The admin user has full system access across all HRM modules.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '00000000-0000-0000-0000-000000000001'::UUID, 'admin'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID 
      AND role = 'admin'::public.app_role
);

-- -----------------------------------------------------------------------------
-- HR MANAGER ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The HR manager can view/edit employees and positions but cannot delete
-- structural data or manage role assignments.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '00000000-0000-0000-0000-000000000002'::UUID, 'hr_manager'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000002'::UUID 
      AND role = 'hr_manager'::public.app_role
);

-- -----------------------------------------------------------------------------
-- MANAGER ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The manager can view their direct reports but has limited write access.
-- Manager visibility is enforced via is_manager_of() function in RLS.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '00000000-0000-0000-0000-000000000003'::UUID, 'manager'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000003'::UUID 
      AND role = 'manager'::public.app_role
);

-- -----------------------------------------------------------------------------
-- EMPLOYEE ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The employee can only view their own records (self-service access).
-- No write access to HRM structural tables.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '00000000-0000-0000-0000-000000000004'::UUID, 'employee'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000004'::UUID 
      AND role = 'employee'::public.app_role
);

-- =============================================================================
-- ONBOARDING INSTRUCTIONS
-- =============================================================================
-- After creating real test users in Supabase Authentication:
--
-- 1. Create 4 test users in Supabase Dashboard → Authentication → Users
--    - admin@sozavo.sr
--    - hr.manager@sozavo.sr
--    - manager@sozavo.sr
--    - employee@sozavo.sr
--
-- 2. Find their user IDs:
--    SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
--
-- 3. Replace the placeholder UUIDs in this file with the real IDs.
--
-- 4. Re-run this seed file to update role assignments.
--
-- 5. Also update /db/hrm/seed_hrm_test_data.sql with the same real IDs.
--
-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
