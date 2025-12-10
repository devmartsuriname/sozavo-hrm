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

### Employee Directory (`/hrm/employees`)

The first HRM UI screen implemented in Phase 2:

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/employees/page.tsx` | Employee Directory page component |
| `src/services/hrmEmployeeService.ts` | Supabase data access for hrm_employees |
| `src/hooks/useHrmEmployees.ts` | React hook for loading employees |
| `src/types/hrm.ts` | TypeScript types for HRM module |

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

## Next Steps

- Phase 2 continues with additional HRM screens and features
