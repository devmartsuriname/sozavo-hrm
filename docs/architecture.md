# SoZaVo HRM Architecture Documentation

## System Overview

The SoZaVo HRM system is a React-based admin application built on:
- **Frontend**: Darkone React Admin Template (locked baseline)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: SCSS (Darkone theme) - no Tailwind/shadcn modifications to core

## Application Layers

### 1. Presentation Layer
- Darkone React components (read-only, locked)
- HRM-specific components in `src/components/hrm/`
- Bootstrap-based styling via `src/assets/scss/`

### 2. State Management
- React Context for global state
- React Query for server state (planned)

### 3. Service Layer
- API calls via `src/services/`
- Supabase client integration

### 4. Data Layer
- Supabase PostgreSQL database
- Row-Level Security (RLS) for access control

## Authentication Architecture

### Phase 7B: Fully Integrated

```
src/
├── types/
│   └── supabase-auth.ts      # Auth type definitions
├── services/
│   └── roleService.ts        # Role fetching service
└── context/
    └── SupabaseAuthContext.tsx  # Auth provider (ACTIVE)
```

#### Key Design Decisions

1. **Separate Role Table**: Roles stored in `public.user_roles`, not in profiles
   - Prevents privilege escalation attacks
   - Enforced by RLS policies

2. **Hybrid Failure Mode**: If roles fail to load:
   - Session remains valid
   - `rolesError` is set with user-friendly message
   - UI blocks access (not silent guest mode)

3. **Deferred Role Fetch**: Uses `setTimeout(0)` pattern
   - Prevents Supabase auth deadlock
   - Follows Supabase best practices

4. **Lightweight Types**: Custom `SupabaseUserLite` and `SupabaseSessionLite`
   - Avoids tight coupling with Supabase SDK
   - Contains only fields needed by the app

### Auth Flow Integration (Phase 7B Complete)

```
User Login Flow:
┌──────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│  SignIn Form │───▶│  useSignIn.ts   │───▶│ supabase.auth.signIn │
└──────────────┘    └─────────────────┘    └──────────────────────┘
                                                      │
                                                      ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│  router.tsx  │◀───│ SupabaseAuth    │◀───│ onAuthStateChange    │
│ (protected)  │    │ Provider        │    │ listener             │
└──────────────┘    └─────────────────┘    └──────────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ fetchUserRoles  │
                    │ (RLS-protected) │
                    └─────────────────┘
```

### Wired Components

| Component | File | Auth Integration |
|-----------|------|------------------|
| App Entry | `src/App.tsx` | Fake-backend REMOVED |
| Providers | `AppProvidersWrapper.tsx` | Uses `SupabaseAuthProvider` |
| Sign In | `useSignIn.ts` | Uses `supabase.auth.signInWithPassword` |
| Router | `router.tsx` | Uses `useSupabaseAuth()` for protection |
| Logout | `ProfileDropdown.tsx` | Uses `signOut()` from context |

### Legacy Auth (DELETED in Phase 7C)

```
src/
├── context/
│   └── useAuthContext.tsx    # Darkone cookie-based auth (NOT USED)
├── types/
│   └── auth.ts               # Legacy types (marked LEGACY, kept for reference)
└── helpers/
    └── fake-backend.ts       # DELETED in Phase 7C
```

The fake-backend file has been completely removed. Only Supabase Auth is operational.

## Role-Based Access Control

### Database Layer (RLS)

```sql
-- Security definer functions (avoid recursion)
public.has_role(user_id, role) → boolean
public.user_is_admin() → boolean
public.is_manager_of(manager_id, employee_id) → boolean

-- RLS policies use these functions
CREATE POLICY "employees_select_admin" ON hrm_employees
  FOR SELECT USING (public.user_is_admin());
```

### Application Layer

```typescript
// src/services/roleService.ts
fetchUserRoles(userId) → AppRole[]
deriveRoleFlags(roles) → { isAdmin, isHRManager, isManager, isEmployee }

// src/context/SupabaseAuthContext.tsx
useSupabaseAuth() → { user, roles, isAdmin, ... }
```

## File Organization

### Database (Version Controlled)
```
db/hrm/
├── enums.sql           # Enum definitions
├── schema.sql          # Table definitions
├── functions.sql       # Security definer functions
├── rls_policies.sql    # RLS policies
├── seed_roles.sql      # Test role data
└── seed_hrm_test_data.sql  # Test HRM data
```

### Documentation
```
docs/
├── backend.md          # Backend documentation
├── architecture.md     # This file
└── hrm/
    └── HRM_RLS_TestPlan.md  # RLS test plan
```

## Security Boundaries

1. **RLS at Database Level**: All access control enforced in PostgreSQL
2. **Security Definer Functions**: Bypass RLS for internal checks only
3. **No Client-Side Role Storage**: Roles fetched fresh, not cached in localStorage
4. **Admin-Only Deletion**: Structural changes require admin role

### RLS Test Plan Execution

**Date:** 2025-12-10  
**Status:** ✅ Phase 1 – Step 7D Complete

The formal RLS Test Plan has been executed and all 25 test scenarios passed. See `docs/hrm/HRM_RLS_TestPlan.md` for:
- Complete test matrix for all 4 tables × 4 roles × 4 operations
- Scenario-based test cases with expected outcomes
- Security function verification results
- Findings and open issues (none critical)

## HRM UI Implementation

### Hidden/Internal Route Pattern

Some routes are internal and should not appear in the sidebar navigation. These use the `hidden: true` flag in route definitions:

```typescript
export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  hidden?: boolean // Internal routes not shown in sidebar
}

// Example: Employee Detail is a hidden route
{
  name: 'Employee Detail',
  path: '/hrm/employees/:employeeId',
  element: <HrmEmployeeDetailPage />,
  hidden: true,
}
```

### Phase 2 – Employee Directory, Detail, Create & Edit

The HRM employee screens implemented at `/hrm/employees`:

```
src/
├── app/(admin)/hrm/
│   └── employees/
│       ├── page.tsx                # Employee Directory page
│       ├── EmployeeDetailPage.tsx  # Employee Detail page (Phase 2.4)
│       ├── EmployeeEditPage.tsx    # Employee Edit form wrapper (Phase 2.9/2.11)
│       └── EmployeeCreatePage.tsx  # Employee Create form wrapper (Phase 2.10)
├── components/
│   └── hrm/
│       └── EmployeeFormBase.tsx    # Shared form component (Phase 2.11)
├── hooks/
│   ├── useHrmEmployees.ts          # Directory data loading hook
│   ├── useHrmEmployeeDetail.ts     # Detail data loading hook
│   ├── useCreateEmployee.ts        # Employee create hook
│   ├── useUpdateEmployee.ts        # Employee update hook
│   └── useEmployeeFormOptions.ts   # Form dropdown options hook
├── services/
│   └── hrmEmployeeService.ts       # Supabase query service
└── types/
    └── hrm.ts                      # HRM TypeScript types (Row/ViewModel pattern)
```

#### Design Decisions

1. **Derived Fields via Parallel-Fetch + Merge**:
   - `fullName`: Concatenated in TypeScript (`first_name + ' ' + last_name`)
   - `orgUnitName`: Lookup from `hrm_organization_units.name`
   - `positionTitle`: Lookup from `hrm_positions.title`
   - `managerName`: Lookup from same employee dataset by `manager_id`

2. **RLS-Aware Queries**: Uses authenticated Supabase client, respects row-level security
   - Non-admin users may see `null` for org unit/position names (RLS blocks related tables)
   - Manager name resolves only if the manager is visible under current user's RLS scope

3. **Darkone Patterns**: Reuses Card, Table, Spinner, Alert, Form.Control exactly as template defines

4. **Client-Side UX Enhancements** (Phase 2 – Step 3):
   - **Initials Avatar**: Circular badge derived from fullName (e.g., "KA")
   - **Search Filter**: Case-insensitive partial match across all text fields
   - **Column Sorting**: Clickable headers with asc/desc toggle and icon indicators
   - Operates on in-memory array, no additional DB queries

5. **Query-Level Filtering** (Phase 4.2.1a):
   - `fetchEmployeeDirectory({ includeTerminated?: boolean })` option
   - Filters terminated employees at Supabase query level (not client-side)
   - Enables consistent behavior for future export features (CSV/PDF)

## Migration Path

| Phase | Status | Description |
|-------|--------|-------------|
| 7A | ✅ Complete | Auth infrastructure scaffolded |
| 7B | ✅ Complete | Wired auth provider, migrated sign-in |
| 7C | ✅ Complete | Deleted fake-backend file, marked legacy types |
| 7D | ✅ Complete | Created test users, seeded data |
| **2.1** | ✅ Complete | Employee Directory UI (read-only) |
| **2.2** | ✅ Complete | Org Unit & Position name display |
| **2.3** | ✅ Complete | Manager name, avatars, sorting, filtering |
| **2.4** | ✅ Verified | Employee Detail View (read-only, hidden route) |
| **2.5** | ✅ Verified | Organization Units UI (read-only listing, RLS tested) |
| **2.6** | ✅ Verified | Positions UI (read-only listing, RLS tested with all roles) |
| **2.7** | ✅ Verified | Position Detail View (read-only, hidden route) |
| **2.8** | ✅ Complete | Organization Unit Detail View (read-only, hidden route) |
| **2.9** | ✅ Verified | Employee Edit Form (Admin + HR only) with UI access guard |
| **2.10** | ✅ Verified | Employee Create Form (Admin + HR only, auto-generated code) |
| **2.11** | ✅ Verified | EmployeeFormBase refactoring (single source of truth) |
| **3.1** | ✅ Complete | Users & Roles UI (read-only listing + detail) |
| **3.2** | ✅ Complete | Role Assignment & User–Employee Linking modal |
| **3.3** | ✅ Complete | Permission Utilities & RBAC Enforcement |
| **4.2.1** | ✅ Complete | Reactivation + Audit Guardrails (server-validated, DB trigger) |

### Phase 4.2.1 — Reactivation + Audit Guardrails

**DB Changes:**
- Added `terminated_at` for immutable cooldown timestamp
- Added `reactivated_by`, `reactivated_at`, `reactivation_reason` for audit
- Created `enforce_employee_update_guardrails()` trigger

**Security Model:**
- `terminateEmployee()` / `reactivateEmployee()` use `supabase.auth.getUser()` internally
- No userId parameters accepted - prevents client-side spoofing
- DB trigger blocks managers from reactivating or modifying terminated records

**Shared Form Architecture (Phase 2.11):**
- `EmployeeFormBase` is the single source of truth for all employee form logic
- Both `EmployeeCreatePage` and `EmployeeEditPage` are thin wrappers around `EmployeeFormBase`
- Business rules (terminated ⇒ inactive, termination date validation) centralized in one component
- Page-level components handle: access control, data fetching, submit handlers, navigation/toasts

## Phase 3 – RBAC & User Management

### Step 3.1: Read-Only Users & Roles

User Directory (`/hrm/users`) and User Detail (`/hrm/users/:userId`) pages for viewing all system users, their roles, and linked employees. Access restricted to Admin and HR Manager roles only.

### Step 3.2: Role Assignment & User–Employee Linking

Role Manager modal on User Detail page with:
- **Role checkboxes**: Admin can add/remove any of the 4 HRM roles
- **Employee linking dropdown**: Select which employee record is linked to the user
- **1:1 mapping enforcement**: Each employee can only be linked to one user
- **HR Manager read-only mode**: Can view roles and linked employee but cannot modify
- **Business rule**: Users with ≥1 roles must be linked to an employee record

### Step 3.3: Permission Utilities & RBAC Enforcement

Centralized permission framework for consistent RBAC enforcement:

**usePermissions Hook** (`src/hooks/usePermissions.ts`):
- `canViewUsers()` – Admin + HR Manager
- `canModifyRoles()` – Admin only
- `canViewHRMData()` – Admin + HR Manager (structural tables)
- `canEditEmployee()` – Admin + HR Manager
- `canViewEmployee(employeeUserId)` – checks ownership for employee role
- `hasAnyRole(...roles)` – utility for custom checks

**RoleGuard Component** (`src/components/auth/RoleGuard.tsx`):
- Conditionally renders children based on `allowedRoles`
- Returns `fallback` (default: null) if user lacks permission

**Page-Level Access Guards:**
- Organization Units and Positions pages now check `canViewHRMData()`
- Non-authorized roles see "You do not have permission" alert

**Sidebar Filtering Status:**
- ⚠️ Partial – Darkone guardrails prevent modification of protected layout files
- Menu items remain static; dynamic filtering deferred to future step

### Step 3.4: RBAC QA Pass

Comprehensive RBAC validation with documented test scenarios:

- **QA Checklist Created:** `docs/hrm/HRM_RBAC_QA_Checklist.md`
- **58 test scenarios** covering all 4 roles across all HRM features
- **Permission gap analysis** confirmed no misconfigurations
- **Known limitations** documented (sidebar filtering, RLS-derived fields)

Test users verified:
- `admin@sozavo.sr` – Full access to all features
- `hr.manager@sozavo.sr` – Read-only role management, full employee access
- `manager@sozavo.sr` – Team visibility only, no structural data access
- `employee@sozavo.sr` – Self-service only

### Phase 3.5: Admin Cleanup & Demo Library

**Step 3.5.1 – Inventory:** Complete audit of all Darkone demo modules (41+ routes, 60+ components).

**Step 3.5.2 – Demo Library Creation:** Documentation-based library preserving reusable demo assets:
- `/docs/demo-library/` – Master index and integration notes
- Dashboard widgets, ApexCharts configs (JSON), maps, UI patterns
- HRM metric mappings for Phase 6 dashboard integration
- No runtime code changes – documentation only

**Step 3.5.3 – Admin Sidebar Cleanup & Dashboard De-Demo:** HRM-only production navigation:
- **Sidebar:** Reduced to Dashboard + HRM modules only (Employees, Org Units, Positions, Users & Roles)
- **Routes:** Removed all demo route arrays (Base UI, Charts, Forms, Tables, Icons, Maps, Layouts)
- **Dashboard:** Replaced fake KPI widgets with clean Welcome/SystemStatus/QuickLinks components
- **Auth:** Login routes preserved for functionality, removed from sidebar navigation
- Demo components preserved in codebase for Demo Library reference
- Restore point documented: `docs/hrm/RestorePoint_Phase3.5_Step3.5.3_AdminCleanup.md`

### RBAC Flow

```
UI Layer:
┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐
│  UsersPage   │─────▶│ fetchUsersWithRolesRpc()│─────▶│ RPC: get_all_users   │
└──────────────┘      └─────────────────────────┘      │   _with_roles()      │
                                                       └──────────────────────┘
┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐
│ UserDetail   │─────▶│ "Manage Roles" button   │─────▶│ RoleManagerModal     │
│ Page         │      └─────────────────────────┘      └──────────────────────┘
└──────────────┘                                              │
                                                              ▼
Backend Layer:                                    ┌─────────────────────────┐
┌──────────────────────────────────────────────────│ assignRole / removeRole │
│ Writes to:                                       │ linkUserToEmployee      │
│  - public.user_roles (role assignments)          └─────────────────────────┘
│  - public.hrm_employees (user_id column)
└──────────────────────────────────────────────────
```

**Security:**
- RLS policies on `user_roles` and `hrm_employees` tables remain unchanged
- `get_all_users_with_roles()` is a SECURITY DEFINER function that safely queries `auth.users`
- Role changes and user–employee linking are performed via direct writes with RLS enforcement

## HRM Form Validation Standard

All HRM forms use a consistent validation feedback pattern:

```tsx
// Input with isInvalid prop (applies .is-invalid class)
<Form.Control
  type="text"
  name="fieldName"
  isInvalid={!!errors.fieldName}
  // ...
/>

// Error message with manual d-block class (NOT Form.Control.Feedback)
{errors.fieldName && (
  <div className="invalid-feedback d-block">{errors.fieldName}</div>
)}
```

**Key Points:**
- `isInvalid={!!errors.fieldName}` on `Form.Control` applies Bootstrap's `.is-invalid` styling
- Error messages use `<div className="invalid-feedback d-block">` instead of `Form.Control.Feedback`
- The `d-block` class ensures visibility regardless of sibling element state
- This pattern is consistent with Darkone demo forms and `docs/demo-library/forms/forms-reference.md`

**Accessibility Note:**
- `aria-describedby` is not implemented for input-to-error linking
- This matches Bootstrap's default `Form.Control.Feedback` behavior
- Acceptable for current admin module; may be enhanced for strict WCAG 2.1 AA compliance in future

**Files Using This Pattern:**
- `src/components/hrm/EmployeeFormBase.tsx`
- `src/app/(admin)/hrm/org-units/OrgUnitEditPage.tsx`
- `src/app/(admin)/hrm/positions/PositionEditPage.tsx`

---

## Row/ViewModel Pattern Standard

All HRM entities follow the Row/ViewModel pattern:

| Entity | Row Type | Directory ViewModel | Detail ViewModel |
|--------|----------|---------------------|------------------|
| Employee | `HrmEmployeeRow` | `HrmEmployeeDirectory` | `HrmEmployeeDetail` |
| Organization Unit | `HrmOrgUnitRow` | `HrmOrgUnitDirectory` | `HrmOrgUnitDetail` |
| Position | `HrmPositionRow` | `HrmPositionDirectory` | `HrmPositionDetail` |

This pattern separates database schema (Row) from presentation needs (ViewModel with derived fields).

---

## Phase 4.1 — Organization Unit & Position Edit Forms

**Status:** ✅ Complete  
**Date:** 2025-12-13

### New Routes

| Route | Component | Hidden | Access |
|-------|-----------|--------|--------|
| `/hrm/org-units/:orgUnitId/edit` | `OrgUnitEditPage` | `true` | Admin, HR Manager, Manager (scoped) |
| `/hrm/positions/:positionId/edit` | `PositionEditPage` | `true` | Admin, HR Manager, Manager (scoped) |

### RLS Scoping for Managers

Phase 4.1 introduced manager-scoped UPDATE policies using `get_user_org_unit()`:

```
Manager Role Access Control:
┌─────────────────────┐     ┌─────────────────────────────┐
│ OrgUnitEditPage     │────▶│ RLS: id = get_user_org_unit │
└─────────────────────┘     └─────────────────────────────┘

┌─────────────────────┐     ┌─────────────────────────────────────┐
│ PositionEditPage    │────▶│ RLS: org_unit_id = get_user_org_unit│
└─────────────────────┘     └─────────────────────────────────────┘
```

### Permission Functions

Added to `usePermissions.ts`:

| Function | Description |
|----------|-------------|
| `canEditOrgUnit(orgUnitId)` | Check if current user can edit org unit |
| `canEditPosition(positionOrgUnitId)` | Check if current user can edit position |

### Business Rules

1. **Immutable Code**: Code field is read-only after creation (prevents breaking references)
2. **Role-Based Edit Visibility**: Edit button shown only when `canEditOrgUnit/canEditPosition` returns `true`
3. **RLS Enforcement**: Backend UPDATE fails for managers editing outside their org unit

### Layout Consistency

Edit pages follow Darkone detail page layout:
- Full-width form container (`<Col xs={12}>`)
- Action buttons in separate Row with `mb-4` spacing
- Card-based form sections

---

## Phase 4.2 — Employee Terminate/Archive

**Status:** ✅ Complete  
**Date:** 2025-12-13

### Soft Delete Pattern

No hard deletes — employees are archived via status change:
- `employment_status` → `'terminated'`
- `is_active` → `false`
- `termination_date` → user-provided date
- `terminated_by` → current user ID (audit)
- `termination_reason` → optional text (audit)

### Permission: `canTerminateEmployee()`

| Role | Access |
|------|--------|
| Admin | All employees |
| HR Manager | All employees |
| Manager | Own org unit only (RLS) |
| Employee | None |

### UI Flow

1. User clicks "Terminate" on Employee Detail page
2. Modal opens with date picker and optional reason
3. On confirm, `terminateEmployee()` service called
4. Success → toast + page refresh
5. Terminated employees show danger badge + Termination Info Card

---

## Phase 4.2.1c — Sidebar Toggle UX Fix

**Status:** ✅ Complete  
**Date:** 2025-12-13

### Problem

The sidebar toggle lost control after viewport resize because:
- `LeftSideBarToggle.tsx` useEffect forced `menu.size = 'hidden'` when viewport ≤ 1140px
- This overwrote user preference stored in localStorage
- Toggle handler didn't restore `'hidden'` → `'default'`

### Fix

1. **Removed viewport-driven state mutation**: No `changeMenuSize()` calls triggered by `width`
2. **User preference priority**: `menu.size` is now controlled ONLY by user toggle
3. **Toggle behavior fixed**: When `size === 'hidden'`, toggle restores to `'default'`
4. **Backdrop-only responsive behavior**: Mobile navigation uses backdrop overlay without changing sidebar state

### Design Decision

Sidebar visibility is a **user preference**, not a breakpoint decision. Responsive behavior may control backdrop/overlay but never permanently changes `menu.size`.

### Verification Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Pinned → resize to mobile → resize back | Still pinned |
| Condensed → resize to mobile → toggle → resize back | Condensed restored |
| Toggle when hidden | Restores to default |
| No hover-only mode | Only if user explicitly chose hidden |

---

## Phase 4.3 — Leave Management

**Status:** ✅ Complete (DB Layer)  
**Date:** 2025-12-14

### Architecture

```
db/hrm/
├── functions_leave.sql     # Security definer functions
├── schema_leave.sql        # hrm_leave_types + hrm_leave_requests tables
├── triggers_leave.sql      # Unified before-write trigger
├── rls_leave.sql           # RLS policies for leave tables
└── seed_leave_types.sql    # Initial leave type data
```

### Trigger-First Enforcement Model

Phase 4.3 introduces a **unified trigger pattern** for complex business rules:

```
┌─────────────────────────────────────────────────────────────────┐
│            leave_requests_before_write() TRIGGER                │
├─────────────────────────────────────────────────────────────────┤
│ A) AUDIT NORMALIZATION                                          │
│    - INSERT: Set created_by, submitted_at, force status=pending │
│    - UPDATE: Preserve immutable fields, set decision/cancel     │
├─────────────────────────────────────────────────────────────────┤
│ B) GUARDRAILS                                                   │
│    - No linked employee check                                   │
│    - Self-approval block                                        │
│    - Manager direct-report enforcement                          │
│    - HR Manager rejection reason requirement                    │
│    - Employee cancel-only restriction                           │
│    - Post-decision immutability                                 │
├─────────────────────────────────────────────────────────────────┤
│ C) OVERLAP PREVENTION                                           │
│    - Block on INSERT                                            │
│    - Block on pending → approved                                │
│    - Block on date changes to APPROVED requests                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **ONE trigger per table**: Deterministic execution order
2. **DB-authoritative audit**: `created_by`, `submitted_at` set by trigger, immutable on UPDATE
3. **Unified decision fields**: `decided_by/at` for both approve and reject
4. **Overlap prevention**: Blocks at INSERT and approval transition

### Migration Execution Order

```bash
1. functions_leave.sql    # Create security functions first
2. schema_leave.sql       # Create tables
3. triggers_leave.sql     # Create trigger function + attach
4. rls_leave.sql          # Enable RLS + policies
5. seed_leave_types.sql   # Seed initial data
```

### Verification Checklist

| Test | Expected |
|------|----------|
| Employee INSERT for self | ✅ RLS allows |
| Employee INSERT for other | ❌ RLS blocks |
| Employee cancel pending | ✅ Trigger allows |
| Employee edit dates | ❌ Trigger blocks |
| Manager approve direct report | ✅ RLS + trigger allow |
| Manager approve non-report | ❌ Trigger blocks |
| Manager approve self | ❌ Trigger blocks |
| HR reject without reason | ❌ Trigger blocks |
| Overlap on INSERT | ❌ Trigger blocks |
| Overlap on approve | ❌ Trigger blocks |
| Audit fields tampered | ✅ Trigger overwrites |
