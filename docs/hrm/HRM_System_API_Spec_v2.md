# SoZaVo HRM System — API Specification v2.0

**Version:** 2.0  
**Last Updated:** 2025-01-09  
**Status:** Pre-Implementation Specification

---

## 1. Introduction

This document defines the API architecture for the SoZaVo HRM System. The MVP uses **direct Supabase client operations** via the frontend service layer. Future phases may introduce dedicated REST API endpoints for external integrations.

### API Evolution Strategy

| Phase | Approach | Use Case |
|-------|----------|----------|
| MVP | Supabase Client | Frontend operations |
| Phase 2+ | Edge Functions | Complex logic, automations |
| Future | REST API | External integrations |

---

## 2. Architecture Overview

### 2.1 Current Architecture (MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    React Components                      ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Service Layer                         ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐││
│  │  │EmployeeServ│ │ LeaveService│ │  AttendanceService  │││
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Supabase Client + React Query               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                            │
│  ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐  │
│  │   PostgREST     │ │  Supabase     │ │  Storage API    │  │
│  │   (Auto API)    │ │  Auth         │ │                 │  │
│  └─────────────────┘ └───────────────┘ └─────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               PostgreSQL + RLS                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Future Architecture (REST API)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│   API Gateway   │────▶│   PostgreSQL    │
│    (React)      │     │  (Edge/Express) │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ External System │  │  Payroll API    │  │  Govt Systems   │
│    (Webhook)    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 3. Service Layer Specification

### 3.1 Service Pattern

All services follow a consistent pattern:

```typescript
// Base service structure
interface BaseService<T, CreateInput, UpdateInput, Filters> {
  getAll(filters?: Filters): Promise<PaginatedResult<T>>;
  getById(id: string): Promise<T>;
  create(input: CreateInput): Promise<T>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

// Pagination result type
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Base filter type
interface BaseFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

---

### 3.2 EmployeeService

**Purpose:** Manage employee records.

```typescript
// src/services/EmployeeService.ts

import { supabase } from '@/integrations/supabase/client';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters } from '@/types/hrm';

export const EmployeeService = {
  /**
   * Get all employees with optional filters
   */
  async getAll(filters?: EmployeeFilters): Promise<PaginatedResult<Employee>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('hrm_employees')
      .select(`
        *,
        organization_unit:hrm_organization_units(*),
        position:hrm_positions(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.orgUnitId) query = query.eq('org_unit_id', filters.orgUnitId);
    if (filters?.positionId) query = query.eq('position_id', filters.positionId);
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_no.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('hrm_employees')
      .select(`
        *,
        organization_unit:hrm_organization_units(*),
        position:hrm_positions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new employee
   */
  async create(input: CreateEmployeeInput): Promise<Employee> {
    const { data, error } = await supabase
      .from('hrm_employees')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    
    // Log audit event
    await AuditService.log('employee', data.id, 'CREATE', { after: data });
    
    return data;
  },

  /**
   * Update employee
   */
  async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
    // Get current state for audit
    const before = await this.getById(id);
    
    const { data, error } = await supabase
      .from('hrm_employees')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Log audit event
    await AuditService.log('employee', id, 'UPDATE', { before, after: data });
    
    return data;
  },

  /**
   * Delete employee (soft delete via status change)
   */
  async delete(id: string): Promise<void> {
    const before = await this.getById(id);
    
    const { error } = await supabase
      .from('hrm_employees')
      .update({ status: 'terminated', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    await AuditService.log('employee', id, 'DELETE', { before });
  },

  /**
   * Search employees by name or employee number
   */
  async search(query: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('hrm_employees')
      .select('id, employee_no, first_name, last_name, email')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,employee_no.ilike.%${query}%`)
      .eq('status', 'active')
      .limit(10);

    if (error) throw error;
    return data || [];
  },
};
```

**Filters Interface:**
```typescript
interface EmployeeFilters extends BaseFilters {
  status?: 'active' | 'inactive' | 'terminated' | 'on_leave';
  orgUnitId?: string;
  positionId?: string;
  employmentType?: 'permanent' | 'contract' | 'temporary';
}
```

---

### 3.3 LeaveService

**Purpose:** Manage leave types and requests.

```typescript
// src/services/LeaveService.ts

export const LeaveService = {
  // ============ Leave Types ============
  
  async getTypes(): Promise<LeaveType[]> {
    const { data, error } = await supabase
      .from('hrm_leave_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async createType(input: CreateLeaveTypeInput): Promise<LeaveType> {
    const { data, error } = await supabase
      .from('hrm_leave_types')
      .insert(input)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ Leave Requests ============
  
  async getRequests(filters?: LeaveFilters): Promise<PaginatedResult<LeaveRequest>> {
    let query = supabase
      .from('hrm_leave_requests')
      .select(`
        *,
        employee:hrm_employees(id, first_name, last_name, employee_no),
        leave_type:hrm_leave_types(*)
      `, { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);
    if (filters?.startDate) query = query.gte('start_date', filters.startDate);
    if (filters?.endDate) query = query.lte('end_date', filters.endDate);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0, page: 1, pageSize: 20, totalPages: 1 };
  },

  async createRequest(input: CreateLeaveRequest): Promise<LeaveRequest> {
    // Check for overlapping leaves
    const hasOverlap = await this.checkOverlap(
      input.employee_id,
      input.start_date,
      input.end_date
    );
    
    if (hasOverlap) {
      throw new Error('Leave request overlaps with existing approved leave');
    }

    const { data, error } = await supabase
      .from('hrm_leave_requests')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    
    await AuditService.log('leave_request', data.id, 'CREATE', { after: data });
    
    return data;
  },

  async approve(id: string): Promise<LeaveRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('hrm_leave_requests')
      .update({
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    await AuditService.log('leave_request', id, 'APPROVE', { after: data });
    
    return data;
  },

  async reject(id: string, reason: string): Promise<LeaveRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('hrm_leave_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    await AuditService.log('leave_request', id, 'REJECT', { after: data });
    
    return data;
  },

  async checkOverlap(employeeId: string, startDate: string, endDate: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('hrm_leave_requests')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('status', 'approved')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  },

  async getBalance(employeeId: string): Promise<LeaveBalance[]> {
    // Get leave types
    const types = await this.getTypes();
    
    // Get used days per type (current year)
    const year = new Date().getFullYear();
    const { data: used } = await supabase
      .from('hrm_leave_requests')
      .select('leave_type_id, days_count')
      .eq('employee_id', employeeId)
      .eq('status', 'approved')
      .gte('start_date', `${year}-01-01`)
      .lte('end_date', `${year}-12-31`);

    // Calculate balances
    return types.map(type => {
      const usedDays = used
        ?.filter(u => u.leave_type_id === type.id)
        .reduce((sum, u) => sum + Number(u.days_count), 0) || 0;

      return {
        leaveTypeId: type.id,
        leaveTypeName: type.name,
        entitlement: type.annual_entitlement_days || 0,
        used: usedDays,
        remaining: (type.annual_entitlement_days || 0) - usedDays,
      };
    });
  },
};
```

---

### 3.4 AttendanceService

**Purpose:** Manage daily attendance records.

```typescript
// src/services/AttendanceService.ts

export const AttendanceService = {
  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('hrm_attendance_records')
      .select(`
        *,
        employee:hrm_employees(id, first_name, last_name, employee_no)
      `)
      .eq('date', date)
      .order('employee(last_name)');

    if (error) throw error;
    return data || [];
  },

  async getByEmployee(employeeId: string, dateRange: { start: string; end: string }): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('hrm_attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(input: CreateAttendanceRecord): Promise<AttendanceRecord> {
    const { data, error } = await supabase
      .from('hrm_attendance_records')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: UpdateAttendanceRecord): Promise<AttendanceRecord> {
    const { data, error } = await supabase
      .from('hrm_attendance_records')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkCreate(records: CreateAttendanceRecord[]): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('hrm_attendance_records')
      .upsert(records, { onConflict: 'employee_id,date' })
      .select();

    if (error) throw error;
    
    await AuditService.log('attendance', null, 'BULK_UPDATE', { 
      count: records.length,
      date: records[0]?.date 
    });
    
    return data || [];
  },

  async getSummary(employeeId: string, month: Date): Promise<AttendanceSummary> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('hrm_attendance_records')
      .select('status')
      .eq('employee_id', employeeId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (error) throw error;

    const counts = {
      present: 0,
      absent: 0,
      sick: 0,
      late: 0,
      half_day: 0,
      remote: 0,
    };

    data?.forEach(record => {
      if (record.status in counts) {
        counts[record.status as keyof typeof counts]++;
      }
    });

    const total = data?.length || 0;
    const attendanceRate = total > 0 ? ((counts.present + counts.late + counts.remote) / total) * 100 : 0;

    return { ...counts, total, attendanceRate };
  },
};
```

---

### 3.5 DocumentService

**Purpose:** Manage employee documents via Supabase Storage.

```typescript
// src/services/DocumentService.ts

const BUCKET_NAME = 'hrm-documents';

export const DocumentService = {
  async getByEmployee(employeeId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('hrm_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async upload(
    employeeId: string,
    file: File,
    metadata: DocumentMetadata
  ): Promise<Document> {
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}/${Date.now()}_${metadata.document_type}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create database record
    const { data, error } = await supabase
      .from('hrm_documents')
      .insert({
        employee_id: employeeId,
        document_type: metadata.document_type,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        description: metadata.description,
        expiry_date: metadata.expiry_date,
      })
      .select()
      .single();

    if (error) throw error;
    
    await AuditService.log('document', data.id, 'UPLOAD', { 
      fileName: file.name,
      employeeId 
    });

    return data;
  },

  async delete(id: string): Promise<void> {
    // Get document record
    const { data: doc, error: fetchError } = await supabase
      .from('hrm_documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([doc.file_path]);

    if (storageError) throw storageError;

    // Delete database record
    const { error } = await supabase
      .from('hrm_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await AuditService.log('document', id, 'DELETE', { filePath: doc.file_path });
  },

  async getDownloadUrl(id: string): Promise<string> {
    const { data: doc, error: fetchError } = await supabase
      .from('hrm_documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

    return data?.signedUrl || '';
  },
};
```

---

### 3.6 AuditService

**Purpose:** Log all critical operations for compliance.

```typescript
// src/services/AuditService.ts

export const AuditService = {
  async log(
    entityType: string,
    entityId: string | null,
    action: string,
    payload?: Record<string, any>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('hrm_audit_logs').insert({
      actor_id: user?.id,
      entity_type: entityType,
      entity_id: entityId,
      action,
      payload,
    });
  },

  async getAll(filters?: AuditFilters): Promise<PaginatedResult<AuditLog>> {
    let query = supabase
      .from('hrm_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters?.actorId) query = query.eq('actor_id', filters.actorId);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0, page: 1, pageSize: 50, totalPages: 1 };
  },
};
```

---

## 4. Error Handling

### 4.1 Error Types

```typescript
// src/types/errors.ts

export class HRMError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'HRMError';
  }
}

export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Business logic errors
  LEAVE_OVERLAP: 'LEAVE_OVERLAP',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;
```

### 4.2 Error Response Format

```typescript
interface ErrorResponse {
  error: true;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Example error response
{
  "error": true,
  "code": "LEAVE_OVERLAP",
  "message": "Leave request overlaps with existing approved leave",
  "details": {
    "existingLeaveId": "uuid",
    "conflictDates": ["2025-01-15", "2025-01-16"]
  },
  "timestamp": "2025-01-09T12:00:00Z"
}
```

---

## 5. Validation Schemas

### 5.1 Employee Schemas

```typescript
// src/schemas/employee.ts
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employee_no: z.string().min(1, 'Employee number is required'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  middle_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.string().optional(),
  national_id: z.string().optional(),
  address: z.string().optional(),
  org_unit_id: z.string().uuid().optional(),
  position_id: z.string().uuid().optional(),
  employment_type: z.enum(['permanent', 'contract', 'temporary']),
  hire_date: z.string().min(1, 'Hire date is required'),
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
```

### 5.2 Leave Schemas

```typescript
// src/schemas/leave.ts
import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  leave_type_id: z.string().uuid('Invalid leave type'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  days_count: z.number().positive('Days count must be positive'),
  reason: z.string().optional(),
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be after start date',
  path: ['end_date'],
});
```

---

## 6. React Query Integration

### 6.1 Query Keys

```typescript
// src/hooks/queryKeys.ts

export const queryKeys = {
  employees: {
    all: ['employees'] as const,
    list: (filters: EmployeeFilters) => ['employees', 'list', filters] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    search: (query: string) => ['employees', 'search', query] as const,
  },
  leave: {
    types: ['leave', 'types'] as const,
    requests: (filters: LeaveFilters) => ['leave', 'requests', filters] as const,
    balance: (employeeId: string) => ['leave', 'balance', employeeId] as const,
  },
  attendance: {
    byDate: (date: string) => ['attendance', 'date', date] as const,
    byEmployee: (employeeId: string) => ['attendance', 'employee', employeeId] as const,
  },
  documents: {
    byEmployee: (employeeId: string) => ['documents', 'employee', employeeId] as const,
  },
  audit: {
    logs: (filters: AuditFilters) => ['audit', 'logs', filters] as const,
  },
};
```

### 6.2 Custom Hooks

```typescript
// src/hooks/useEmployees.ts

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(filters || {}),
    queryFn: () => EmployeeService.getAll(filters),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => EmployeeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: EmployeeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success('Employee created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create employee');
    },
  });
}
```

---

## 7. Future REST API Specification

### 7.1 Base URL

```
Production:  https://api.hrm.sozavo.org/v1
Staging:     https://api-staging.hrm.sozavo.org/v1
```

### 7.2 Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /employees | List employees |
| POST | /employees | Create employee |
| GET | /employees/:id | Get employee |
| PUT | /employees/:id | Update employee |
| DELETE | /employees/:id | Delete employee |
| GET | /org-units | List organization units |
| GET | /positions | List positions |
| GET | /leave-types | List leave types |
| GET | /leave-requests | List leave requests |
| POST | /leave-requests | Create leave request |
| PATCH | /leave-requests/:id/approve | Approve leave |
| PATCH | /leave-requests/:id/reject | Reject leave |
| GET | /attendance | Get attendance records |
| POST | /attendance/bulk | Bulk update attendance |
| GET | /audit-logs | List audit logs |

### 7.3 Authentication

```
Authorization: Bearer <jwt_token>
```

### 7.4 Rate Limiting

| Endpoint Type | Limit |
|--------------|-------|
| Read endpoints | 100 req/min |
| Write endpoints | 30 req/min |
| Bulk operations | 10 req/min |

---

## 8. Edge Functions (Future)

### 8.1 Planned Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-leave-notification` | Leave approval | Email notifications |
| `calculate-leave-balance` | Monthly cron | Recalculate balances |
| `generate-monthly-report` | Monthly cron | PDF report generation |
| `sync-payroll` | On demand | Payroll system sync |

### 8.2 Edge Function Template

```typescript
// supabase/functions/send-leave-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leaveRequestId, action } = await req.json();
    
    // Implementation here
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

**End of API Specification**
