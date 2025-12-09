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

### Current State (Phase 7B - Integrated)

The Supabase auth infrastructure is now **fully wired into the runtime**:

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

### Legacy Auth (REMOVED in Phase 7B)

The Darkone fake-backend has been fully removed:
- ~~`src/helpers/fake-backend.ts`~~ - No longer imported or used
- ~~Cookie-based session management~~ - Replaced by Supabase sessions
- ~~Hardcoded demo users~~ - Only real Supabase users work

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

## Next Steps (Phase 7C+)

- Phase 7C: Delete `fake-backend.ts` file and unused legacy auth code
- Phase 7D: Create test users in Supabase, replace placeholder UUIDs
