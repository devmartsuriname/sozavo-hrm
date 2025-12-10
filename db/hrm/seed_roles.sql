-- =============================================================================
-- HRM SEED DATA: Test Roles for RLS Validation
-- =============================================================================
-- Purpose: Insert role assignments for test users to validate RLS policies.
-- Run Order: 4 (after functions.sql)
-- Dependencies: enums.sql, schema.sql must be run first
-- Note: This file is IDEMPOTENT - safe to run multiple times
-- =============================================================================

-- -----------------------------------------------------------------------------
-- REAL SUPABASE USER IDs
-- -----------------------------------------------------------------------------
-- These UUIDs are linked to actual auth.users created in Supabase Authentication.
--
-- ADMIN_USER_ID:        185e5b0b-2d3c-4245-a0e3-8c07623c8ad4  (admin@sozavo.sr)
-- HR_MANAGER_USER_ID:   4231ee5a-2bc8-47b0-93a0-c9fd172c24e3  (hr.manager@sozavo.sr)
-- MANAGER_USER_ID:      a6bffd30-455c-491e-87cf-7a41d5f4fffe  (manager@sozavo.sr)
-- EMPLOYEE_USER_ID:     8628fd46-b774-4b5f-91fc-3a8e1ba56d9a  (employee@sozavo.sr)
--
-- To verify these IDs:
--   SELECT id, email FROM auth.users WHERE email IN (
--     'admin@sozavo.sr', 'hr.manager@sozavo.sr', 'manager@sozavo.sr', 'employee@sozavo.sr'
--   );
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- ADMIN ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The admin user has full system access across all HRM modules.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '185e5b0b-2d3c-4245-a0e3-8c07623c8ad4'::UUID, 'admin'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '185e5b0b-2d3c-4245-a0e3-8c07623c8ad4'::UUID 
      AND role = 'admin'::public.app_role
);

-- -----------------------------------------------------------------------------
-- HR MANAGER ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The HR manager can view/edit employees and positions but cannot delete
-- structural data or manage role assignments.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '4231ee5a-2bc8-47b0-93a0-c9fd172c24e3'::UUID, 'hr_manager'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '4231ee5a-2bc8-47b0-93a0-c9fd172c24e3'::UUID 
      AND role = 'hr_manager'::public.app_role
);

-- -----------------------------------------------------------------------------
-- MANAGER ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The manager can view their direct reports but has limited write access.
-- Manager visibility is enforced via is_manager_of() function in RLS.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT 'a6bffd30-455c-491e-87cf-7a41d5f4fffe'::UUID, 'manager'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = 'a6bffd30-455c-491e-87cf-7a41d5f4fffe'::UUID 
      AND role = 'manager'::public.app_role
);

-- -----------------------------------------------------------------------------
-- EMPLOYEE ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
-- The employee can only view their own records (self-service access).
-- No write access to HRM structural tables.
-- -----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT '8628fd46-b774-4b5f-91fc-3a8e1ba56d9a'::UUID, 'employee'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '8628fd46-b774-4b5f-91fc-3a8e1ba56d9a'::UUID 
      AND role = 'employee'::public.app_role
);

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================
-- After running this seed, verify role assignments:
--
-- SELECT ur.user_id, au.email, ur.role 
-- FROM public.user_roles ur
-- JOIN auth.users au ON au.id = ur.user_id
-- ORDER BY ur.role;
--
-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
