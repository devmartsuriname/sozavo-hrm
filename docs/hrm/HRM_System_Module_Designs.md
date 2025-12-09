# SoZaVo HRM System — Module Designs

**Version:** 2.0  
**Last Updated:** 2025-01-09  
**Status:** Pre-Implementation Specification

---

## 1. Overview

This document provides detailed design specifications for each HRM module, including workflows, data flows, UI components, and API patterns. All modules are designed to integrate seamlessly with the Darkone React template.

---

## 2. Module Summary

| Module | Priority | Description |
|--------|----------|-------------|
| **Core HR** | P0 | Employees, organization structure, positions |
| **RBAC** | P0 | User management, role assignment, access control |
| **Leave Management** | P1 | Leave types, requests, approvals |
| **Attendance** | P1 | Daily tracking, bulk operations |
| **Documents** | P2 | File uploads, document center |
| **Dashboard** | P2 | KPIs, charts, reports |
| **Audit Logs** | P2 | Action tracking, filtering |
| **Settings** | P3 | System configuration |

---

## 3. Core HR Module

### 3.1 Overview

The Core HR module is the foundation of the HRM system, managing employee records, organizational structure, and job positions.

### 3.2 Sub-Modules

#### 3.2.1 Organization Units Management

**Purpose:** Manage hierarchical organizational structure.

**Data Flow:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│  Org Tree   │────▶│ OrgService  │────▶│ hrm_organization_   │
│  Component  │     │             │     │      units          │
└─────────────┘     └─────────────┘     └─────────────────────┘
```

**UI Components (Darkone):**

| Component | Source | Usage |
|-----------|--------|-------|
| Tree View | Darkone Tree Component | Hierarchy display |
| Data Table | Darkone DataTable | List view |
| Modal Form | React Bootstrap Modal | Create/Edit |
| Card | Darkone Card | Unit details |

**Features:**
- Hierarchical tree view of organization
- CRUD operations for units
- Parent-child relationships
- Drag-and-drop reordering (future)

**Page Routes:**
```
/hrm/organization              → Organization list
/hrm/organization/units        → Units management
/hrm/organization/units/:id    → Unit details
```

**Service Methods:**
```typescript
interface OrgUnitService {
  getAll(): Promise<OrgUnit[]>;
  getTree(): Promise<OrgUnitTree[]>;
  getById(id: string): Promise<OrgUnit>;
  create(unit: CreateOrgUnitInput): Promise<OrgUnit>;
  update(id: string, unit: UpdateOrgUnitInput): Promise<OrgUnit>;
  delete(id: string): Promise<void>;
  getChildren(parentId: string): Promise<OrgUnit[]>;
}
```

---

#### 3.2.2 Positions Management

**Purpose:** Manage standardized job titles and roles.

**UI Components:**

| Component | Usage |
|-----------|-------|
| Data Table | Position list with filters |
| Modal Form | Create/Edit position |
| Badge | Category tags |

**Features:**
- CRUD for positions
- Category classification
- Salary scale reference
- Active/inactive toggle

**Page Routes:**
```
/hrm/organization/positions         → Positions list
/hrm/organization/positions/:id     → Position details
```

---

#### 3.2.3 Employee Management

**Purpose:** Central employee registry with full profile management.

**Data Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│                     Employee Module                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌────────────────┐     ┌───────────┐  │
│  │ Employee    │────▶│ EmployeeService│────▶│ Supabase  │  │
│  │ List Page   │◀────│                │◀────│ (RLS)     │  │
│  └─────────────┘     └────────────────┘     └───────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ Employee    │                                           │
│  │ Detail Page │                                           │
│  │  ┌───────┐  │                                           │
│  │  │ Tabs  │  │                                           │
│  │  │ ─────  │  │                                           │
│  │  │Profile │  │                                           │
│  │  │Leave   │  │                                           │
│  │  │Attend. │  │                                           │
│  │  │Docs    │  │                                           │
│  │  └───────┘  │                                           │
│  └─────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**UI Components:**

| Component | Darkone Source | Usage |
|-----------|----------------|-------|
| DataTable | Tables → DataTable | Employee list |
| Tabs | UI → Tabs | Profile sections |
| Form | Forms → Validation | Create/Edit |
| Avatar | UI → Avatar | Profile photo |
| Badge | UI → Badge | Status indicator |
| Dropdown | UI → Dropdown | Actions menu |

**Employee List Features:**
- Filterable data table
- Search by name, employee number
- Filter by status, org unit, position
- Export to CSV/Excel
- Bulk actions (future)

**Employee Detail Tabs:**
1. **Profile** - Personal & employment info
2. **Leave** - Leave history & balances
3. **Attendance** - Attendance records
4. **Documents** - Employee documents
5. **Audit** - Change history

**Page Routes:**
```
/hrm/employees                  → Employee list
/hrm/employees/create           → Create employee
/hrm/employees/:id              → Employee detail (tabs)
/hrm/employees/:id/edit         → Edit employee
```

**Service Methods:**
```typescript
interface EmployeeService {
  getAll(filters?: EmployeeFilters): Promise<PaginatedResult<Employee>>;
  getById(id: string): Promise<Employee>;
  create(employee: CreateEmployeeInput): Promise<Employee>;
  update(id: string, employee: UpdateEmployeeInput): Promise<Employee>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Employee[]>;
  getByOrgUnit(orgUnitId: string): Promise<Employee[]>;
  updateStatus(id: string, status: EmployeeStatus): Promise<Employee>;
}
```

**Validation Schema (Zod):**
```typescript
const employeeSchema = z.object({
  employee_no: z.string().min(1, 'Employee number is required'),
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.date().optional(),
  org_unit_id: z.string().uuid().optional(),
  position_id: z.string().uuid().optional(),
  employment_type: z.enum(['permanent', 'contract', 'temporary']),
  hire_date: z.date(),
});
```

---

## 4. RBAC Module (Role-Based Access Control)

### 4.1 Overview

Manages user accounts, role assignments, and access control. **Critical: Roles are stored in a separate `user_roles` table.**

### 4.2 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       RBAC Module                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                       │
│  │   auth.users    │ ◀──── Supabase Auth (email/password)  │
│  └────────┬────────┘                                       │
│           │                                                 │
│           │ 1:N                                             │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │   user_roles    │ ◀──── SEPARATE TABLE (Security!)      │
│  │   ────────────   │                                       │
│  │   user_id (FK)  │                                       │
│  │   role (enum)   │                                       │
│  └─────────────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │  has_role()     │ ◀──── Security Definer Function       │
│  │  get_user_role()│                                       │
│  │  is_admin()     │                                       │
│  └─────────────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │  RLS Policies   │ ◀──── Per-table access control        │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Role Definitions

| Role | Code | Permissions |
|------|------|-------------|
| System Admin | `system_admin` | Full access + user management + settings |
| HR Admin | `hr_admin` | Full HR data access (no system config) |
| Manager | `manager` | Team view + leave approvals |
| HR Viewer | `hr_viewer` | Read-only HR data |
| Executive | `executive` | Dashboards + reports only |

### 4.4 User Management Features

**UI Components:**

| Component | Usage |
|-----------|-------|
| DataTable | User list |
| Modal | Create/Edit user |
| Select | Role dropdown |
| Switch | Active/Disabled toggle |

**Features:**
- Create user (invites via Supabase Auth)
- Assign/change role
- Link user to employee record
- Deactivate user
- View user activity

**Page Routes:**
```
/users                    → User list
/users/create             → Create user (invite)
/users/:id                → User details
/users/:id/edit           → Edit user/role
```

### 4.5 Route Guards

```typescript
// RouteGuard.tsx
interface RouteGuardProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles, children }) => {
  const { userRole, isLoading } = useAuth();
  
  if (isLoading) return <FallbackLoading />;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Usage in routes
<Route 
  path="/hrm/employees" 
  element={
    <RouteGuard allowedRoles={['system_admin', 'hr_admin', 'manager']}>
      <EmployeeListPage />
    </RouteGuard>
  } 
/>
```

### 4.6 Permission Matrix

| Feature | system_admin | hr_admin | manager | hr_viewer | executive |
|---------|:------------:|:--------:|:-------:|:---------:|:---------:|
| View all employees | ✅ | ✅ | ❌ | ✅ | ❌ |
| View team employees | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create/Edit employees | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete employees | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve leave | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dashboards | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 5. Leave Management Module

### 5.1 Overview

Manages leave types, employee leave requests, and approval workflows.

### 5.2 Leave Request Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Submit    │────▶│   Pending   │────▶│  Approved   │────▶│  Completed  │
│   Request   │     │   Review    │     │             │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘     └─────────────┘
                          │
                          │ Reject
                          ▼
                   ┌─────────────┐
                   │  Rejected   │
                   │             │
                   └─────────────┘
```

### 5.3 Leave Types Configuration

**Features:**
- CRUD for leave types
- Set annual entitlement days
- Mark as paid/unpaid
- Require approval toggle

**Page Routes:**
```
/hrm/leave/types              → Leave types list
/hrm/leave/types/create       → Create leave type
/hrm/leave/types/:id/edit     → Edit leave type
```

### 5.4 Leave Requests

**UI Components:**

| Component | Usage |
|-----------|-------|
| DataTable | Request list with filters |
| Calendar | Date range picker |
| Modal | Request form |
| Badge | Status indicator |
| Button Group | Approve/Reject actions |

**Features:**
- Submit leave request
- View request status
- Manager approval workflow
- Prevent overlapping leaves
- Leave balance tracking
- Request history

**Page Routes:**
```
/hrm/leave                    → Leave dashboard
/hrm/leave/requests           → All requests (admin)
/hrm/leave/my-requests        → My requests (employee view)
/hrm/leave/requests/create    → Create request
/hrm/leave/requests/:id       → Request details
/hrm/leave/approvals          → Pending approvals (manager)
```

**Service Methods:**
```typescript
interface LeaveService {
  getTypes(): Promise<LeaveType[]>;
  getRequests(filters?: LeaveFilters): Promise<LeaveRequest[]>;
  getMyRequests(): Promise<LeaveRequest[]>;
  getById(id: string): Promise<LeaveRequest>;
  create(request: CreateLeaveRequest): Promise<LeaveRequest>;
  approve(id: string): Promise<LeaveRequest>;
  reject(id: string, reason: string): Promise<LeaveRequest>;
  cancel(id: string): Promise<LeaveRequest>;
  getBalance(employeeId: string): Promise<LeaveBalance[]>;
  checkOverlap(employeeId: string, startDate: Date, endDate: Date): Promise<boolean>;
}
```

### 5.5 RLS Policies for Leave

```sql
-- Employees see own requests
CREATE POLICY "Employees view own leave"
ON public.hrm_leave_requests FOR SELECT
USING (employee_id IN (
  SELECT id FROM public.hrm_employees 
  WHERE email = auth.jwt() ->> 'email'
));

-- Managers see team requests
CREATE POLICY "Managers view team leave"
ON public.hrm_leave_requests FOR SELECT
USING (
  public.has_role(auth.uid(), 'manager')
  AND employee_id IN (
    SELECT id FROM public.hrm_employees 
    WHERE org_unit_id = (
      SELECT org_unit_id FROM public.hrm_employees e
      JOIN public.user_roles ur ON e.email = (
        SELECT email FROM auth.users WHERE id = ur.user_id
      )
      WHERE ur.user_id = auth.uid()
    )
  )
);
```

---

## 6. Attendance Module

### 6.1 Overview

Tracks daily employee attendance with bulk operation support.

### 6.2 Features

**Daily Attendance:**
- Mark attendance status (present, absent, sick, late)
- Record check-in/check-out times
- Add notes for absences
- Bulk status assignment

**Reporting:**
- Monthly attendance summary
- Attendance rate by unit
- Export to CSV/Excel

### 6.3 UI Components

| Component | Usage |
|-----------|-------|
| DataTable | Attendance grid |
| Calendar | Date navigation |
| Dropdown | Status selection |
| Checkbox | Bulk selection |
| Progress | Attendance rate |

### 6.4 Page Routes

```
/hrm/attendance                    → Attendance dashboard
/hrm/attendance/daily              → Daily attendance entry
/hrm/attendance/employee/:id       → Employee attendance history
/hrm/attendance/reports            → Attendance reports
```

### 6.5 Service Methods

```typescript
interface AttendanceService {
  getByDate(date: Date): Promise<AttendanceRecord[]>;
  getByEmployee(employeeId: string, dateRange: DateRange): Promise<AttendanceRecord[]>;
  create(record: CreateAttendanceRecord): Promise<AttendanceRecord>;
  update(id: string, record: UpdateAttendanceRecord): Promise<AttendanceRecord>;
  bulkCreate(records: CreateAttendanceRecord[]): Promise<AttendanceRecord[]>;
  bulkUpdate(updates: BulkAttendanceUpdate[]): Promise<AttendanceRecord[]>;
  getSummary(employeeId: string, month: Date): Promise<AttendanceSummary>;
  getOrgUnitSummary(orgUnitId: string, month: Date): Promise<OrgUnitAttendanceSummary>;
}
```

---

## 7. Documents Module

### 7.1 Overview

Manages employee document uploads and storage using Supabase Storage.

### 7.2 Document Categories

| Category | Code | Description |
|----------|------|-------------|
| Contract | `contract` | Employment contracts |
| ID Copy | `id_copy` | National ID, passport |
| Certificate | `certificate` | Qualifications, training |
| Evaluation | `evaluation` | Performance reviews |
| Medical | `medical` | Medical certificates |
| Other | `other` | Miscellaneous documents |

### 7.3 File Upload Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  File       │────▶│ Validation  │────▶│  Supabase   │────▶│  Metadata   │
│  Selection  │     │ (type/size) │     │  Storage    │     │  to DB      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 7.4 UI Components

| Component | Usage |
|-----------|-------|
| Dropzone | File drag & drop |
| File List | Document grid |
| Preview | PDF/image preview |
| Modal | Upload form |

### 7.5 Page Routes

```
/hrm/documents                     → Document center
/hrm/employees/:id/documents       → Employee documents tab
```

### 7.6 Service Methods

```typescript
interface DocumentService {
  getByEmployee(employeeId: string): Promise<Document[]>;
  upload(employeeId: string, file: File, metadata: DocumentMetadata): Promise<Document>;
  delete(id: string): Promise<void>;
  getDownloadUrl(id: string): Promise<string>;
  getPreviewUrl(id: string): Promise<string>;
}
```

### 7.7 Storage Bucket Configuration

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hrm-documents', 'hrm-documents', false);

-- RLS: Only HR admins can access
CREATE POLICY "HR admins access documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'hrm-documents'
  AND public.is_admin(auth.uid())
);
```

---

## 8. Dashboard Module

### 8.1 Overview

Provides KPI displays, charts, and reporting functionality for management.

### 8.2 KPI Cards

| KPI | Description | Calculation |
|-----|-------------|-------------|
| Total Employees | Active employee count | COUNT where status = 'active' |
| New Hires (Month) | Employees hired this month | COUNT where hire_date in current month |
| Pending Leave | Leave requests awaiting approval | COUNT where status = 'pending' |
| Attendance Rate | Today's attendance percentage | Present / Total × 100 |
| Upcoming Contracts | Contracts expiring in 30 days | COUNT where contract_end_date <= now + 30 |

### 8.3 Charts

| Chart | Type | Data Source |
|-------|------|-------------|
| Employees by Org Unit | Pie/Donut | Employee distribution |
| Leave Trends | Line | Monthly leave statistics |
| Attendance Overview | Bar | Weekly attendance |
| Headcount Trend | Area | Monthly employee count |

### 8.4 UI Components (Darkone)

| Component | Source |
|-----------|--------|
| Stat Card | Darkone Dashboard Cards |
| ApexChart | React ApexCharts |
| DataTable | Darkone DataTable |

### 8.5 Page Routes

```
/dashboards                        → Main HRM dashboard
/hrm/reports                       → Reports center
/hrm/reports/employees             → Employee report
/hrm/reports/attendance            → Attendance report
/hrm/reports/leave                 → Leave report
```

### 8.6 Export Features

- Export employee list (CSV, Excel)
- Export attendance data (CSV, Excel)
- Export leave data (CSV, Excel)
- Generate PDF reports (future)

---

## 9. Audit Logs Module

### 9.1 Overview

Provides comprehensive tracking of all critical system actions.

### 9.2 Logged Actions

| Entity | Actions Logged |
|--------|----------------|
| Employee | CREATE, UPDATE, DELETE, STATUS_CHANGE |
| Leave Request | CREATE, APPROVE, REJECT, CANCEL |
| Attendance | CREATE, UPDATE, BULK_UPDATE |
| Document | UPLOAD, DELETE |
| User | CREATE, ROLE_CHANGE, DISABLE |
| Settings | UPDATE |

### 9.3 Audit Log Fields

```typescript
interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  entity_type: string;
  entity_id: string;
  action: string;
  payload: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    changes?: string[];
  };
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}
```

### 9.4 UI Components

| Component | Usage |
|-----------|-------|
| DataTable | Log list with pagination |
| Filters | Date range, entity type, actor |
| Modal | Log detail view |
| JSON Viewer | Payload display |

### 9.5 Page Routes

```
/audit                        → Audit logs list
/audit/:id                    → Log detail
```

### 9.6 RLS Policies

```sql
-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs"
ON public.hrm_audit_logs FOR SELECT
USING (public.is_admin(auth.uid()));
```

---

## 10. Settings Module

### 10.1 Overview

Manages system-wide configuration and organization settings.

### 10.2 Settings Categories

| Category | Settings |
|----------|----------|
| Organization | Name, logo, address |
| Work Schedule | Work days, work hours |
| Leave | Default entitlements, approval rules |
| Notifications | Email settings (future) |
| System | Date format, language |

### 10.3 Page Routes

```
/settings                         → Settings dashboard
/settings/organization            → Organization settings
/settings/work-schedule           → Work schedule config
/settings/leave                   → Leave policy settings
```

---

## 11. Shared Components

### 11.1 HRM-Specific Components

Create under `src/components/hrm/`:

| Component | Purpose |
|-----------|---------|
| `EmployeeSelect` | Searchable employee dropdown |
| `OrgUnitSelect` | Org unit dropdown with hierarchy |
| `PositionSelect` | Position dropdown |
| `StatusBadge` | Colored status indicator |
| `LeaveBalanceCard` | Leave balance display |
| `AttendanceCalendar` | Monthly attendance view |
| `AuditTimeline` | Change history timeline |

### 11.2 Common Patterns

**List Page Pattern:**
```typescript
const EmployeeListPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => EmployeeService.getAll(filters),
  });

  return (
    <PageContainer title="Employees">
      <Card>
        <Card.Header>
          <FilterBar />
          <CreateButton />
        </Card.Header>
        <Card.Body>
          <DataTable
            data={data}
            columns={columns}
            loading={isLoading}
          />
        </Card.Body>
      </Card>
    </PageContainer>
  );
};
```

**Form Modal Pattern:**
```typescript
const CreateEmployeeModal = ({ show, onHide, onSuccess }) => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(employeeSchema),
  });

  const mutation = useMutation({
    mutationFn: EmployeeService.create,
    onSuccess: () => {
      toast.success('Employee created');
      onSuccess();
    },
  });

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit(mutation.mutate)}>
        {/* Form fields */}
      </Form>
    </Modal>
  );
};
```

---

**End of Module Designs Document**
