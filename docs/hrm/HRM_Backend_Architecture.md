# SoZaVo HRM System — Backend Architecture

> **Version:** 1.0  
> **Last Updated:** 2025-01-09  
> **Status:** Reference Document

---

## Overview

This document defines the backend architecture for the SoZaVo HRM System. The system uses **Lovable Cloud** (powered by Supabase) as the backend platform, providing:

- PostgreSQL database with Row-Level Security (RLS)
- Built-in authentication
- File storage
- Edge Functions for serverless logic

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Pages     │  │ Components  │  │   Hooks     │  │  Services   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘ │
└────────────────────────────────────────────────────────────┼────────┘
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT (JS SDK)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │    Auth     │  │  Database   │  │   Storage   │  │  Functions  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────────┬────────┘
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LOVABLE CLOUD (Supabase)                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      SUPABASE AUTH                               ││
│  │  • Email/Password Authentication                                 ││
│  │  • Session Management                                            ││
│  │  • JWT Token Issuance                                            ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     POSTGRESQL DATABASE                          ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        ││
│  │  │  user_roles   │  │ hrm_employees │  │ hrm_org_units │        ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘        ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        ││
│  │  │ hrm_positions │  │ hrm_leave_*   │  │hrm_attendance │        ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘        ││
│  │  ┌───────────────┐  ┌───────────────┐                           ││
│  │  │ hrm_documents │  │hrm_audit_logs │                           ││
│  │  └───────────────┘  └───────────────┘                           ││
│  │                                                                  ││
│  │  ┌─────────────────────────────────────────────────────────────┐││
│  │  │              ROW-LEVEL SECURITY (RLS)                       │││
│  │  │  • Role-based policies using has_role() function            │││
│  │  │  • Record ownership policies                                │││
│  │  │  • Team-based access via org_unit relationships             │││
│  │  └─────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     SUPABASE STORAGE                             ││
│  │  • hrm-documents bucket (employee documents)                     ││
│  │  • RLS-protected file access                                     ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      EDGE FUNCTIONS                              ││
│  │  • Email notifications                                           ││
│  │  • Report generation                                             ││
│  │  • External integrations                                         ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Backend Modules

### 1. Auth & Identity

**Technology:** Supabase Auth

**Responsibilities:**
- User registration and login (email/password)
- Session management and JWT token handling
- Password reset functionality
- Auth state synchronization with frontend

**Key Tables:**
- `auth.users` (managed by Supabase)

**Frontend Integration:**
- `AuthContext` provides user state and auth methods
- `useAuth()` hook for component access
- `ProtectedRoute` component for route guards

---

### 2. Role-Based Access Control (RBAC)

**CRITICAL SECURITY DESIGN:**  
Roles are stored in a **SEPARATE `user_roles` table**, NOT in the profiles or users table. This prevents privilege escalation attacks.

**Role Hierarchy:**
```
admin
  └── hr_manager
        └── manager
              └── employee
```

**Key Tables:**
- `public.user_roles` — Maps users to roles

**Key Functions:**
- `public.has_role(user_id, role)` — Security definer function to check roles

**Enum Definition:**
```sql
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'hr_manager', 
  'manager',
  'employee'
);
```

**user_roles Table:**
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);
```

---

### 3. Employees Module

**Tables:**
- `hrm_employees` — Core employee data

**Key Fields:**
- `id`, `user_id` (FK to auth.users)
- `employee_number` (unique identifier)
- `first_name`, `last_name`, `email`
- `position_id` (FK to hrm_positions)
- `org_unit_id` (FK to hrm_organization_units)
- `manager_id` (self-reference for reporting line)
- `employment_status`, `hire_date`, `termination_date`
- `created_by`, `updated_by`, `created_at`, `updated_at`

**Enum:**
```sql
CREATE TYPE public.employment_status AS ENUM (
  'active',
  'inactive', 
  'on_leave',
  'terminated'
);
```

---

### 4. Organization Structure Module

**Tables:**
- `hrm_organization_units` — Departments, divisions, teams
- `hrm_positions` — Job positions

**hrm_organization_units Fields:**
- `id`, `name`, `code`
- `parent_id` (self-reference for hierarchy)
- `manager_id` (FK to hrm_employees)
- `is_active`

**hrm_positions Fields:**
- `id`, `title`, `code`
- `org_unit_id` (FK to hrm_organization_units)
- `description`, `is_active`

---

### 5. Leave Management Module

**Tables:**
- `hrm_leave_types` — Leave type definitions
- `hrm_leave_requests` — Employee leave applications

**hrm_leave_types Fields:**
- `id`, `name`, `code`
- `days_per_year`, `is_paid`, `is_active`

**hrm_leave_requests Fields:**
- `id`, `employee_id`, `leave_type_id`
- `start_date`, `end_date`, `days_count`
- `reason`, `status`
- `approved_by`, `approved_at`, `rejection_reason`

**Enum:**
```sql
CREATE TYPE public.leave_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);
```

---

### 6. Attendance Module

**Tables:**
- `hrm_attendance_records` — Daily attendance tracking

**Key Fields:**
- `id`, `employee_id`
- `date`, `check_in`, `check_out`
- `status`, `notes`
- `recorded_by`

**Enum:**
```sql
CREATE TYPE public.attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'half_day',
  'on_leave'
);
```

---

### 7. Documents Module

**Tables:**
- `hrm_documents` — Document metadata

**Storage:**
- Supabase Storage bucket: `hrm-documents`

**Key Fields:**
- `id`, `employee_id`
- `document_type`, `title`, `description`
- `file_path`, `file_name`, `file_size`, `mime_type`
- `uploaded_by`, `uploaded_at`

**Enum:**
```sql
CREATE TYPE public.document_type AS ENUM (
  'contract',
  'id_document',
  'certificate',
  'resume',
  'other'
);
```

---

### 8. Audit Logs Module

**Tables:**
- `hrm_audit_logs` — System-wide audit trail

**Key Fields:**
- `id`, `user_id`
- `action` (create, update, delete)
- `table_name`, `record_id`
- `old_data` (JSONB), `new_data` (JSONB)
- `ip_address`, `user_agent`
- `created_at`

**Purpose:**
- Track all data modifications
- Compliance and security auditing
- Debugging and troubleshooting

---

## Naming Conventions

### Database Objects

| Object Type | Convention | Example |
|-------------|------------|---------|
| Tables | `hrm_{module}` | `hrm_employees` |
| Enums | `{domain}_status` or `app_{role}` | `employment_status`, `app_role` |
| Functions | `snake_case` with verb | `has_role`, `get_user_org_unit` |
| Indexes | `idx_{table}_{column}` | `idx_hrm_employees_email` |
| Foreign Keys | `fk_{table}_{reference}` | `fk_employees_position` |
| Triggers | `tr_{table}_{action}` | `tr_employees_audit` |

### TypeScript Types

| Type | Convention | Example |
|------|------------|---------|
| Entities | PascalCase | `Employee`, `LeaveRequest` |
| Create Input | `Create{Entity}Input` | `CreateEmployeeInput` |
| Update Input | `Update{Entity}Input` | `UpdateEmployeeInput` |
| Filters | `{Entity}Filters` | `EmployeeFilters` |
| Enums | PascalCase | `EmploymentStatus`, `LeaveStatus` |

### Service Files

| File | Convention | Example |
|------|------------|---------|
| Service | `{Entity}Service.ts` | `EmployeeService.ts` |
| Types | `{module}.types.ts` | `employee.types.ts` |
| Schemas | `{module}.schemas.ts` | `employee.schemas.ts` |

---

## Service Layer Patterns

### Directory Structure

```
src/
├── services/
│   └── hrm/
│       ├── index.ts
│       ├── EmployeeService.ts
│       ├── OrganizationUnitService.ts
│       ├── PositionService.ts
│       ├── LeaveService.ts
│       ├── AttendanceService.ts
│       ├── DocumentService.ts
│       └── AuditLogService.ts
├── types/
│   └── hrm/
│       ├── index.ts
│       ├── employee.types.ts
│       ├── organization.types.ts
│       ├── leave.types.ts
│       ├── attendance.types.ts
│       └── document.types.ts
└── schemas/
    └── hrm/
        ├── index.ts
        ├── employee.schemas.ts
        ├── organization.schemas.ts
        └── leave.schemas.ts
```

### Base Service Interface

```typescript
interface BaseService<T, CreateInput, UpdateInput, Filters> {
  getAll(filters?: Filters): Promise<PaginatedResult<T>>;
  getById(id: string): Promise<T | null>;
  create(input: CreateInput): Promise<T>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### CRUD Operations Pattern

```typescript
// Example: EmployeeService.ts
import { supabase } from '@/integrations/supabase/client';
import { Employee, CreateEmployeeInput, EmployeeFilters } from '@/types/hrm';
import { createEmployeeSchema } from '@/schemas/hrm';
import { ServiceError } from '@/utils/errors';

export class EmployeeService {
  static async getAll(filters?: EmployeeFilters): Promise<PaginatedResult<Employee>> {
    let query = supabase
      .from('hrm_employees')
      .select('*, position:hrm_positions(*), org_unit:hrm_organization_units(*)', { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      query = query.eq('employment_status', filters.status);
    }
    if (filters?.org_unit_id) {
      query = query.eq('org_unit_id', filters.org_unit_id);
    }
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }

    // Pagination
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new ServiceError('Failed to fetch employees', error);

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  static async create(input: CreateEmployeeInput): Promise<Employee> {
    // Validate input
    const validated = createEmployeeSchema.parse(input);

    const { data, error } = await supabase
      .from('hrm_employees')
      .insert(validated)
      .select()
      .single();

    if (error) throw new ServiceError('Failed to create employee', error);

    return data;
  }

  // ... update, delete methods follow same pattern
}
```

### Validation with Zod

```typescript
// schemas/hrm/employee.schemas.ts
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  employee_number: z.string().min(1, 'Employee number is required'),
  position_id: z.string().uuid('Invalid position ID').optional(),
  org_unit_id: z.string().uuid('Invalid organization unit ID').optional(),
  hire_date: z.string().datetime().optional(),
  employment_status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).default('active'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeFiltersSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  org_unit_id: z.string().uuid().optional(),
});
```

### Error Handling

```typescript
// utils/errors.ts
export class ServiceError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'ServiceError';
    
    if (originalError && typeof originalError === 'object' && 'code' in originalError) {
      this.code = (originalError as { code: string }).code;
    } else {
      this.code = 'UNKNOWN_ERROR';
    }
    
    this.details = originalError;
  }
}

// Error codes mapping
export const ERROR_CODES = {
  '23505': 'A record with this value already exists',
  '23503': 'Referenced record does not exist',
  '42501': 'You do not have permission to perform this action',
  'PGRST116': 'Record not found',
} as const;
```

### Pagination Interface

```typescript
// types/common.ts
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## Row-Level Security Strategy

### Core Principles

1. **SEPARATE ROLES TABLE** — Never store roles in profiles table
2. **Security Definer Functions** — Prevent infinite recursion
3. **Least Privilege** — Users only access what they need
4. **Defense in Depth** — Multiple layers of access control

### Security Functions

```sql
-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Get user's organization unit (for team-based access)
CREATE OR REPLACE FUNCTION public.get_user_org_unit(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_unit_id
  FROM public.hrm_employees
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Check if user is manager of an employee
CREATE OR REPLACE FUNCTION public.is_manager_of(_manager_user_id UUID, _employee_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hrm_employees e
    JOIN public.hrm_employees m ON e.manager_id = m.id
    WHERE e.id = _employee_id
      AND m.user_id = _manager_user_id
  )
$$;
```

### RLS Policy Patterns

#### Pattern 1: Role-Based Access (Admin/HR)

```sql
-- Admins and HR managers can view all employees
CREATE POLICY "admin_hr_select_all" ON public.hrm_employees
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'hr_manager')
);
```

#### Pattern 2: Record Ownership

```sql
-- Employees can view their own record
CREATE POLICY "own_record_select" ON public.hrm_employees
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

#### Pattern 3: Team-Based Access (Manager)

```sql
-- Managers can view their direct reports
CREATE POLICY "manager_select_reports" ON public.hrm_employees
FOR SELECT
TO authenticated
USING (
  public.is_manager_of(auth.uid(), id)
);
```

#### Pattern 4: Combined Access

```sql
-- Leave requests: owner + manager + HR can view
CREATE POLICY "leave_request_select" ON public.hrm_leave_requests
FOR SELECT
TO authenticated
USING (
  -- Own requests
  employee_id IN (SELECT id FROM hrm_employees WHERE user_id = auth.uid())
  OR
  -- As manager
  public.is_manager_of(auth.uid(), employee_id)
  OR
  -- HR/Admin
  public.has_role(auth.uid(), 'admin')
  OR
  public.has_role(auth.uid(), 'hr_manager')
);
```

### RLS by Table

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| user_roles | Admin only | Admin only | Admin only | Admin only |
| hrm_employees | Own + Manager + HR/Admin | HR/Admin | Own (limited) + HR/Admin | HR/Admin |
| hrm_organization_units | All authenticated | HR/Admin | HR/Admin | Admin |
| hrm_positions | All authenticated | HR/Admin | HR/Admin | Admin |
| hrm_leave_types | All authenticated | HR/Admin | HR/Admin | Admin |
| hrm_leave_requests | Own + Manager + HR | Own | Own (pending only) + HR | Own (pending only) + HR |
| hrm_attendance_records | Own + Manager + HR | Own + HR | HR | HR/Admin |
| hrm_documents | Own + HR | Own + HR | HR | HR/Admin |
| hrm_audit_logs | Admin (read-only) | System only | Never | Never |

---

## Future: External REST API

### Overview

For external system integrations, Edge Functions can expose a versioned REST API.

### Versioning

```
/api/v1/employees
/api/v1/leave-requests
/api/v1/attendance
```

### Authentication

External clients authenticate using:
1. Service role key (for trusted backends)
2. JWT tokens (for external user-facing apps)

### Example Edge Function

```typescript
// supabase/functions/api-v1-employees/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify API key or JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle request based on method
    const url = new URL(req.url)
    
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('hrm_employees')
        .select('id, employee_number, first_name, last_name, email, employment_status')
        .eq('employment_status', 'active')

      if (error) throw error

      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Rate Limiting

Consider implementing rate limiting for external API access using Edge Function middleware or external services.

---

## Security Checklist

- [ ] Roles stored in separate `user_roles` table
- [ ] `has_role()` function uses SECURITY DEFINER
- [ ] RLS enabled on all HRM tables
- [ ] No raw SQL execution in Edge Functions
- [ ] All user input validated with Zod
- [ ] Sensitive data excluded from API responses
- [ ] Audit logging enabled for all mutations
- [ ] Admin access requires server-side role check
- [ ] No client-side role storage (localStorage/sessionStorage)

---

## Related Documentation

- [HRM_System_Implementation_Roadmap_v2.md](./HRM_System_Implementation_Roadmap_v2.md)
- [HRM_System_Developer_Guide.md](./HRM_System_Developer_Guide.md)
- [HRM_Tasks_Backlog.md](./HRM_Tasks_Backlog.md)
