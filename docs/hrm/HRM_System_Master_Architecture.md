# SoZaVo HRM System — Master Architecture Document

**Version:** 2.0  
**Last Updated:** 2025-01-09  
**Status:** Unified Master Plan (Pre-Implementation)

---

## 1. Executive Summary

The SoZaVo HRM System is a modular, enterprise-grade Human Resources Management platform designed for government and organizational use. Built on the **Darkone React Template** (fully integrated) with **Supabase Cloud** as the backend, the system provides centralized management of employees, leave workflows, attendance tracking, document storage, and comprehensive reporting.

### Key Design Principles

| Principle | Description |
|-----------|-------------|
| **Modularity** | Feature-based architecture enabling independent module development |
| **Security-First** | Row-Level Security (RLS), separate user_roles table, JWT-based auth |
| **Template Fidelity** | Strict 1:1 adherence to Darkone React UI components |
| **Migration-Ready** | Abstracted services for future VPS/self-hosted deployment |
| **Scalability** | Designed for 1000+ employees with proper indexing and pagination |

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Darkone React Template                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │ Layouts │ │Components│ │  Pages  │ │  Services   │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Query + Supabase Client               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD (BACKEND)                     │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐ │
│  │   PostgreSQL  │ │  Supabase     │ │  Supabase Storage     │ │
│  │   Database    │ │  Auth         │ │  (Documents)          │ │
│  │   + RLS       │ │  (JWT/Email)  │ │                       │ │
│  └───────────────┘ └───────────────┘ └───────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Edge Functions (Automation/API)              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Language** | TypeScript | Type-safe development |
| **Framework** | React 18+ | Component-based UI |
| **Build Tool** | Vite | Fast development server |
| **UI Framework** | Darkone React Template | Pre-built enterprise UI |
| **Styling** | SCSS + Bootstrap 5 | Template-native styling |
| **State Management** | React Query (TanStack) | Server state & caching |
| **Forms** | React Hook Form + Zod | Validation & form handling |
| **Routing** | React Router v6 | SPA navigation |
| **Backend** | Supabase Cloud | Database, Auth, Storage |
| **Database** | PostgreSQL | Relational data storage |
| **Security** | RLS + JWT + RBAC | Multi-layer protection |

---

## 3. Frontend Architecture

### 3.1 Repository Structure (Aligned with Darkone)

```
src/
├── app/                          # Route-based pages
│   ├── (admin)/                  # Admin layout routes
│   │   ├── dashboards/           # Dashboard pages
│   │   ├── hrm/                  # HRM module pages (NEW)
│   │   │   ├── employees/        # Employee management
│   │   │   ├── organization/     # Org units & positions
│   │   │   ├── leave/            # Leave management
│   │   │   ├── attendance/       # Attendance tracking
│   │   │   ├── documents/        # Document center
│   │   │   └── reports/          # HRM reports
│   │   ├── users/                # User management (NEW)
│   │   ├── settings/             # System settings (NEW)
│   │   └── audit/                # Audit logs (NEW)
│   └── (other)/                  # Auth & public routes
├── assets/                       # Static assets & SCSS
├── components/                   # Reusable UI components
│   ├── layout/                   # Navigation, sidebar, header
│   ├── ui/                       # Buttons, cards, modals
│   └── hrm/                      # HRM-specific components (NEW)
├── context/                      # React contexts
├── helpers/                      # Utility functions
├── hooks/                        # Custom React hooks
├── layouts/                      # Page layouts
├── routes/                       # Route configuration
├── services/                     # API service layer (NEW)
│   ├── AuthService.ts
│   ├── EmployeeService.ts
│   ├── LeaveService.ts
│   ├── AttendanceService.ts
│   ├── DocumentService.ts
│   └── AuditService.ts
├── types/                        # TypeScript definitions
│   └── hrm/                      # HRM types (NEW)
└── utils/                        # Utility functions
```

### 3.2 Component Architecture

All HRM components follow the Darkone template patterns:

| Component Type | Source | Usage |
|---------------|--------|-------|
| **Tables** | Darkone DataTables | Employee lists, attendance |
| **Forms** | Darkone Form Components | Create/Edit modals |
| **Cards** | Darkone Card Components | KPI displays |
| **Charts** | ApexCharts (Darkone) | Dashboard visualizations |
| **Modals** | React Bootstrap Modal | CRUD operations |
| **Navigation** | Darkone Sidebar | Menu structure |

### 3.3 State Management Strategy

```
┌─────────────────────────────────────────────────────┐
│                  React Query                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ Server State (employees, leave, attendance)   │ │
│  │ - Automatic caching                           │ │
│  │ - Background refetching                       │ │
│  │ - Optimistic updates                          │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│               React Context                         │
│  ┌───────────────────────────────────────────────┐ │
│  │ App State (auth, theme, sidebar)              │ │
│  │ - AuthContext: current user & session         │ │
│  │ - LayoutContext: UI state                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture (Supabase Cloud)

### 4.1 Database Schema Overview

All HRM tables use the `hrm_` prefix in the `public` schema:

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `hrm_employees` | Employee master data | → org_units, positions |
| `hrm_organization_units` | Organizational hierarchy | Self-referencing |
| `hrm_positions` | Job titles/roles | → employees |
| `hrm_leave_types` | Leave category config | → leave_requests |
| `hrm_leave_requests` | Leave applications | → employees, leave_types |
| `hrm_attendance_records` | Daily attendance | → employees |
| `hrm_documents` | Employee documents | → employees |
| `user_roles` | RBAC roles (separate) | → auth.users |
| `hrm_audit_logs` | Action audit trail | → auth.users |
| `hrm_settings` | System configuration | — |

### 4.2 Authentication Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Login     │───▶│ Supabase     │───▶│ JWT Token       │
│   Form      │    │ Auth         │    │ (includes uid)  │
└─────────────┘    └──────────────┘    └─────────────────┘
                                              │
                          ┌───────────────────┘
                          ▼
                   ┌─────────────────┐
                   │ user_roles      │
                   │ (lookup role)   │
                   └─────────────────┘
                          │
                          ▼
                   ┌─────────────────┐
                   │ RLS Policies    │
                   │ (enforce access)│
                   └─────────────────┘
```

### 4.3 Row-Level Security Model

**Critical Security Pattern**: Roles are stored in a **separate `user_roles` table** to prevent privilege escalation attacks.

```sql
-- Security definer function for role checks
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

-- Example RLS policy using the function
CREATE POLICY "HR Admins can view all employees"
ON public.hrm_employees
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr_admin'));
```

### 4.4 Storage Architecture

| Bucket | Purpose | Access |
|--------|---------|--------|
| `hrm-documents` | Employee documents (contracts, IDs) | HR Admin, System Admin |
| `hrm-photos` | Employee profile photos | All authenticated |
| `hrm-exports` | Generated reports | Role-based |

---

## 5. Security Architecture

### 5.1 RBAC Model

| Role | Code | Access Level |
|------|------|--------------|
| **System Administrator** | `system_admin` | Full system access + configuration |
| **HR Administrator** | `hr_admin` | Full HR data access |
| **Department Manager** | `manager` | Team data + approvals |
| **HR Viewer/Analyst** | `hr_viewer` | Read-only HR data |
| **Executive** | `executive` | Dashboard + reports only |

### 5.2 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Authentication (Supabase Auth)                 │
│ - Email/password login                                  │
│ - JWT token management                                  │
│ - Session handling                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Authorization (RBAC)                           │
│ - user_roles table (SEPARATE from users)                │
│ - has_role() security definer function                  │
│ - Route guards on frontend                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Row-Level Security (RLS)                       │
│ - Per-table policies                                    │
│ - Role-based data filtering                             │
│ - Automatic enforcement                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Audit Trail                                    │
│ - All CRUD operations logged                            │
│ - Actor identification                                  │
│ - Payload snapshots                                     │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Data Protection

| Data Type | Protection Method |
|-----------|-------------------|
| Passwords | Supabase Auth (bcrypt) |
| National IDs | RLS + encrypted at rest |
| Documents | Storage RLS policies |
| Audit Logs | Append-only, admin access |

---

## 6. Module Architecture

### 6.1 Module Boundaries

Each HRM module operates independently with clear interfaces:

```
┌─────────────────────────────────────────────────────────────────┐
│                          HRM SYSTEM                             │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│   Core HR   │    RBAC     │   Leave     │ Attendance  │  Docs  │
│             │             │             │             │        │
│ • Employees │ • Users     │ • Types     │ • Records   │ • Upload│
│ • Org Units │ • Roles     │ • Requests  │ • Bulk Ops  │ • View │
│ • Positions │ • Guards    │ • Approvals │ • Reports   │ • Types│
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘
        │             │             │             │           │
        └─────────────┴─────────────┴─────────────┴───────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    Shared Services        │
                    │ • Supabase Client         │
                    │ • Auth Context            │
                    │ • React Query             │
                    │ • Zod Schemas             │
                    └───────────────────────────┘
```

### 6.2 Service Layer Pattern

All data operations go through typed service classes:

```typescript
// Example: EmployeeService.ts
export const EmployeeService = {
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    const query = supabase
      .from('hrm_employees')
      .select('*, organization_unit:hrm_organization_units(*), position:hrm_positions(*)');
    
    if (filters?.status) query.eq('status', filters.status);
    if (filters?.orgUnitId) query.eq('org_unit_id', filters.orgUnitId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async create(employee: CreateEmployeeInput): Promise<Employee> {
    const { data, error } = await supabase
      .from('hrm_employees')
      .insert(employee)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // ... update, delete, etc.
};
```

---

## 7. Deployment Architecture

### 7.1 Current: Lovable + Supabase Cloud

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Developer    │────▶│    Lovable      │────▶│  Supabase Cloud │
│    (Browser)    │     │  (Build/Deploy) │     │    (Backend)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   GitHub Repo   │
                        │  (Version Ctrl) │
                        └─────────────────┘
```

### 7.2 Future: VPS Migration Path

The architecture supports migration to self-hosted infrastructure:

| Component | Current | Future (VPS) |
|-----------|---------|--------------|
| Frontend | Lovable CDN | Nginx + Node |
| Database | Supabase Postgres | PostgreSQL |
| Auth | Supabase Auth | Keycloak/Custom |
| Storage | Supabase Storage | MinIO/S3 |
| Edge Functions | Supabase Edge | Express/NestJS |

**Migration-Ready Abstractions:**
- `AuthService` wraps Supabase Auth (replaceable)
- `StorageService` wraps Supabase Storage (replaceable)
- Standard SQL migrations (portable)
- Environment-based configuration

---

## 8. Integration Architecture

### 8.1 Current MVP: Direct Supabase Client

All operations use the Supabase JavaScript client:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Direct database operations
const { data } = await supabase.from('hrm_employees').select('*');

// Auth operations
const { data: session } = await supabase.auth.getSession();

// Storage operations
const { data: url } = await supabase.storage.from('hrm-documents').getPublicUrl(path);
```

### 8.2 Future: REST API Layer

For external integrations (payroll, government systems):

```
/api/v1/employees          GET, POST
/api/v1/employees/{id}     GET, PUT, DELETE
/api/v1/leave-requests     GET, POST
/api/v1/attendance         GET, POST
/api/v1/reports/export     GET
```

---

## 9. Performance Strategy

### 9.1 Frontend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Code Splitting** | Lazy-loaded routes via React.lazy() |
| **Caching** | React Query with 5-minute stale time |
| **Pagination** | Server-side pagination for lists |
| **Optimistic Updates** | Immediate UI feedback |

### 9.2 Database Optimization

| Technique | Implementation |
|-----------|----------------|
| **Indexing** | Foreign keys, status, date columns |
| **Query Optimization** | Select only needed columns |
| **Connection Pooling** | Supabase built-in |

---

## 10. Appendices

### 10.1 Document References

| Document | Purpose |
|----------|---------|
| `HRM_System_Database_Specification.md` | Complete schema |
| `HRM_System_Module_Designs.md` | Module details |
| `HRM_System_Implementation_Roadmap_v2.md` | Build phases |
| `HRM_System_API_Spec_v2.md` | API specifications |
| `HRM_System_Developer_Guide.md` | Development standards |

### 10.2 Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-01 | Initial draft |
| 2.0 | 2025-01-09 | Unified with Darkone integration |

---

**End of Master Architecture Document**
