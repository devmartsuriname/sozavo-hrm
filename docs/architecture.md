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

## Row/ViewModel Pattern Standard

All HRM entities follow the Row/ViewModel pattern:

| Entity | Row Type | Directory ViewModel | Detail ViewModel |
|--------|----------|---------------------|------------------|
| Employee | `HrmEmployeeRow` | `HrmEmployeeDirectory` | `HrmEmployeeDetail` |
| Organization Unit | `HrmOrgUnitRow` | `HrmOrgUnitDirectory` | `HrmOrgUnitDetail` |
| Position | `HrmPositionRow` | `HrmPositionDirectory` | `HrmPositionDetail` |

This pattern separates database schema (Row) from presentation needs (ViewModel with derived fields).
