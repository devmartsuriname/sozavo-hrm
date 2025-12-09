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

### Current State (Phase 7A - Scaffolded)

The Supabase auth infrastructure has been scaffolded but is **not yet wired to the runtime**:

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

### Legacy Auth (Still Active)

The Darkone fake-backend (`src/helpers/fake-backend.ts`) remains active until Phase 7B migration:
- Cookie-based session management
- Hardcoded demo users
- No RLS enforcement

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

## Next Steps (Phase 7B+)

- Wire `SupabaseAuthProvider` into `AppProvidersWrapper`
- Migrate sign-in flow to `supabase.auth.signInWithPassword()`
- Replace placeholder UUIDs with real `auth.users` IDs
- Remove fake-backend
