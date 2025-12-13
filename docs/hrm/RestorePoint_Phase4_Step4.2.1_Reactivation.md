# Restore Point — Phase 4.2.1: Reactivation + Audit Guardrails

> **Created:** 2025-12-13  
> **Phase:** 4.2.1  
> **Purpose:** Document state before implementing employee reactivation with audit guardrails

---

## Schema Snapshot (Before Phase 4.2.1)

### hrm_employees Table — 20 Columns

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| employee_code | varchar | NOT NULL | — |
| first_name | varchar | NOT NULL | — |
| last_name | varchar | NOT NULL | — |
| email | varchar | NOT NULL | — |
| phone | varchar | YES | — |
| org_unit_id | uuid | YES | — |
| position_id | uuid | YES | — |
| manager_id | uuid | YES | — |
| employment_status | employment_status | NOT NULL | 'active' |
| hire_date | date | YES | — |
| termination_date | date | YES | — |
| is_active | boolean | NOT NULL | true |
| created_at | timestamptz | NOT NULL | now() |
| created_by | uuid | YES | — |
| updated_at | timestamptz | NOT NULL | now() |
| updated_by | uuid | YES | — |
| terminated_by | uuid | YES | — |
| termination_reason | text | YES | — |
| user_id | uuid | YES | — |

---

## New Columns Added (Phase 4.2.1)

| Column | Type | Purpose |
|--------|------|---------|
| terminated_at | timestamptz | Immutable timestamp for cooldown logic |
| reactivated_by | uuid | User who reactivated (audit trail) |
| reactivated_at | timestamptz | Timestamp of reactivation |
| reactivation_reason | text | Reason for reactivation (compliance) |

---

## New Trigger Added

### `trg_employee_update_guardrails`

**Function:** `public.enforce_employee_update_guardrails()`

**Guardrails:**
1. Manager cannot update orphan employees (`OLD.org_unit_id IS NULL`)
2. Manager cannot change `org_unit_id`
3. Manager cannot modify terminated records
4. HR Manager must provide `reactivation_reason` to reactivate
5. Cooldown: if `terminated_at` < 5 minutes ago, reason required (even for Admin)

---

## RLS Policies (Unchanged)

The following UPDATE policies remain unchanged:
- `hrm_employees_update_admin`
- `hrm_employees_update_hr_manager`
- `hrm_employees_update_manager`
- `hrm_employees_update_employee`

---

## Files Modified

### Service Layer
- `src/services/hrmEmployeeService.ts` — Refactored `terminateEmployee()`, added `reactivateEmployee()`

### Hooks
- `src/hooks/useTerminateEmployee.ts` — Removed userId parameter
- `src/hooks/useReactivateEmployee.ts` — New hook
- `src/hooks/usePermissions.ts` — Added `canReactivateEmployee()`

### Types
- `src/types/hrm.ts` — Added reactivation fields to `HrmEmployeeRow`

### UI Components
- `src/components/hrm/ReactivateEmployeeModal.tsx` — New modal
- `src/app/(admin)/hrm/employees/EmployeeDetailPage.tsx` — Reactivate button + unified history card

---

## Rollback Steps

### 1. Remove Trigger
```sql
DROP TRIGGER IF EXISTS trg_employee_update_guardrails ON public.hrm_employees;
DROP FUNCTION IF EXISTS public.enforce_employee_update_guardrails();
```

### 2. Remove Columns
```sql
ALTER TABLE public.hrm_employees
DROP COLUMN IF EXISTS terminated_at,
DROP COLUMN IF EXISTS reactivated_by,
DROP COLUMN IF EXISTS reactivated_at,
DROP COLUMN IF EXISTS reactivation_reason;
```

### 3. Restore Service Layer
- Revert `terminateEmployee()` to accept `terminatedByUserId` parameter
- Delete `reactivateEmployee()` function

### 4. Restore Hooks
- Revert `useTerminateEmployee.ts` to use `useSupabaseAuth()` for user.id
- Delete `useReactivateEmployee.ts`

### 5. Restore UI
- Remove Reactivate button from EmployeeDetailPage
- Restore separate "Termination Information" card

---

## Security Verification

| Check | Status |
|-------|--------|
| terminateEmployee() server-validated | ✅ |
| reactivateEmployee() server-validated | ✅ |
| Manager guardrails enforced at DB level | ✅ |
| HR Manager reason requirement at DB level | ✅ |
| Cooldown uses terminated_at (immutable) | ✅ |
| Terminated fields never cleared on reactivation | ✅ |
