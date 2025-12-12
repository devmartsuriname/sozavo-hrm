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

## Users & Roles RPC Function

### `public.get_all_users_with_roles()`

A SECURITY DEFINER function that safely exposes auth.users with their roles and linked employee records for use by the Users & Roles admin screens.

**Function Signature:**
```sql
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  roles app_role[],
  employee_id uuid,
  employee_code text,
  employee_name text
)
```

**Return Columns:**
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | Auth user ID from auth.users |
| `email` | text | User's email address |
| `created_at` | timestamptz | Account creation timestamp |
| `roles` | app_role[] | Array of assigned HRM roles |
| `employee_id` | uuid | Linked employee record ID (nullable) |
| `employee_code` | text | Linked employee code (nullable) |
| `employee_name` | text | Linked employee full name (nullable) |

**Security Model:**
- **SECURITY DEFINER** with `SET search_path = public`
- Reads from `auth.users`, `public.user_roles`, and `public.hrm_employees`
- `EXECUTE` granted to `authenticated` users
- Effective usage restricted to Admin/HR Manager via UI route guards
- RLS on underlying tables (`user_roles`, `hrm_employees`) still applies

**Source File:** `db/hrm/functions_users_with_roles.sql`

### HRM User Service (`src/services/hrmUserService.ts`)

Service functions for user management and role operations:

| Function | Description |
|----------|-------------|
| `fetchUsersWithRolesRpc()` | Uses Supabase RPC to call `get_all_users_with_roles()`. Returns `HrmUserWithRoles[]`. |
| `assignRole(userId, role)` | Inserts into `public.user_roles` if the (userId, role) pair does not already exist. |
| `removeRole(userId, role)` | Deletes the given role-row from `public.user_roles`. |
| `linkUserToEmployee(userId, employeeId)` | Enforces 1:1 mapping: clears `user_id` on any other `hrm_employees` rows for that user, then sets `user_id` on the target employee. |
| `unlinkUserFromEmployee(userId)` | Sets `user_id = null` for any `hrm_employees` rows with that `user_id`. |

**Business Rule (MVP):**
- Any user that holds one of the core HRM roles (`admin`, `hr_manager`, `manager`, `employee`) is expected to be a real SoZaVo staff member with a corresponding `hrm_employees` record.
- External accounts or special roles (like auditors) will be handled post-MVP when the `app_role` enum is extended.

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

### Employee Create Form (`/hrm/employees/create`)

Create form for adding new employees (Phase 2 – Step 10):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/employees/EmployeeCreatePage.tsx` | Employee Create form page |
| `src/hooks/useCreateEmployee.ts` | Hook for creating employee |
| `src/components/hrm/EmployeeFormBase.tsx` | Shared form component (see below) |

Access restricted to Admin and HR Manager roles.

**Auto-Generated Employee Code:** New employees receive a code in the format `EMP-{ORG_PREFIX}-{SEQUENCE}` (e.g., `EMP-HR-005`).

**Default Values:**
- `employment_status`: 'active'
- `is_active`: true
- `hire_date`: current date (YYYY-MM-DD)

### Employee Edit Form (`/hrm/employees/:employeeId/edit`)

Edit form for updating employee records (Phase 2 – Step 9):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/employees/EmployeeEditPage.tsx` | Employee Edit form page (thin wrapper) |
| `src/hooks/useUpdateEmployee.ts` | Hook for updating employee |
| `src/hooks/useEmployeeFormOptions.ts` | Hook for loading form dropdowns |

The edit route is a **hidden/internal route** accessible only via the Edit button on Employee Detail page. Access is restricted to Admin and HR Manager roles - Manager and Employee roles see an "Access denied" message.

### Shared Form Architecture: EmployeeFormBase

Both Create and Edit pages use the shared `EmployeeFormBase` component as the **single source of truth** for employee form logic (Phase 2 – Step 11):

| File | Purpose |
|------|---------|
| `src/components/hrm/EmployeeFormBase.tsx` | Reusable form for create + edit modes |

**Props Interface:**
```typescript
interface EmployeeFormBaseProps {
  mode: 'create' | 'edit'
  initialData?: EmployeeFormData
  employeeCode?: string           // Displayed read-only in edit mode
  currentEmployeeId?: string      // Exclude from manager dropdown
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError?: string | null
  orgUnits: SelectOption[]
  positions: SelectOption[]
  employees: SelectOption[]       // For manager dropdown
}
```

**Centralized in EmployeeFormBase:**
- Form layout (Contact, Organization, Employment cards)
- Field-level validation (required fields, email format)
- Business rules (Rule A: terminated ⇒ inactive, Rule B: termination date + active = error)
- UI state for locked fields

**Page-Level Responsibilities:**
| Responsibility | EmployeeCreatePage | EmployeeEditPage |
|----------------|--------------------|--------------------|
| Access control guard | ✅ | ✅ |
| Fetch existing data | — | `useHrmEmployeeDetail` |
| Default values | Initial form state | From fetched data |
| Submit handler | `useCreateEmployee` | `useUpdateEmployee` |
| Success behavior | Toast + redirect to detail | Toast + redirect to detail |

### Service Functions

The HRM Employee Service (`src/services/hrmEmployeeService.ts`) provides the following functions:

| Function | Description |
|----------|-------------|
| `fetchEmployeeDirectory()` | Returns `HrmEmployeeDirectory[]` for table listing |
| `fetchEmployeeDetail(id)` | Returns `HrmEmployeeDetail \| null` for single employee |
| `updateEmployee(id, payload)` | Updates employee record, returns `HrmEmployeeRow` |

The read functions use the **parallel-fetch + merge pattern**:
1. Execute multiple Supabase queries in parallel via `Promise.all()`
2. Build lookup Maps for related data (org units, positions, employees)
3. Derive display fields (`fullName`, `orgUnitName`, `positionTitle`, `managerName`)

The `updateEmployee` function:
- Uses Supabase `.update().eq().select().single()` pattern
- RLS enforces access: only admins and HR managers can update
- Returns the updated row or throws an error

**RLS-Aware Behavior:**
- Service returns `null` when RLS denies access
- Related table lookups gracefully return `null` when RLS blocks access
- UI displays "Not found or access denied" instead of crashing

#### Business Rules (Employee Edit Form)

The Employee Edit Form enforces the following HR business rules at the frontend level:

1. **Terminated ⇒ Always Inactive**
   - When `employment_status = 'terminated'`, the `is_active` flag is automatically set to `false`
   - The Active toggle is locked and displays "Inactive (locked by status 'Terminated')"
   - This rule is enforced both in the UI and in the payload before submission

2. **Termination Date ⇒ Status Cannot Be Active**
   - If a `termination_date` is set, the `employment_status` cannot be 'active'
   - Form validation blocks submission with a clear inline error message
   - User must either clear the termination date or change status

#### Access Control (Employee Edit Form)

Only **Admin** and **HR Manager** roles can access the Employee Edit page:
- Edit button on Employee Detail is hidden for Manager and Employee roles
- Direct URL access to `/hrm/employees/:employeeId/edit` shows "Access denied" view with proper breadcrumbs
- RLS policies provide a secondary enforcement layer at the database level

### React Hooks (Custom Pattern, No React Query)

The HRM module uses simple custom hooks for data fetching:

| Hook | File | Purpose |
|------|------|---------|
| `useHrmEmployees()` | `src/hooks/useHrmEmployees.ts` | Load employee directory |
| `useHrmEmployeeDetail(id)` | `src/hooks/useHrmEmployeeDetail.ts` | Load single employee |
| `useUpdateEmployee(id)` | `src/hooks/useUpdateEmployee.ts` | Update employee record |
| `useEmployeeFormOptions()` | `src/hooks/useEmployeeFormOptions.ts` | Load form dropdown options |

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

### Phase 2 – Steps 1–11: ✅ IMPLEMENTED_AND_VERIFIED

Manual role-based testing completed 2025-12-10:
- **Admin**: Sees all employees with full organization/position details
- **HR Manager**: Sees all employees with full details
- **Manager**: Sees only direct reports; URL manipulation → "Not found or access denied"
- **Employee**: Sees only own record; URL manipulation → "Not found or access denied"

| Step | Feature | Status |
|------|---------|--------|
| 2.1-2.3 | Employee Directory (listing, names, UX) | ✅ Verified |
| 2.4 | Employee Detail View | ✅ Verified |
| 2.5 | Organization Units UI | ✅ Verified |
| 2.6 | Positions UI | ✅ Verified |
| 2.7 | Position Detail View | ✅ Verified |
| 2.8 | Organization Unit Detail View | ✅ Verified |
| 2.9 | Employee Edit Form | ✅ Verified |
| 2.10 | Employee Create Form | ✅ Verified |
| 2.11 | EmployeeFormBase Refactoring | ✅ Verified |

All screens use Darkone UI patterns (Card, Table, Alert, Spinner) without modification.

### Phase 3 – Steps 1–3: ✅ IMPLEMENTED

| Step | Feature | Status |
|------|---------|--------|
| 3.1 | Users & Roles (read-only listing + detail) | ✅ Complete |
| 3.2 | Role Assignment & User–Employee Linking | ✅ Complete |
| 3.3 | Permission Utilities & RBAC Enforcement | ✅ Complete |

**Step 3.1 – Read-Only RBAC Visibility:**
- User Directory (`/hrm/users`) listing all auth users with roles and linked employees
- User Detail View (`/hrm/users/:userId`) with role badges and employee link info
- Access restricted to Admin and HR Manager roles

**Step 3.2 – Role Manager Modal:**
- Role assignment/removal via checkboxes (Admin only)
- Employee linking dropdown with 1:1 mapping enforcement
- HR Manager read-only mode (can view but not modify)
- Business rule: users with roles must be linked to an employee record

**Step 3.3 – Permission Utilities & RBAC Enforcement:**
- `usePermissions` hook providing centralized permission checks
- `RoleGuard` component for conditional rendering by role
- Access guards on Organization Units and Positions pages
- Menu filtering marked as Partial (Darkone guardrails prevent layout modification)

## Permission Matrix & usePermissions Hook

### Permission Matrix

| Permission | Admin | HR Manager | Manager | Employee |
|------------|-------|------------|---------|----------|
| `canViewUsers()` | ✅ | ✅ | ❌ | ❌ |
| `canModifyRoles()` | ✅ | ❌ | ❌ | ❌ |
| `canViewHRMData()` | ✅ | ✅ | ❌ | ❌ |
| `canEditEmployee()` | ✅ | ✅ | ❌ | ❌ |
| `canViewEmployee()` | ✅ | ✅ | Direct reports | Self only |

### usePermissions Hook

**File:** `src/hooks/usePermissions.ts`

Centralized permission checking utilities:

```typescript
interface UsePermissionsReturn {
  // Role flags
  isAdmin: boolean
  isHRManager: boolean
  isManager: boolean
  isEmployee: boolean
  userId: string | null
  
  // Permission checkers
  canViewUsers: () => boolean      // Admin + HR Manager
  canModifyRoles: () => boolean    // Admin only
  canViewHRMData: () => boolean    // Admin + HR Manager (structural tables)
  canEditEmployee: () => boolean   // Admin + HR Manager
  canViewEmployee: (employeeUserId: string | null) => boolean
  
  // Utility
  hasAnyRole: (...roles: AppRole[]) => boolean
}
```

### RoleGuard Component

**File:** `src/components/auth/RoleGuard.tsx`

Conditional rendering based on user roles:

```typescript
<RoleGuard allowedRoles={['admin', 'hr_manager']}>
  <RestrictedContent />
</RoleGuard>
```

### Users & Roles UI

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/users/UsersPage.tsx` | User Directory page |
| `src/app/(admin)/hrm/users/UserDetailPage.tsx` | User Detail page (hidden route) |
| `src/components/hrm/RoleManagerModal.tsx` | Role assignment modal |
| `src/hooks/useHrmUsers.ts` | Hook for fetching users via RPC |
| `src/hooks/useHrmUserDetail.ts` | Hook for single user detail |
| `src/hooks/useRoleManagement.ts` | Hook for role/linking state management |

**Access Control:**
- **Admin**: Full access to Users & Roles; can assign/remove roles and change employee linking
- **HR Manager**: Read-only access; can view roles and linked employee but cannot modify
- **Manager, Employee**: Access denied via route guard

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

// Detail ViewModel - Row + derived fields
interface HrmOrgUnitDetail extends HrmOrgUnitRow {
  parentOrgUnitName: string | null  // Lookup from parent_id
}
```

#### Service Functions

The `hrmOrgUnitService.ts` provides two main functions:

| Function | Description |
|----------|-------------|
| `fetchOrgUnits()` | Returns `HrmOrgUnitDirectory[]` for table listing |
| `fetchOrgUnitDetail(id)` | Returns `HrmOrgUnitDetail \| null` for single org unit |

Both functions use a self-join pattern for parent name resolution (same table lookup).

#### React Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useHrmOrgUnits()` | `src/hooks/useHrmOrgUnits.ts` | Load org unit directory |
| `useHrmOrgUnitDetail(id)` | `src/hooks/useHrmOrgUnitDetail.ts` | Load single org unit |

#### RLS Behavior

**Access Control:**
- **Admin, HR Manager**: Can see all organization units (3 rows in seed data)
- **Manager, Employee**: Denied access via FALSE policy; UI shows empty state message

The UI gracefully handles 0 rows by displaying: "No organization units available for your role."

### Organization Unit Detail View (`/hrm/org-units/:orgUnitId`)

Read-only profile view for a single organization unit (Phase 2 – Step 8):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/org-units/OrgUnitDetailPage.tsx` | Org Unit Detail page component |
| `src/hooks/useHrmOrgUnitDetail.ts` | React hook for loading single org unit |
| `fetchOrgUnitDetail()` in service | Fetch single org unit with derived fields |

The detail route is a **hidden/internal route** (not shown in sidebar), accessible via org unit code links from the directory.

#### RLS Behavior (Detail View)

**Access Control:**
- **Admin, HR Manager**: Can view any org unit detail
- **Manager, Employee**: Denied access; UI shows "Organization unit not found or you do not have access"

### Positions (`/hrm/positions`)

Read-only listing page for job positions (Phase 2 – Step 6):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/positions/PositionsPage.tsx` | Positions Directory page |
| `src/services/hrmPositionService.ts` | Supabase data access for hrm_positions |
| `src/hooks/useHrmPositions.ts` | React hook for loading positions |

#### Type Architecture

```typescript
// Row type - matches DB schema
interface HrmPositionRow {
  id: string
  code: string
  title: string
  description: string | null
  org_unit_id: string | null
  is_active: boolean
  // ... audit columns
}

// ViewModel - Row + derived fields
interface HrmPositionDirectory extends HrmPositionRow {
  orgUnitName: string | null  // Lookup from org_unit_id
}
```

#### Service Function

The `fetchPositions()` function in `hrmPositionService.ts`:
- Parallel fetch: positions + org units for name lookup
- Builds Map for org unit name resolution
- Returns empty array when RLS denies access

#### React Hook

The `useHrmPositions()` hook follows the same pattern as `useHrmOrgUnits()`:
- `useState` + `useEffect` with loading/error state
- Checks authentication status before fetching
- Returns `{ positions, isLoading, error, refetch }`

#### RLS Behavior

**Access Control:**
- **Admin, HR Manager**: Can see all positions
- **Manager, Employee**: Denied access via FALSE policy; UI shows empty state message

The UI gracefully handles 0 rows by displaying: "No positions available for your role."

### Position Detail View (`/hrm/positions/:positionId`)

Read-only profile view for a single position (Phase 2 – Step 7):

| File | Purpose |
|------|---------|
| `src/app/(admin)/hrm/positions/PositionDetailPage.tsx` | Position Detail page component |
| `src/hooks/useHrmPositionDetail.ts` | React hook for loading single position |
| `fetchPositionDetail()` in service | Fetch single position with derived fields |

The detail route is a **hidden/internal route** (not shown in sidebar), accessible via position code links from the directory.

#### Type Architecture

```typescript
// Detail ViewModel - Row + derived fields
interface HrmPositionDetail extends HrmPositionRow {
  orgUnitName: string | null  // Lookup from org_unit_id
}
```

#### Service Function

The `fetchPositionDetail(positionId)` function in `hrmPositionService.ts`:
- Parallel fetch: single position + org units for name lookup
- Returns `null` when position not found or RLS denies access
- Throws only for genuine query errors

#### React Hook

The `useHrmPositionDetail(positionId)` hook:
- `useState` + `useEffect` with loading/error state
- Checks authentication status before fetching
- Returns `{ position, isLoading, error }`
- Sets user-friendly error message when position not found

#### RLS Behavior (Detail View)

**Access Control:**
- **Admin, HR Manager**: Can view any position detail
- **Manager, Employee**: Denied access; UI shows "Position not found or you do not have access"

## Next Steps

- Phase 2 continues with Employee Edit forms
