# HRM RLS Test Plan

**Version:** 1.1  
**Phase:** 1 – Step 7D  
**Status:** Ready for Testing  
**Last Updated:** 2025-12-09

---

## 1. Overview

This document is the **canonical RLS test plan** for validating Row-Level Security policies on the SoZaVo HRM system. It covers the 4 core HRM tables and 4 user roles defined in Phase 1.

### Prerequisites

Before executing these tests:

1. **Test users created** in Supabase Authentication ✅
2. **Real UUIDs configured** in seed files ✅
3. **Run seed scripts** in order:
   - `seed_roles.sql`
   - `seed_hrm_test_data.sql`
4. **Verify RLS is enabled** on all 4 tables

### Tables Under Test

| Table | RLS Status | Policies Defined |
|-------|------------|------------------|
| `public.user_roles` | ✅ Enabled | SELECT, INSERT, UPDATE, DELETE |
| `public.hrm_employees` | ✅ Enabled | SELECT, INSERT, UPDATE, DELETE |
| `public.hrm_organization_units` | ✅ Enabled | SELECT, INSERT, UPDATE, DELETE |
| `public.hrm_positions` | ✅ Enabled | SELECT, INSERT, UPDATE, DELETE |

---

## 2. Test Users & Roles

### Real Supabase User IDs

| Role | UUID | Employee Code | Email |
|------|------|---------------|-------|
| `admin` | `185e5b0b-2d3c-4245-a0e3-8c07623c8ad4` | EMP-ADMIN-001 | admin@sozavo.sr |
| `hr_manager` | `4231ee5a-2bc8-47b0-93a0-c9fd172c24e3` | EMP-HR-001 | hr.manager@sozavo.sr |
| `manager` | `a6bffd30-455c-491e-87cf-7a41d5f4fffe` | EMP-MANAGER-001 | manager@sozavo.sr |
| `employee` | `8628fd46-b774-4b5f-91fc-3a8e1ba56d9a` | EMP-EMP-001 | employee@sozavo.sr |

> **Note:** UUIDs are defined in `/db/hrm/seed_roles.sql` and `/db/hrm/seed_hrm_test_data.sql`

### Role Hierarchy

```
admin
  └── Full access to all tables and operations
  
hr_manager
  └── Read all employees, positions, org units
  └── Create/update employees, positions, org units
  └── Cannot delete structural data
  └── Cannot manage role assignments
  
manager
  └── Read direct reports only (via is_manager_of function)
  └── No write access to any HRM table
  
employee
  └── Read own record only
  └── No write access to any HRM table
```

### Manager-Employee Relationship

For testing the `is_manager_of()` function:

- **EMP-MANAGER-001** (manager@sozavo.sr) manages **EMP-EMP-001** (employee@sozavo.sr)
- **EMP-ADMIN-001** (admin@sozavo.sr) manages **EMP-HR-001** (hr.manager@sozavo.sr)

---

## 3. RLS Test Matrix

### 3.1 Table: `public.user_roles`

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| `admin` | ✅ All rows | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `hr_manager` | ✅ All rows | ❌ Denied | ❌ Denied | ❌ Denied |
| `manager` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| `employee` | ✅ Own role only | ❌ Denied | ❌ Denied | ❌ Denied |

**Policies:**
- `user_roles_select_admin`
- `user_roles_select_hr_manager`
- `user_roles_select_own`
- `user_roles_insert_admin`
- `user_roles_update_admin`
- `user_roles_delete_admin`

### 3.2 Table: `public.hrm_employees`

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| `admin` | ✅ All rows | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `hr_manager` | ✅ All rows | ✅ Allowed | ✅ Allowed | ❌ Denied |
| `manager` | ✅ Direct reports only | ❌ Denied | ❌ Denied | ❌ Denied |
| `employee` | ✅ Own record only | ❌ Denied | ❌ Denied | ❌ Denied |

**Policies:**
- `hrm_employees_select_admin`
- `hrm_employees_select_hr_manager`
- `hrm_employees_select_manager`
- `hrm_employees_select_own`
- `hrm_employees_insert_admin`
- `hrm_employees_insert_hr_manager`
- `hrm_employees_update_admin`
- `hrm_employees_update_hr_manager`
- `hrm_employees_delete_admin`

### 3.3 Table: `public.hrm_organization_units`

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| `admin` | ✅ All rows | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `hr_manager` | ✅ All rows | ✅ Allowed | ✅ Allowed | ❌ Denied |
| `manager` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| `employee` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |

**Policies:**
- `org_units_select_admin`
- `org_units_select_hr`
- `org_units_insert_admin`
- `org_units_insert_hr`
- `org_units_update_admin`
- `org_units_update_hr`
- `org_units_delete_admin`

### 3.4 Table: `public.hrm_positions`

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| `admin` | ✅ All rows | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `hr_manager` | ✅ All rows | ✅ Allowed | ✅ Allowed | ❌ Denied |
| `manager` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| `employee` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |

**Policies:**
- `positions_select_admin`
- `positions_select_hr`
- `positions_insert_admin`
- `positions_insert_hr`
- `positions_update_admin`
- `positions_update_hr`
- `positions_delete_admin`

---

## 4. Scenario-Based Tests

### 4.1 Admin Role Tests

**Test A1: Admin can view all employees**
```sql
-- Run as: admin@sozavo.sr
SELECT * FROM public.hrm_employees;
-- Expected: Returns all 4 employee records
```

**Test A2: Admin can create a new employee**
```sql
-- Run as: admin@sozavo.sr
INSERT INTO public.hrm_employees (employee_code, user_id, first_name, last_name, email, employment_status, hire_date)
VALUES ('EMP-TEST-001', gen_random_uuid(), 'Test', 'Employee', 'test@sozavo.sr', 'active', CURRENT_DATE);
-- Expected: Insert succeeds
```

**Test A3: Admin can assign roles**
```sql
-- Run as: admin@sozavo.sr
INSERT INTO public.user_roles (user_id, role)
VALUES ('some-new-user-uuid', 'employee');
-- Expected: Insert succeeds
```

**Test A4: Admin can delete org unit**
```sql
-- Run as: admin@sozavo.sr
DELETE FROM public.hrm_organization_units WHERE code = 'test_unit';
-- Expected: Delete succeeds (if test_unit exists)
```

### 4.2 HR Manager Role Tests

**Test H1: HR Manager can view all employees**
```sql
-- Run as: hr.manager@sozavo.sr
SELECT * FROM public.hrm_employees;
-- Expected: Returns all 4 employee records
```

**Test H2: HR Manager can update employee status**
```sql
-- Run as: hr.manager@sozavo.sr
UPDATE public.hrm_employees 
SET employment_status = 'on_leave' 
WHERE employee_code = 'EMP-EMP-001';
-- Expected: Update succeeds
```

**Test H3: HR Manager cannot delete employee**
```sql
-- Run as: hr.manager@sozavo.sr
DELETE FROM public.hrm_employees WHERE employee_code = 'EMP-TEST-001';
-- Expected: Delete DENIED (0 rows affected)
```

**Test H4: HR Manager cannot assign roles**
```sql
-- Run as: hr.manager@sozavo.sr
INSERT INTO public.user_roles (user_id, role)
VALUES ('some-user-uuid', 'manager');
-- Expected: Insert DENIED
```

**Test H5: HR Manager cannot delete positions**
```sql
-- Run as: hr.manager@sozavo.sr
DELETE FROM public.hrm_positions WHERE code = 'staff_volkshuisvesting';
-- Expected: Delete DENIED (0 rows affected)
```

### 4.3 Manager Role Tests

**Test M1: Manager can view direct reports only**
```sql
-- Run as: manager@sozavo.sr
SELECT * FROM public.hrm_employees;
-- Expected: Returns only EMP-EMP-001 (direct report) + possibly own record
```

**Test M2: Manager cannot view other employees**
```sql
-- Run as: manager@sozavo.sr
SELECT * FROM public.hrm_employees WHERE employee_code = 'EMP-HR-001';
-- Expected: Returns 0 rows (not a direct report)
```

**Test M3: Manager cannot update employees**
```sql
-- Run as: manager@sozavo.sr
UPDATE public.hrm_employees SET phone = '+597 9999999' WHERE employee_code = 'EMP-EMP-001';
-- Expected: Update DENIED (0 rows affected)
```

**Test M4: Manager cannot view organization units**
```sql
-- Run as: manager@sozavo.sr
SELECT * FROM public.hrm_organization_units;
-- Expected: Returns 0 rows
```

**Test M5: Manager cannot view positions**
```sql
-- Run as: manager@sozavo.sr
SELECT * FROM public.hrm_positions;
-- Expected: Returns 0 rows
```

**Test M6: Manager cannot view user_roles**
```sql
-- Run as: manager@sozavo.sr
SELECT * FROM public.user_roles;
-- Expected: Returns 0 rows
```

### 4.4 Employee Role Tests

**Test E1: Employee can view own record only**
```sql
-- Run as: employee@sozavo.sr
SELECT * FROM public.hrm_employees;
-- Expected: Returns only 1 row (EMP-EMP-001)
```

**Test E2: Employee cannot view other employees**
```sql
-- Run as: employee@sozavo.sr
SELECT * FROM public.hrm_employees WHERE employee_code = 'EMP-MANAGER-001';
-- Expected: Returns 0 rows
```

**Test E3: Employee cannot update own record**
```sql
-- Run as: employee@sozavo.sr
UPDATE public.hrm_employees SET phone = '+597 1111111' WHERE employee_code = 'EMP-EMP-001';
-- Expected: Update DENIED (0 rows affected)
```

**Test E4: Employee can view own role**
```sql
-- Run as: employee@sozavo.sr
SELECT * FROM public.user_roles;
-- Expected: Returns 1 row (own role assignment only)
```

**Test E5: Employee cannot view organization units**
```sql
-- Run as: employee@sozavo.sr
SELECT * FROM public.hrm_organization_units;
-- Expected: Returns 0 rows
```

**Test E6: Employee cannot insert anything**
```sql
-- Run as: employee@sozavo.sr
INSERT INTO public.hrm_employees (employee_code, first_name, last_name, email, employment_status, hire_date)
VALUES ('HACK-001', 'Hacker', 'Attempt', 'hack@evil.com', 'active', CURRENT_DATE);
-- Expected: Insert DENIED
```

---

## 5. Negative Security Tests

### 5.1 Anonymous Access

**Test N1: Anonymous user cannot access any table**
```sql
-- Run as: unauthenticated (no session)
SELECT * FROM public.hrm_employees;
-- Expected: Error or 0 rows (RLS denies all)
```

### 5.2 Privilege Escalation Attempts

**Test N2: Employee cannot escalate to admin**
```sql
-- Run as: employee@sozavo.sr
INSERT INTO public.user_roles (user_id, role)
VALUES ('8628fd46-b774-4b5f-91fc-3a8e1ba56d9a', 'admin');
-- Expected: Insert DENIED
```

**Test N3: HR Manager cannot grant admin role**
```sql
-- Run as: hr.manager@sozavo.sr
INSERT INTO public.user_roles (user_id, role)
VALUES ('4231ee5a-2bc8-47b0-93a0-c9fd172c24e3', 'admin');
-- Expected: Insert DENIED
```

### 5.3 Cross-Tenant Access (if applicable)

**Test N4: User cannot access records via SQL injection in employee_code**
```sql
-- Verify parameterized queries are used in application code
-- RLS should block access regardless of query manipulation
```

---

## 6. Known Limitations

1. **Future Modules**: No RLS tests yet for:
   - Leave management (Phase 4)
   - Attendance tracking (Phase 4)
   - Document storage (Phase 5)

2. **Self-Edit Not Implemented**: Employees cannot currently edit their own limited fields (phone, emergency contact). This may be added in a future phase.

3. **Manager Hierarchy Depth**: The `is_manager_of()` function only checks direct reports, not the full management chain.

---

## 7. Test Execution Procedure

### Step 1: Verify Test Users Exist

```sql
SELECT id, email FROM auth.users 
WHERE email IN ('admin@sozavo.sr', 'hr.manager@sozavo.sr', 'manager@sozavo.sr', 'employee@sozavo.sr')
ORDER BY email;
```

### Step 2: Run Seed Scripts

Execute in Supabase SQL Editor (in order):
1. `seed_roles.sql`
2. `seed_hrm_test_data.sql`

### Step 3: Verify Data

```sql
SELECT ur.user_id, au.email, ur.role 
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
ORDER BY ur.role;
```

### Step 4: Execute Tests

Use Supabase SQL Editor with "Run as" user simulation, or use the Supabase JS client with each user's session.

---

## 8. Test Results Template

| Test ID | Description | Role | Expected | Actual | Pass/Fail |
|---------|-------------|------|----------|--------|-----------|
| A1 | Admin view all employees | admin | 4 rows | | |
| A2 | Admin create employee | admin | Success | | |
| H1 | HR view all employees | hr_manager | 4 rows | | |
| H3 | HR delete employee | hr_manager | Denied | | |
| M1 | Manager view direct reports | manager | 1-2 rows | | |
| E1 | Employee view own record | employee | 1 row | | |
| N2 | Employee escalate to admin | employee | Denied | | |

---

## 9. Next Steps

After completing RLS testing:

1. **Phase 2**: Begin Core HR Module UI implementation
2. **Future Phases**: Add RLS for leave, attendance, and document modules

---

*Document maintained by: SoZaVo HRM Development Team*
