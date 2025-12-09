# SoZaVo HRM System — Database Specification

**Version:** 2.0  
**Last Updated:** 2025-01-09  
**Database:** PostgreSQL (Supabase Cloud)

---

## 1. Overview

This document provides the complete database schema for the SoZaVo HRM System. All tables reside in the `public` schema with an `hrm_` prefix for HRM-specific tables. The `user_roles` table is intentionally kept separate (without prefix) to enforce security best practices.

### Design Principles

- **Normalization:** Third Normal Form (3NF) for data integrity
- **Security:** Separate `user_roles` table to prevent privilege escalation
- **Extensibility:** Designed for future modules (performance, recruitment)
- **Portability:** Standard PostgreSQL, migration-ready

---

## 2. Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│ hrm_organization_   │       │    hrm_positions    │
│      units          │       │                     │
│─────────────────────│       │─────────────────────│
│ PK: id              │       │ PK: id              │
│ FK: parent_id ──┐   │       │ title               │
│ name            │   │       │ code                │
│ code            │   │       │ category            │
│ type            │   │       │ is_active           │
└────────┬────────┘   │       └──────────┬──────────┘
         │            │                  │
         │            └──────────────────┘
         │                     │
         │         ┌───────────┴───────────┐
         │         │                       │
         ▼         ▼                       ▼
┌─────────────────────────────────────────────────────┐
│                   hrm_employees                      │
│─────────────────────────────────────────────────────│
│ PK: id                                              │
│ FK: org_unit_id → hrm_organization_units            │
│ FK: position_id → hrm_positions                     │
│ employee_no, first_name, last_name, email           │
│ status, gender, date_of_birth, hire_date            │
└─────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ hrm_leave_      │  │ hrm_attendance_ │  │ hrm_documents   │
│ requests        │  │ records         │  │                 │
│─────────────────│  │─────────────────│  │─────────────────│
│ PK: id          │  │ PK: id          │  │ PK: id          │
│ FK: employee_id │  │ FK: employee_id │  │ FK: employee_id │
│ FK: leave_type  │  │ date            │  │ document_type   │
│ start_date      │  │ status          │  │ file_path       │
│ end_date        │  │ notes           │  │ file_name       │
│ status          │  └─────────────────┘  └─────────────────┘
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ hrm_leave_types │
│─────────────────│
│ PK: id          │
│ code            │
│ name            │
│ entitlement     │
└─────────────────┘

┌─────────────────┐       ┌─────────────────────┐
│   auth.users    │──────▶│     user_roles      │
│   (Supabase)    │       │─────────────────────│
└─────────────────┘       │ PK: id              │
         │                │ FK: user_id         │
         │                │ role (enum)         │
         │                └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   hrm_audit_logs    │
│─────────────────────│
│ PK: id              │
│ FK: actor_id        │
│ entity_type         │
│ entity_id           │
│ action              │
│ payload (jsonb)     │
└─────────────────────┘
```

---

## 3. Enumerations

### 3.1 Role Enumeration

```sql
CREATE TYPE public.app_role AS ENUM (
  'system_admin',
  'hr_admin',
  'manager',
  'hr_viewer',
  'executive'
);
```

### 3.2 Status Enumerations

```sql
-- Employee status
CREATE TYPE public.employee_status AS ENUM (
  'active',
  'inactive',
  'terminated',
  'on_leave'
);

-- Leave request status
CREATE TYPE public.leave_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-- Attendance status
CREATE TYPE public.attendance_status AS ENUM (
  'present',
  'absent',
  'sick',
  'late',
  'half_day',
  'remote'
);

-- User account status
CREATE TYPE public.user_status AS ENUM (
  'active',
  'disabled',
  'pending'
);
```

---

## 4. Table Definitions

### 4.1 hrm_organization_units

Represents the organizational hierarchy (ministry, directorate, department, unit).

```sql
CREATE TABLE public.hrm_organization_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type TEXT, -- 'ministry', 'directorate', 'department', 'unit'
  parent_id UUID REFERENCES public.hrm_organization_units(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Self-referencing index for hierarchy queries
CREATE INDEX idx_org_units_parent ON public.hrm_organization_units(parent_id);
CREATE INDEX idx_org_units_active ON public.hrm_organization_units(is_active);

-- Enable RLS
ALTER TABLE public.hrm_organization_units ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | TEXT | No | — | Unit name |
| code | TEXT | Yes | — | Unique code |
| type | TEXT | Yes | — | Unit level type |
| parent_id | UUID | Yes | — | Parent unit FK |
| is_active | BOOLEAN | No | true | Active status |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.2 hrm_positions

Standardized job titles and roles within the organization.

```sql
CREATE TABLE public.hrm_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT UNIQUE,
  category TEXT, -- 'managerial', 'technical', 'administrative', 'support'
  salary_scale_ref TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_positions_active ON public.hrm_positions(is_active);
CREATE INDEX idx_positions_category ON public.hrm_positions(category);

ALTER TABLE public.hrm_positions ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| title | TEXT | No | — | Position title |
| code | TEXT | Yes | — | Unique position code |
| category | TEXT | Yes | — | Position category |
| salary_scale_ref | TEXT | Yes | — | Salary scale reference |
| is_active | BOOLEAN | No | true | Active status |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.3 hrm_employees

Master table for all employee personal and employment data.

```sql
CREATE TABLE public.hrm_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  gender TEXT, -- 'male', 'female', 'other'
  date_of_birth DATE,
  national_id TEXT UNIQUE,
  address TEXT,
  
  -- Employment details
  org_unit_id UUID REFERENCES public.hrm_organization_units(id) ON DELETE SET NULL,
  position_id UUID REFERENCES public.hrm_positions(id) ON DELETE SET NULL,
  employment_type TEXT NOT NULL DEFAULT 'permanent', -- 'permanent', 'contract', 'temporary'
  hire_date DATE NOT NULL,
  termination_date DATE,
  status employee_status NOT NULL DEFAULT 'active',
  
  -- Contract details
  contract_start_date DATE,
  contract_end_date DATE,
  contract_type TEXT,
  
  -- Profile
  photo_url TEXT,
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_employees_status ON public.hrm_employees(status);
CREATE INDEX idx_employees_org_unit ON public.hrm_employees(org_unit_id);
CREATE INDEX idx_employees_position ON public.hrm_employees(position_id);
CREATE INDEX idx_employees_hire_date ON public.hrm_employees(hire_date);

ALTER TABLE public.hrm_employees ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| employee_no | TEXT | No | — | Unique employee number |
| first_name | TEXT | No | — | First name |
| last_name | TEXT | No | — | Last name |
| middle_name | TEXT | Yes | — | Middle name |
| email | TEXT | Yes | — | Email address |
| phone | TEXT | Yes | — | Phone number |
| gender | TEXT | Yes | — | Gender |
| date_of_birth | DATE | Yes | — | Birth date |
| national_id | TEXT | Yes | — | National ID number |
| address | TEXT | Yes | — | Physical address |
| org_unit_id | UUID | Yes | — | Organization unit FK |
| position_id | UUID | Yes | — | Position FK |
| employment_type | TEXT | No | 'permanent' | Employment type |
| hire_date | DATE | No | — | Date of hire |
| termination_date | DATE | Yes | — | Termination date |
| status | employee_status | No | 'active' | Employment status |
| contract_start_date | DATE | Yes | — | Contract start |
| contract_end_date | DATE | Yes | — | Contract end |
| contract_type | TEXT | Yes | — | Contract type |
| photo_url | TEXT | Yes | — | Profile photo URL |
| notes | TEXT | Yes | — | Additional notes |
| created_by | UUID | Yes | — | Creator user FK |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.4 hrm_leave_types

Configuration table for leave categories.

```sql
CREATE TABLE public.hrm_leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  annual_entitlement_days INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hrm_leave_types ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| code | TEXT | No | — | Unique code (e.g., 'ANNUAL', 'SICK') |
| name | TEXT | No | — | Display name |
| description | TEXT | Yes | — | Description |
| annual_entitlement_days | INTEGER | Yes | — | Days per year |
| requires_approval | BOOLEAN | No | true | Needs manager approval |
| is_paid | BOOLEAN | No | true | Paid leave |
| is_active | BOOLEAN | No | true | Active status |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.5 hrm_leave_requests

Employee leave applications and approvals.

```sql
CREATE TABLE public.hrm_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.hrm_leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC(5,2) NOT NULL,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  
  -- Approval workflow
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint: end_date >= start_date
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee ON public.hrm_leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.hrm_leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.hrm_leave_requests(start_date, end_date);

ALTER TABLE public.hrm_leave_requests ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| employee_id | UUID | No | — | Employee FK |
| leave_type_id | UUID | No | — | Leave type FK |
| start_date | DATE | No | — | Leave start date |
| end_date | DATE | No | — | Leave end date |
| days_count | NUMERIC(5,2) | No | — | Number of days |
| reason | TEXT | Yes | — | Leave reason |
| status | leave_status | No | 'pending' | Request status |
| approved_by | UUID | Yes | — | Approver user FK |
| approved_at | TIMESTAMPTZ | Yes | — | Approval timestamp |
| rejection_reason | TEXT | Yes | — | Rejection reason |
| created_by | UUID | Yes | — | Creator user FK |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.6 hrm_attendance_records

Daily attendance tracking for employees.

```sql
CREATE TABLE public.hrm_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- One record per employee per day
  CONSTRAINT uniq_attendance_employee_date UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_employee ON public.hrm_attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON public.hrm_attendance_records(date);
CREATE INDEX idx_attendance_status ON public.hrm_attendance_records(status);

ALTER TABLE public.hrm_attendance_records ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| employee_id | UUID | No | — | Employee FK |
| date | DATE | No | — | Attendance date |
| status | attendance_status | No | 'present' | Attendance status |
| check_in_time | TIME | Yes | — | Check-in time |
| check_out_time | TIME | Yes | — | Check-out time |
| notes | TEXT | Yes | — | Additional notes |
| created_by | UUID | Yes | — | Creator user FK |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.7 hrm_documents

Employee document metadata (files stored in Supabase Storage).

```sql
CREATE TABLE public.hrm_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'contract', 'id_copy', 'certificate', 'evaluation', 'other'
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  expiry_date DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_employee ON public.hrm_documents(employee_id);
CREATE INDEX idx_documents_type ON public.hrm_documents(document_type);

ALTER TABLE public.hrm_documents ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| employee_id | UUID | No | — | Employee FK |
| document_type | TEXT | No | — | Document category |
| file_path | TEXT | No | — | Storage file path |
| file_name | TEXT | No | — | Original filename |
| file_size | INTEGER | Yes | — | File size in bytes |
| mime_type | TEXT | Yes | — | MIME type |
| description | TEXT | Yes | — | Description |
| expiry_date | DATE | Yes | — | Document expiry date |
| is_verified | BOOLEAN | No | false | Verification status |
| uploaded_by | UUID | Yes | — | Uploader user FK |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

### 4.8 user_roles (Security-Critical)

**CRITICAL: This table is separate from any user/profile table to prevent privilege escalation attacks.**

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- One role per user (can be changed to support multiple roles)
  CONSTRAINT uniq_user_role UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | — | Auth user FK |
| role | app_role | No | — | Role enum value |
| assigned_by | UUID | Yes | — | Assigner user FK |
| assigned_at | TIMESTAMPTZ | No | now() | Assignment time |

---

### 4.9 hrm_audit_logs

Comprehensive audit trail for all critical operations.

```sql
CREATE TABLE public.hrm_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL, -- 'employee', 'leave_request', 'document', etc.
  entity_id UUID,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'
  payload JSONB, -- Snapshot of changes
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON public.hrm_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON public.hrm_audit_logs(actor_id);
CREATE INDEX idx_audit_created ON public.hrm_audit_logs(created_at DESC);

ALTER TABLE public.hrm_audit_logs ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| actor_id | UUID | Yes | — | Action performer FK |
| entity_type | TEXT | No | — | Entity type name |
| entity_id | UUID | Yes | — | Entity record ID |
| action | TEXT | No | — | Action performed |
| payload | JSONB | Yes | — | Change snapshot |
| ip_address | TEXT | Yes | — | Client IP |
| user_agent | TEXT | Yes | — | Browser/client info |
| created_at | TIMESTAMPTZ | No | now() | Log timestamp |

---

### 4.10 hrm_settings

System-wide configuration storage.

```sql
CREATE TABLE public.hrm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hrm_settings ENABLE ROW LEVEL SECURITY;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| key | TEXT | No | — | Setting key |
| value | JSONB | No | — | Setting value |
| description | TEXT | Yes | — | Description |
| updated_by | UUID | Yes | — | Last updater FK |
| created_at | TIMESTAMPTZ | No | now() | Creation time |
| updated_at | TIMESTAMPTZ | No | now() | Last update |

---

## 5. Security Functions

### 5.1 Role Check Function (Security Definer)

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
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
```

### 5.2 Get User Role Function

```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;
```

### 5.3 Check Any Admin Function

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('system_admin', 'hr_admin')
  )
$$;
```

---

## 6. Row-Level Security Policies

### 6.1 hrm_employees Policies

```sql
-- HR Admins and System Admins can view all employees
CREATE POLICY "Admins can view all employees"
ON public.hrm_employees
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Managers can view employees in their org unit
CREATE POLICY "Managers can view team employees"
ON public.hrm_employees
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND org_unit_id IN (
    SELECT org_unit_id FROM public.hrm_employees 
    WHERE id = (
      SELECT employee_id FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage employees"
ON public.hrm_employees
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
```

### 6.2 hrm_leave_requests Policies

```sql
-- Employees can view their own leave requests
CREATE POLICY "Employees can view own leave"
ON public.hrm_leave_requests
FOR SELECT
TO authenticated
USING (
  employee_id = (
    SELECT id FROM public.hrm_employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Admins can view all leave requests
CREATE POLICY "Admins can view all leave"
ON public.hrm_leave_requests
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Employees can create their own leave requests
CREATE POLICY "Employees can create leave"
ON public.hrm_leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = (
    SELECT id FROM public.hrm_employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);
```

### 6.3 user_roles Policies

```sql
-- Only system admins can view user roles
CREATE POLICY "Only system admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'));

-- Only system admins can manage roles
CREATE POLICY "Only system admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));
```

---

## 7. Seed Data

### 7.1 Default Leave Types

```sql
INSERT INTO public.hrm_leave_types (code, name, description, annual_entitlement_days, is_paid) VALUES
  ('ANNUAL', 'Annual Leave', 'Regular annual vacation leave', 20, true),
  ('SICK', 'Sick Leave', 'Medical sick leave', 10, true),
  ('MATERNITY', 'Maternity Leave', 'Maternity leave for new mothers', 90, true),
  ('PATERNITY', 'Paternity Leave', 'Paternity leave for new fathers', 5, true),
  ('UNPAID', 'Unpaid Leave', 'Leave without pay', NULL, false),
  ('COMPASSIONATE', 'Compassionate Leave', 'Leave for family emergencies', 5, true);
```

### 7.2 Default System Settings

```sql
INSERT INTO public.hrm_settings (key, value, description) VALUES
  ('organization_name', '"SoZaVo Organization"', 'Organization display name'),
  ('work_week_days', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', 'Working days'),
  ('default_work_hours', '{"start": "08:00", "end": "17:00"}', 'Default work hours'),
  ('fiscal_year_start', '"January"', 'Fiscal year start month');
```

---

## 8. Indexing Strategy Summary

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| hrm_employees | idx_employees_status | status | Filter by status |
| hrm_employees | idx_employees_org_unit | org_unit_id | Filter by unit |
| hrm_leave_requests | idx_leave_requests_employee | employee_id | Employee lookup |
| hrm_leave_requests | idx_leave_requests_dates | start_date, end_date | Date range queries |
| hrm_attendance_records | idx_attendance_date | date | Date filtering |
| hrm_audit_logs | idx_audit_created | created_at DESC | Recent logs |

---

## 9. Future Extensibility

### 9.1 Multi-Tenancy Support

Add `tenant_id` column to all tables:

```sql
ALTER TABLE public.hrm_employees ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
```

### 9.2 Future Modules

| Module | Tables to Add |
|--------|--------------|
| Performance | hrm_performance_reviews, hrm_goals |
| Recruitment | hrm_candidates, hrm_interviews |
| Training | hrm_training_records, hrm_courses |

---

**End of Database Specification**
