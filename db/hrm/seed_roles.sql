-- =============================================================================
-- HRM SEED DATA: Default Roles
-- =============================================================================
-- Purpose: Insert default admin role for initial system setup.
-- Run Order: 4 (after functions.sql)
-- Dependencies: enums.sql, schema.sql must be run first
-- Note: This file is IDEMPOTENT - safe to run multiple times
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PLACEHOLDER ADMIN ROLE
-- -----------------------------------------------------------------------------
-- During initial onboarding, replace the placeholder UUID with the actual
-- first admin user's UUID from auth.users.
--
-- To find a user's UUID after they sign up:
--   SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
--
-- Then update the INSERT below with the real UUID.
-- -----------------------------------------------------------------------------

-- Placeholder admin role assignment
-- Replace '00000000-0000-0000-0000-000000000000' with actual admin user_id
INSERT INTO public.user_roles (user_id, role)
SELECT '00000000-0000-0000-0000-000000000000'::UUID, 'admin'::public.app_role
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000000'::UUID 
      AND role = 'admin'::public.app_role
);

-- =============================================================================
-- ONBOARDING INSTRUCTIONS
-- =============================================================================
-- After the first real admin user signs up:
--
-- 1. Find their user_id:
--    SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
--
-- 2. Insert their admin role:
--    INSERT INTO public.user_roles (user_id, role)
--    VALUES ('<actual-user-uuid>', 'admin');
--
-- 3. Optionally delete the placeholder:
--    DELETE FROM public.user_roles 
--    WHERE user_id = '00000000-0000-0000-0000-000000000000';
--
-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
