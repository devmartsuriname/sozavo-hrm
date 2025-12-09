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

## Migration Path

| Phase | Status | Description |
|-------|--------|-------------|
| 7A | ✅ Complete | Auth infrastructure scaffolded |
| 7B | ✅ Complete | Wired auth provider, migrated sign-in |
| 7C | ✅ Complete | Deleted fake-backend file, marked legacy types |
| 7D | Pending | Create test users, replace placeholders |
