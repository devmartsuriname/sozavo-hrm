-- =============================================================================
-- HRM SEED DATA: Test Data for RLS Validation
-- =============================================================================
-- Purpose: Insert minimal but realistic HRM data for testing RLS policies.
-- Run Order: 5 (after seed_roles.sql)
-- Dependencies: enums.sql, schema.sql, functions.sql, seed_roles.sql
-- Note: This file is IDEMPOTENT - safe to run multiple times
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PLACEHOLDER USER IDs (must match seed_roles.sql)
-- -----------------------------------------------------------------------------
-- ADMIN_USER_ID:        00000000-0000-0000-0000-000000000001
-- HR_MANAGER_USER_ID:   00000000-0000-0000-0000-000000000002
-- MANAGER_USER_ID:      00000000-0000-0000-0000-000000000003
-- EMPLOYEE_USER_ID:     00000000-0000-0000-0000-000000000004
--
-- Replace these with real auth.users IDs after creating test users.
-- -----------------------------------------------------------------------------

-- =============================================================================
-- SECTION 1: ORGANIZATION UNITS
-- =============================================================================
-- SoZaVo organizational hierarchy:
--   SoZaVo HQ (root)
--   ├── HR Department
--   └── Volkshuisvesting Department
-- =============================================================================

-- 1.1 Root Organization Unit: SoZaVo HQ
INSERT INTO public.hrm_organization_units (id, code, name, parent_id)
SELECT 
    gen_random_uuid(),
    'sozavo_hq',
    'SoZaVo Hoofdkantoor',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_organization_units WHERE code = 'sozavo_hq'
);

-- 1.2 HR Department (child of HQ)
INSERT INTO public.hrm_organization_units (id, code, name, parent_id)
SELECT 
    gen_random_uuid(),
    'sozavo_hr',
    'Afdeling Human Resources',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hq')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_organization_units WHERE code = 'sozavo_hr'
);

-- 1.3 Volkshuisvesting Department (child of HQ)
INSERT INTO public.hrm_organization_units (id, code, name, parent_id)
SELECT 
    gen_random_uuid(),
    'sozavo_volkshuisvesting',
    'Afdeling Volkshuisvesting',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hq')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting'
);

-- =============================================================================
-- SECTION 2: POSITIONS
-- =============================================================================
-- Positions mapped to roles for testing:
--   - HR Director        → linked to HR Department (for admin user)
--   - HR Officer         → linked to HR Department (for hr_manager user)
--   - Department Manager → linked to Volkshuisvesting (for manager user)
--   - Staff Member       → linked to Volkshuisvesting (for employee user)
-- =============================================================================

-- 2.1 HR Director (Admin-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'hr_director',
    'Directeur Human Resources',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'hr_director'
);

-- 2.2 HR Officer (HR Manager-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'hr_officer',
    'HR Medewerker',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'hr_officer'
);

-- 2.3 Department Manager Volkshuisvesting (Manager-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'dept_manager_volkshuisvesting',
    'Afdelingshoofd Volkshuisvesting',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'dept_manager_volkshuisvesting'
);

-- 2.4 Staff Member (Employee-level position)
INSERT INTO public.hrm_positions (id, code, title, org_unit_id)
SELECT 
    gen_random_uuid(),
    'staff_volkshuisvesting',
    'Medewerker Volkshuisvesting',
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting')
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_positions WHERE code = 'staff_volkshuisvesting'
);

-- =============================================================================
-- SECTION 3: EMPLOYEES
-- =============================================================================
-- Test employees mapped 1:1 with placeholder user IDs:
--   - EMP-ADMIN-001   → Admin user (HR Director)
--   - EMP-HR-001      → HR Manager user (HR Officer)
--   - EMP-MANAGER-001 → Manager user (Dept Manager Volkshuisvesting)
--   - EMP-EMP-001     → Employee user (Staff Member, reports to Manager)
-- =============================================================================

-- 3.1 Admin Employee (HR Director)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-ADMIN-001',
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Karel',
    'Adminstra',
    'admin@sozavo.sr',
    '+597 8001001',
    (SELECT id FROM public.hrm_positions WHERE code = 'hr_director'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr'),
    NULL,  -- No manager (top of hierarchy)
    'active'::public.employment_status,
    '2020-01-15'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-ADMIN-001'
);

-- 3.2 HR Manager Employee (HR Officer)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-HR-001',
    '00000000-0000-0000-0000-000000000002'::UUID,
    'Sandra',
    'Personeelszaken',
    'hr.manager@sozavo.sr',
    '+597 8001002',
    (SELECT id FROM public.hrm_positions WHERE code = 'hr_officer'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_hr'),
    (SELECT id FROM public.hrm_employees WHERE employee_code = 'EMP-ADMIN-001'),  -- Reports to Admin
    'active'::public.employment_status,
    '2021-03-01'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-HR-001'
);

-- 3.3 Manager Employee (Department Manager Volkshuisvesting)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-MANAGER-001',
    '00000000-0000-0000-0000-000000000003'::UUID,
    'Ricardo',
    'Leidinggevende',
    'manager@sozavo.sr',
    '+597 8001003',
    (SELECT id FROM public.hrm_positions WHERE code = 'dept_manager_volkshuisvesting'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting'),
    NULL,  -- No manager (department head)
    'active'::public.employment_status,
    '2019-06-01'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-MANAGER-001'
);

-- 3.4 Employee (Staff Member Volkshuisvesting)
INSERT INTO public.hrm_employees (
    id, employee_code, user_id, first_name, last_name, email, phone,
    position_id, org_unit_id, manager_id, employment_status, hire_date
)
SELECT 
    gen_random_uuid(),
    'EMP-EMP-001',
    '00000000-0000-0000-0000-000000000004'::UUID,
    'Maria',
    'Werknemer',
    'employee@sozavo.sr',
    '+597 8001004',
    (SELECT id FROM public.hrm_positions WHERE code = 'staff_volkshuisvesting'),
    (SELECT id FROM public.hrm_organization_units WHERE code = 'sozavo_volkshuisvesting'),
    (SELECT id FROM public.hrm_employees WHERE employee_code = 'EMP-MANAGER-001'),  -- Reports to Manager
    'active'::public.employment_status,
    '2022-09-15'::DATE
WHERE NOT EXISTS (
    SELECT 1 FROM public.hrm_employees WHERE employee_code = 'EMP-EMP-001'
);

-- =============================================================================
-- VERIFICATION QUERIES (for manual validation after running this seed)
-- =============================================================================
-- Run these queries to verify the seed data was inserted correctly:
--
-- SELECT code, name, parent_id FROM public.hrm_organization_units ORDER BY code;
-- SELECT code, title, org_unit_id FROM public.hrm_positions ORDER BY code;
-- SELECT employee_code, first_name, last_name, email, user_id FROM public.hrm_employees ORDER BY employee_code;
-- SELECT user_id, role FROM public.user_roles ORDER BY user_id;
--
-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
