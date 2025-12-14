# Restore Point — Phase 4.3: Leave Management

**Created:** 2025-12-14  
**Purpose:** Schema snapshot and rollback SQL before Phase 4.3 implementation

---

## 1. Current HRM Schema Snapshot (Pre-Phase 4.3)

### Enums (5 total)
```sql
-- Existing enums in public schema
app_role: 'admin' | 'hr_manager' | 'manager' | 'employee'
employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated'
leave_status: 'pending' | 'approved' | 'rejected' | 'cancelled'  -- Will be used by Phase 4.3
attendance_status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
document_type: 'contract' | 'id_document' | 'certificate' | 'resume' | 'other'
```

### Tables (4 total)
1. `public.user_roles` — RBAC role assignments
2. `public.hrm_organization_units` — Organizational hierarchy
3. `public.hrm_positions` — Job positions
4. `public.hrm_employees` — Employee records (with termination/reactivation audit fields)

### Security Definer Functions (11 total)
- `get_current_user_id()`, `has_role()`, `get_user_roles()`
- `user_is_admin()`, `user_is_hr_manager()`, `user_is_manager()`, `user_is_employee()`
- `get_user_org_unit()`, `is_manager_of()`, `get_employee_record()`, `get_manager_chain()`

---

## 2. Existing RLS Policy Summary

### user_roles (7 policies)
- SELECT: admin, hr_manager, own
- INSERT/UPDATE/DELETE: admin only

### hrm_employees (16 policies)
- SELECT: admin, hr_manager, manager (direct reports), own
- INSERT: admin, hr_manager
- UPDATE: admin, hr_manager, manager (scoped)
- DELETE: admin only

### hrm_organization_units (16 policies)
- SELECT: admin, hr_manager, manager (own unit)
- INSERT: admin, hr_manager
- UPDATE: admin, hr_manager, manager (own unit)
- DELETE: admin only

### hrm_positions (16 policies)
- SELECT: admin, hr_manager, manager (own unit positions)
- INSERT: admin, hr_manager
- UPDATE: admin, hr_manager, manager (own unit positions)
- DELETE: admin only

---

## 3. Phase 4.3 Rollback SQL

Execute this SQL to completely remove all Phase 4.3 objects:

```sql
-- ============================================================================
-- PHASE 4.3 ROLLBACK — Execute in reverse order of creation
-- ============================================================================

-- Step 1: Drop triggers
DROP TRIGGER IF EXISTS trg_leave_requests_before_write ON public.hrm_leave_requests;
DROP TRIGGER IF EXISTS trg_leave_types_updated_at ON public.hrm_leave_types;

-- Step 2: Drop RLS policies for hrm_leave_requests
DROP POLICY IF EXISTS "leave_requests_select_admin" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_select_hr_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_select_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_select_employee" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_admin" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_hr_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_employee" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_admin" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_hr_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_employee" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_admin" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_hr_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_manager" ON public.hrm_leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_employee" ON public.hrm_leave_requests;

-- Step 3: Drop RLS policies for hrm_leave_types
DROP POLICY IF EXISTS "leave_types_select_admin" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_select_hr_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_select_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_select_employee" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_insert_admin" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_insert_hr_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_insert_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_insert_employee" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_update_admin" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_update_hr_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_update_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_update_employee" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_delete_admin" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_delete_hr_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_delete_manager" ON public.hrm_leave_types;
DROP POLICY IF EXISTS "leave_types_delete_employee" ON public.hrm_leave_types;

-- Step 4: Disable RLS
ALTER TABLE public.hrm_leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_leave_types DISABLE ROW LEVEL SECURITY;

-- Step 5: Drop tables (order matters due to FK)
DROP TABLE IF EXISTS public.hrm_leave_requests;
DROP TABLE IF EXISTS public.hrm_leave_types;

-- Step 6: Drop trigger functions
DROP FUNCTION IF EXISTS public.leave_requests_before_write();

-- Step 7: Drop security definer functions
DROP FUNCTION IF EXISTS public.get_employee_id(uuid);
DROP FUNCTION IF EXISTS public.is_leave_request_owner(uuid, uuid);
DROP FUNCTION IF EXISTS public.can_approve_leave_request(uuid, uuid);

-- ============================================================================
-- ROLLBACK COMPLETE — Database restored to pre-Phase 4.3 state
-- ============================================================================
```

---

## 4. Verification After Rollback

After executing rollback SQL, verify:
1. `SELECT * FROM pg_tables WHERE tablename LIKE 'hrm_leave%';` → Should return 0 rows
2. `SELECT proname FROM pg_proc WHERE proname IN ('get_employee_id', 'is_leave_request_owner', 'can_approve_leave_request');` → Should return 0 rows
3. Existing HRM tables (hrm_employees, hrm_organization_units, hrm_positions) should be unaffected
