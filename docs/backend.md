# SoZaVo HRM Backend Documentation

## Overview

The SoZaVo HRM system uses Supabase as its backend, providing:
- PostgreSQL database with Row-Level Security (RLS)
- Supabase Auth for user authentication
- Role-based access control via `public.user_roles` table

## Database Schema

See `/db/hrm/` for version-controlled SQL files:
- `enums.sql` - Enum type definitions (app_role, employment_status, etc.)
- `schema.sql` - Table definitions
- `functions.sql` - Security definer functions for RLS
- `rls_policies.sql` - Row-level security policies
- `seed_roles.sql` - Test role assignments
- `seed_hrm_test_data.sql` - Test data for RLS validation

## Authentication Architecture

### Current State (Phase 7C - Cleanup Complete)

The Supabase auth infrastructure is now **fully wired into the runtime** and legacy code has been removed:

#### 1. Type Definitions (`src/types/supabase-auth.ts`)
- `AppRole` - Mirrors `public.app_role` enum ('admin' | 'hr_manager' | 'manager' | 'employee')
- `AuthStatus` - Authentication state machine ('idle' | 'checking' | 'authenticated' | 'unauthenticated')
- `AuthContextState` - Complete auth context shape with user, session, roles, and permission flags

#### 2. Role Service (`src/services/roleService.ts`)
- `fetchUserRoles(userId)` - Fetches roles from `public.user_roles` via RLS-protected query
- `hasRole(roles, role)` - Checks if a specific role is present
- `deriveRoleFlags(roles)` - Derives `isAdmin`, `isHRManager`, `isManager`, `isEmployee` flags

#### 3. Auth Context (`src/context/SupabaseAuthContext.tsx`)
- `SupabaseAuthProvider` - Manages session and role state
- `useSupabaseAuth()` - Hook to access auth context
- Implements **hybrid failure mode**: session can exist but access is blocked if roles fail to load

### Auth Flow (Phase 7B Complete)

1. **Login**: Uses `supabase.auth.signInWithPassword()` in `useSignIn.ts`
2. **Session Management**: `SupabaseAuthProvider` listens to `onAuthStateChange`
3. **Route Protection**: `router.tsx` checks `status` and `user` from context
4. **Logout**: `signOut()` method clears session and resets state
5. **Role Loading**: Roles fetched from `public.user_roles` after authentication

### Legacy Auth (REMOVED in Phase 7C)

The Darkone fake-backend has been **completely deleted** from the codebase:
- ~~`src/helpers/fake-backend.ts`~~ - **Deleted** (file no longer exists)
- ~~Cookie-based session management~~ - Replaced by Supabase sessions
- ~~Hardcoded demo users~~ - Only real Supabase users work
- `src/types/auth.ts` - Marked as LEGACY (kept for reference only)

Authentication is now handled **exclusively** via:
- Supabase Auth (`supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`)
- SupabaseAuthContext for React state management
- RLS policies using `auth.uid()` for database access control

## Role-Based Access Control

### Role Hierarchy
1. **admin** - Full system access, can delete records
2. **hr_manager** - Manage employees/positions/org units, cannot delete structural data
3. **manager** - View direct reports only
4. **employee** - Self-access only

### RLS Enforcement
- All HRM tables have RLS enabled
- Security definer functions prevent privilege escalation
- See `/db/hrm/rls_policies.sql` for complete policy definitions

### RLS Validation Status

**Validated:** 2025-12-10  
**Status:** ✅ All 25 scenarios passed

The RLS Test Plan (`docs/hrm/HRM_RLS_TestPlan.md`) has been formally executed, validating:
- All 4 core tables: `user_roles`, `hrm_employees`, `hrm_organization_units`, `hrm_positions`
- All 4 roles: admin, hr_manager, manager, employee
- All operations: SELECT, INSERT, UPDATE, DELETE
- Negative security tests: anonymous access denial, privilege escalation prevention

Key verified behaviors:
- Admins have full access to all tables and operations
- HR managers can read/write HRM data but cannot delete structural records or manage roles
- Managers see only their direct reports (via `is_manager_of()` function)
- Employees see only their own record
- All users can view their own role assignment

## HRM UI Screens

### Type Architecture: Row/ViewModel Pattern

HRM types follow a Row/ViewModel pattern where:
- **Row types** match the database schema exactly (`HrmEmployeeRow`)
- **ViewModel types** extend Row types with derived display fields (`HrmEmployeeDirectory`, `HrmEmployeeDetail`)

```typescript
// Row type - matches DB
interface HrmEmployeeRow {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  // ... all DB columns
}

// ViewModel - Row + derived fields
interface HrmEmployeeDirectory extends HrmEmployeeRow {
  fullName: string        // Derived: first_name + ' ' + last_name
  orgUnitName: string | null
  positionTitle: string | null
  managerName: string | null
}

// Detail ViewModel - Row + all derived fields
interface HrmEmployeeDetail extends HrmEmployeeRow {
  fullName: string
  orgUnitName: string | null
  positionTitle: string | null
  managerName: string | null
}
```

### Employee Directory (`/hrm/employees`)

The first HRM UI screen implemented in Phase 2:

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/employees/page.tsx` | Employee Directory page component |
| `src/services/hrmEmployeeService.ts` | Supabase data access for hrm_employees |
| `src/hooks/useHrmEmployees.ts` | React hook for loading employees |
| `src/types/hrm.ts` | TypeScript types for HRM module |

### Employee Detail View (`/hrm/employees/:employeeId`)

Read-only profile view for a single employee (Phase 2 – Step 4):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/employees/EmployeeDetailPage.tsx` | Employee Detail page component |
| `src/hooks/useHrmEmployeeDetail.ts` | React hook for loading single employee |
| `fetchEmployeeDetail()` in service | Fetch single employee with derived fields |

The detail route is a **hidden/internal route** (not shown in sidebar), accessible via employee code links from the directory.

### Service Functions

The HRM Employee Service (`src/services/hrmEmployeeService.ts`) provides two main functions:

| Function | Description |
|----------|-------------|
| `fetchEmployeeDirectory()` | Returns `HrmEmployeeDirectory[]` for table listing |
| `fetchEmployeeDetail(id)` | Returns `HrmEmployeeDetail \| null` for single employee |

Both functions use the **parallel-fetch + merge pattern**:
1. Execute multiple Supabase queries in parallel via `Promise.all()`
2. Build lookup Maps for related data (org units, positions, employees)
3. Derive display fields (`fullName`, `orgUnitName`, `positionTitle`, `managerName`)

**RLS-Aware Behavior:**
- Service returns `null` when RLS denies access
- Related table lookups gracefully return `null` when RLS blocks access
- UI displays "Not found or access denied" instead of crashing

### React Hooks (Custom Pattern, No React Query)

The HRM module uses simple custom hooks for data fetching:

| Hook | File | Purpose |
|------|------|---------|
| `useHrmEmployees()` | `src/hooks/useHrmEmployees.ts` | Load employee directory |
| `useHrmEmployeeDetail(id)` | `src/hooks/useHrmEmployeeDetail.ts` | Load single employee |

Pattern: `useState` + `useEffect` with loading/error state management. React Query is NOT used per project constraints.

#### Derived Fields (TypeScript-only, not in DB)

All display-oriented fields are derived in TypeScript via the parallel-fetch + merge pattern:

| Field | Source | Derivation |
|-------|--------|------------|
| `fullName` | `hrm_employees` | `${first_name} ${last_name}` |
| `orgUnitName` | `hrm_organization_units.name` | Lookup by `org_unit_id` |
| `positionTitle` | `hrm_positions.title` | Lookup by `position_id` |
| `managerName` | `hrm_employees` | Lookup by `manager_id` → derive fullName |

```typescript
// In hrmEmployeeService.ts - parallel fetch + merge pattern
const [employeesResult, orgUnitsResult, positionsResult] = await Promise.all([
  supabase.from('hrm_employees').select('...'),
  supabase.from('hrm_organization_units').select('id, name'),
  supabase.from('hrm_positions').select('id, title'),
])

// Build lookup maps
const orgUnitMap = new Map(orgUnitsResult.data.map(ou => [ou.id, ou.name]))
const positionMap = new Map(positionsResult.data.map(p => [p.id, p.title]))
const employeeMap = new Map(employeesResult.data.map(e => [e.id, e]))

// Derive all display fields
const employees = employeesResult.data.map((emp) => ({
  ...emp,
  fullName: `${emp.first_name} ${emp.last_name}`,
  orgUnitName: orgUnitMap.get(emp.org_unit_id) ?? null,
  positionTitle: positionMap.get(emp.position_id) ?? null,
  managerName: emp.manager_id ? deriveFullName(employeeMap.get(emp.manager_id)) : null,
}))
```

#### Client-Side Sorting & Filtering (Phase 2 – Step 3)

The Employee Directory page implements local UX enhancements:

- **Initials Avatar**: Circular badge with first+last initial (e.g., "KA" for Karel Adminstra)
- **Search Filter**: Case-insensitive partial match on code, name, email, org unit, position, manager
- **Column Sorting**: Click headers to sort asc/desc on employee_code, fullName, orgUnitName, positionTitle, managerName, status

These operate on the in-memory array after Supabase returns data, respecting RLS visibility.

## Implementation Status

### Phase 1: ✅ COMPLETE

All 35 tasks completed and verified:
- Database schema with 5 enums and 4 core tables
- 11 security definer functions
- 48+ RLS policies
- Supabase Auth integration
- Test users and seed data

### Phase 2 – Steps 1–4: ✅ IMPLEMENTED_AND_VERIFIED

Manual role-based testing completed 2025-12-10:
- **Admin**: Sees all employees with full organization/position details
- **HR Manager**: Sees all employees with full details
- **Manager**: Sees only direct reports; URL manipulation → "Not found or access denied"
- **Employee**: Sees only own record; URL manipulation → "Not found or access denied"

All screens use Darkone UI patterns (Card, Table, Alert, Spinner) without modification.

### Organization Units (`/hrm/org-units`)

Read-only listing page for organization units (Phase 2 – Step 5):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/org-units/OrgUnitsPage.tsx` | Org Units Directory page |
| `src/services/hrmOrgUnitService.ts` | Supabase data access for hrm_organization_units |
| `src/hooks/useHrmOrgUnits.ts` | React hook for loading org units |

#### Type Architecture

```typescript
// Row type - matches DB schema
interface HrmOrgUnitRow {
  id: string
  code: string
  name: string
  description: string | null
  parent_id: string | null
  is_active: boolean
  // ... audit columns
}

// ViewModel - Row + derived fields
interface HrmOrgUnitDirectory extends HrmOrgUnitRow {
  parentOrgUnitName: string | null  // Lookup from parent_id
}
```

#### Service Function

The `fetchOrgUnits()` function in `hrmOrgUnitService.ts`:
- Fetches all org units in a single query
- Builds a self-join Map for parent name resolution
- Returns empty array when RLS denies access (no crash)

#### React Hook

The `useHrmOrgUnits()` hook follows the same pattern as `useHrmEmployees()`:
- `useState` + `useEffect` with loading/error state
- Checks authentication status before fetching
- Returns `{ orgUnits, isLoading, error, refetch }`

#### RLS Behavior

**Access Control:**
- **Admin, HR Manager**: Can see all organization units (3 rows in seed data)
- **Manager, Employee**: Denied access via FALSE policy; UI shows empty state message

The UI gracefully handles 0 rows by displaying: "No organization units available for your role."

## Next Steps

- Phase 2 continues with Positions UI and Employee Edit forms
