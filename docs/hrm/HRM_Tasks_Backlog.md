# SoZaVo HRM System — Tasks Backlog

> **Version:** 1.1  
> **Last Updated:** 2025-12-10  
> **Status:** Active Planning Document

---

## Overview

This document is the **single source of truth** for planning, tracking, and prioritizing all implementation tasks for the SoZaVo HRM System. It covers Phases 0–8 as defined in `HRM_System_Implementation_Roadmap_v2.md`.

All development work should reference this backlog. Tasks are designed to be small, actionable, and implementation-ready.

---

## Status Legend

| Symbol | Status | Description |
|--------|--------|-------------|
| ✅ | Completed | Task finished and verified |
| 🔄 | In Progress | Currently being worked on |
| ⏳ | Planned | Scheduled for implementation |
| 🚫 | Blocked | Cannot proceed (dependency issue) |

---

## Priority Legend

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | Critical | Must complete before any other work |
| P1 | High | Essential for phase completion |
| P2 | Medium | Important but not blocking |
| P3 | Low | Nice-to-have, can defer |

---

## Task ID Format

```
P{phase}-{category}-{number}
```

**Categories:**
- `ENV` — Environment & Setup
- `DB` — Database Schema
- `RLS` — Row-Level Security
- `AUTH` — Authentication
- `SVC` — Service Layer
- `UI` — User Interface
- `RBAC` — Role-Based Access Control
- `LEAVE` — Leave Management
- `ATT` — Attendance
- `DOC` — Documents & Storage
- `DASH` — Dashboard & Reporting
- `SET` — Settings
- `AUDIT` — Audit Logs
- `QA` — Quality Assurance
- `DEPLOY` — Deployment

---

## Phase 0 — Environment & Template Setup

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P0-ENV-001 | ENV | Initialize Repository | Create project repository with Vite + React + TypeScript | ✅ | P0 |
| P0-ENV-002 | ENV | Install Darkone Template | Copy Darkone-React_v1.0 as read-only reference | ✅ | P0 |
| P0-ENV-003 | ENV | Configure Dependencies | Install all required npm packages | ✅ | P0 |
| P0-ENV-004 | ENV | Setup SCSS Pipeline | Configure Sass compilation with Darkone styles | ✅ | P0 |
| P0-ENV-005 | ENV | Create Documentation Structure | Setup /docs/hrm/ folder with initial docs | ✅ | P0 |
| P0-ENV-006 | ENV | Create Theme Guardrails | Document Darkone preservation rules | ✅ | P0 |
| P0-ENV-007 | ENV | Create Component Registry | Document reusable Darkone components | ✅ | P0 |

**Phase 0 Summary:** 7/7 tasks completed ✅

---

## Phase 1 — Database & Authentication Foundation

### Database Schema Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P1-DB-001 | DB | Enable Lovable Cloud | Activate Supabase backend integration | ✅ | P0 |
| P1-DB-002 | DB | Create app_role Enum | Define roles: admin, hr_manager, manager, employee | ✅ | P0 |
| P1-DB-003 | DB | Create employment_status Enum | Define: active, inactive, on_leave, terminated | ✅ | P1 |
| P1-DB-004 | DB | Create leave_status Enum | Define: pending, approved, rejected, cancelled | ✅ | P1 |
| P1-DB-005 | DB | Create attendance_status Enum | Define: present, absent, late, half_day, on_leave | ✅ | P1 |
| P1-DB-006 | DB | Create document_type Enum | Define: contract, id_document, certificate, other | ✅ | P2 |
| P1-DB-007 | DB | Create user_roles Table | RBAC table with user_id + role (CRITICAL for security) | ✅ | P0 |
| P1-DB-008 | DB | Create hrm_organization_units Table | Org hierarchy with parent_id self-reference | ✅ | P1 |
| P1-DB-009 | DB | Create hrm_positions Table | Job positions with org_unit_id FK | ✅ | P1 |
| P1-DB-010 | DB | Create hrm_employees Table | Core employee data with position_id, user_id FKs | ✅ | P1 |
| P1-DB-011 | DB | Create hrm_leave_types Table | Leave type definitions (annual, sick, etc.) | ✅ | P2 |
| P1-DB-012 | DB | Create hrm_leave_requests Table | Employee leave requests with approval workflow | ✅ | P2 |
| P1-DB-013 | DB | Create hrm_attendance_records Table | Daily attendance tracking | ✅ | P2 |
| P1-DB-014 | DB | Create hrm_documents Table | Document metadata with storage references | ✅ | P2 |
| P1-DB-015 | DB | Create hrm_audit_logs Table | System-wide audit trail | ✅ | P2 |
| P1-DB-016 | DB | Create Database Indexes | Add indexes for common query patterns | ✅ | P2 |

### RLS & Security Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P1-RLS-001 | RLS | Create has_role() Function | Security definer function to check user roles | ✅ | P0 |
| P1-RLS-002 | RLS | Create get_user_org_unit() Function | Get user's organization unit for team-based access | ✅ | P1 |
| P1-RLS-003 | RLS | Enable RLS on All Tables | ALTER TABLE ... ENABLE ROW LEVEL SECURITY | ✅ | P0 |
| P1-RLS-004 | RLS | Create user_roles RLS Policies | Only admins can manage roles | ✅ | P0 |
| P1-RLS-005 | RLS | Create hrm_employees RLS Policies | Role + ownership based access | ✅ | P1 |
| P1-RLS-006 | RLS | Create hrm_organization_units RLS Policies | Admin/HR manager access | ✅ | P1 |
| P1-RLS-007 | RLS | Create hrm_positions RLS Policies | Admin/HR manager access | ✅ | P1 |
| P1-RLS-008 | RLS | Create hrm_leave_requests RLS Policies | Owner + manager + HR access | ✅ | P1 |
| P1-RLS-009 | RLS | Create hrm_attendance_records RLS Policies | Owner + manager + HR access | ✅ | P1 |
| P1-RLS-010 | RLS | Create hrm_documents RLS Policies | Owner + HR access | ✅ | P1 |
| P1-RLS-011 | RLS | Create hrm_audit_logs RLS Policies | Admin read-only access | ✅ | P2 |

### Authentication Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P1-AUTH-001 | AUTH | Configure Supabase Auth | Enable email/password authentication | ✅ | P0 |
| P1-AUTH-002 | AUTH | Create AuthContext | React context with user + role state | ✅ | P0 |
| P1-AUTH-003 | AUTH | Integrate SignIn Page | Connect existing Darkone sign-in to Supabase | ✅ | P1 |
| P1-AUTH-004 | AUTH | Integrate SignUp Page | Connect existing Darkone sign-up to Supabase | ✅ | P1 |
| P1-AUTH-005 | AUTH | Implement Logout | Add logout functionality to user menu | ✅ | P1 |
| P1-AUTH-006 | AUTH | Create ProtectedRoute Component | Route guard checking auth + roles | ✅ | P1 |
| P1-AUTH-007 | AUTH | Handle Auth State Persistence | Maintain session across page reloads | ✅ | P1 |
| P1-AUTH-008 | AUTH | Seed Default Admin User | Create initial admin for testing | ✅ | P2 |

**Phase 1 Summary:** 35/35 tasks completed ✅

---

## Phase 2 — Core HR Module

### Service Layer Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P2-SVC-001 | SVC | Create Services Directory | Setup /src/services/ structure | ✅ | P1 |
| P2-SVC-002 | SVC | Create Base Service Interface | Define common CRUD patterns | ⏳ | P1 |
| P2-SVC-003 | SVC | Create OrganizationUnitService | CRUD for organization units | ⏳ | P1 |
| P2-SVC-004 | SVC | Create PositionService | CRUD for positions | ⏳ | P1 |
| P2-SVC-005 | SVC | Create EmployeeService | CRUD for employees | ✅ | P1 |
| P2-SVC-006 | SVC | Create Types Directory | Setup /src/types/hrm/ structure | ✅ | P1 |
| P2-SVC-007 | SVC | Define Employee Types | HrmEmployeeRow, HrmEmployeeDirectory, HrmEmployeeDetail | ✅ | P1 |
| P2-SVC-008 | SVC | Define Organization Types | OrganizationUnit, Position types | ⏳ | P1 |
| P2-SVC-009 | SVC | Create Validation Schemas | Zod schemas for all HRM entities | ⏳ | P1 |
| P2-SVC-010 | SVC | Create Error Handling Utilities | ServiceError class, error mappers | ⏳ | P2 |

### UI Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P2-UI-001 | UI | Add HRM Section to Sidebar | New menu group for HRM modules | ✅ | P1 |
| P2-UI-002 | UI | Create Organization Units List Page | Table view with actions | ⏳ | P1 |
| P2-UI-003 | UI | Create Organization Unit Form Modal | Create/Edit modal using Darkone patterns | ⏳ | P1 |
| P2-UI-004 | UI | Create Positions List Page | Table view with filtering | ⏳ | P1 |
| P2-UI-005 | UI | Create Position Form Modal | Create/Edit modal | ⏳ | P1 |
| P2-UI-006 | UI | Create Employees List Page | Table with search, filter, sorting, avatars | ✅ | P1 |
| P2-UI-007 | UI | Create Employee Detail Page | View employee profile (read-only) | ✅ | P1 |
| P2-UI-008 | UI | Create Employee Form Page | Multi-step employee creation/edit | ⏳ | P1 |
| P2-UI-009 | UI | Create Employee Card Component | Reusable employee display card | ⏳ | P2 |
| P2-UI-010 | UI | Create Organization Tree Component | Visual org hierarchy | ⏳ | P2 |
| P2-UI-011 | UI | Implement HRM Data Hooks (custom pattern) | useHrmEmployees, useHrmEmployeeDetail (no React Query) | ✅ | P1 |
| P2-UI-012 | UI | Add Loading States | Skeleton loaders for all HRM pages | ⏳ | P2 |
| P2-UI-013 | UI | Add Empty States | Empty state UI for no-data scenarios | ⏳ | P2 |
| P2-UI-014 | UI | Add Error States | Error boundaries and error UI | ⏳ | P2 |
| P2-UI-015 | UI | Add Toast Notifications | Success/error feedback for actions | ⏳ | P2 |

**Phase 2 Summary:** 8/25 tasks completed (Steps 1–4 verified), 17 planned

---

## Phase 3 — RBAC & User Management

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P3-RBAC-001 | RBAC | Enhance AuthContext with Roles | Add role checking utilities | ⏳ | P1 |
| P3-RBAC-002 | RBAC | Create usePermissions Hook | Check user permissions in components | ⏳ | P1 |
| P3-RBAC-003 | RBAC | Create RoleGuard Component | Conditional rendering by role | ⏳ | P1 |
| P3-RBAC-004 | RBAC | Define Permission Matrix | Document all role-permission mappings | ⏳ | P1 |
| P3-RBAC-005 | RBAC | Create UserService | CRUD for user management | ⏳ | P1 |
| P3-RBAC-006 | RBAC | Create RoleService | Role assignment operations | ⏳ | P1 |
| P3-UI-001 | UI | Create Users List Page | Admin user management | ⏳ | P1 |
| P3-UI-002 | UI | Create User Form Modal | Create/edit users | ⏳ | P1 |
| P3-UI-003 | UI | Create Role Assignment Modal | Assign roles to users | ⏳ | P1 |
| P3-UI-004 | UI | Create User Profile Page | Current user profile view/edit | ⏳ | P2 |
| P3-UI-005 | UI | Add Role Badges to User Lists | Visual role indicators | ⏳ | P2 |
| P3-UI-006 | UI | Implement Conditional Menu Items | Show/hide menu based on roles | ⏳ | P1 |
| P3-UI-007 | UI | Add Bulk Role Assignment | Multi-select role operations | ⏳ | P3 |
| P3-UI-008 | UI | Create Role Summary Dashboard | Overview of role distribution | ⏳ | P3 |

**Phase 3 Summary:** 0/14 tasks completed, 14 planned

---

## Phase 4 — Leave & Attendance Management

### Leave Management Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P4-LEAVE-001 | LEAVE | Create LeaveTypeService | CRUD for leave types | ⏳ | P1 |
| P4-LEAVE-002 | LEAVE | Create LeaveRequestService | Leave request operations | ⏳ | P1 |
| P4-LEAVE-003 | LEAVE | Define Leave Types | Leave type definitions | ⏳ | P1 |
| P4-LEAVE-004 | LEAVE | Create Leave Balance Calculator | Track remaining leave days | ⏳ | P1 |
| P4-UI-001 | UI | Create Leave Types Admin Page | Manage leave type definitions | ⏳ | P1 |
| P4-UI-002 | UI | Create Leave Request Form | Employee leave application | ⏳ | P1 |
| P4-UI-003 | UI | Create My Leave Requests Page | Employee's own requests | ⏳ | P1 |
| P4-UI-004 | UI | Create Leave Approval Queue | Manager/HR approval interface | ⏳ | P1 |
| P4-UI-005 | UI | Create Leave Calendar View | Visual leave schedule | ⏳ | P2 |
| P4-UI-006 | UI | Create Leave Balance Widget | Display remaining leave | ⏳ | P2 |
| P4-UI-007 | UI | Add Leave Request Notifications | Email/in-app notifications | ⏳ | P3 |

### Attendance Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P4-ATT-001 | ATT | Create AttendanceService | Attendance record operations | ⏳ | P1 |
| P4-ATT-002 | ATT | Create Check-in/Check-out Logic | Daily attendance marking | ⏳ | P1 |
| P4-UI-008 | UI | Create Daily Attendance Page | Mark today's attendance | ⏳ | P1 |
| P4-UI-009 | UI | Create Attendance History Page | View past attendance | ⏳ | P1 |
| P4-UI-010 | UI | Create Team Attendance View | Manager's team overview | ⏳ | P1 |
| P4-UI-011 | UI | Create Attendance Report Page | Monthly/weekly reports | ⏳ | P2 |
| P4-UI-012 | UI | Create Attendance Summary Widget | Dashboard widget | ⏳ | P2 |

**Phase 4 Summary:** 0/18 tasks completed, 18 planned

---

## Phase 5 — Documents & Storage

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P5-DOC-001 | DOC | Create Storage Bucket | Setup Supabase storage for documents | ⏳ | P1 |
| P5-DOC-002 | DOC | Configure Storage RLS | Secure file access policies | ⏳ | P1 |
| P5-DOC-003 | DOC | Create DocumentService | File upload/download operations | ⏳ | P1 |
| P5-DOC-004 | DOC | Define Document Types | Document classification | ⏳ | P1 |
| P5-UI-001 | UI | Create Document Upload Component | Drag-and-drop file upload | ⏳ | P1 |
| P5-UI-002 | UI | Create Employee Documents Tab | Documents on employee profile | ⏳ | P1 |
| P5-UI-003 | UI | Create Document List View | Table view of documents | ⏳ | P1 |
| P5-UI-004 | UI | Create Document Preview Modal | View documents in-app | ⏳ | P2 |
| P5-UI-005 | UI | Add Document Download | Secure file download | ⏳ | P1 |
| P5-UI-006 | UI | Add Document Delete | Remove documents with confirmation | ⏳ | P1 |
| P5-UI-007 | UI | Create Document Search | Search by name, type, employee | ⏳ | P2 |
| P5-UI-008 | UI | Add File Type Validation | Restrict allowed file types | ⏳ | P2 |

**Phase 5 Summary:** 0/12 tasks completed, 12 planned

---

## Phase 6 — Dashboard & Reporting

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P6-DASH-001 | DASH | Create DashboardService | KPI data aggregation | ⏳ | P1 |
| P6-DASH-002 | DASH | Define Dashboard Metrics | Key HRM metrics | ⏳ | P1 |
| P6-UI-001 | UI | Create HRM Dashboard Page | Main HRM overview | ⏳ | P1 |
| P6-UI-002 | UI | Create Employee Count Widget | Total employees, by status | ⏳ | P1 |
| P6-UI-003 | UI | Create Department Distribution Chart | Pie/donut chart | ⏳ | P1 |
| P6-UI-004 | UI | Create Leave Overview Widget | Pending requests, on leave today | ⏳ | P1 |
| P6-UI-005 | UI | Create Attendance Summary Widget | Today's attendance stats | ⏳ | P1 |
| P6-UI-006 | UI | Create Recent Activity Feed | Latest HRM actions | ⏳ | P2 |
| P6-UI-007 | UI | Create Employee Trend Chart | Headcount over time | ⏳ | P2 |
| P6-UI-008 | UI | Create Report Generation Page | Export reports | ⏳ | P2 |
| P6-UI-009 | UI | Create Employee Report | Export employee data | ⏳ | P2 |
| P6-UI-010 | UI | Create Attendance Report | Export attendance data | ⏳ | P2 |
| P6-UI-011 | UI | Create Leave Report | Export leave data | ⏳ | P2 |
| P6-UI-012 | UI | Add PDF Export | Generate PDF reports | ⏳ | P3 |
| P6-UI-013 | UI | Add Excel Export | Generate Excel reports | ⏳ | P3 |

**Phase 6 Summary:** 0/15 tasks completed, 15 planned

---

## Phase 7 — Settings & Audit Logs

### Settings Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P7-SET-001 | SET | Create SettingsService | System settings operations | ⏳ | P1 |
| P7-SET-002 | SET | Define Settings Schema | Configurable system options | ⏳ | P1 |
| P7-UI-001 | UI | Create Settings Page | System configuration UI | ⏳ | P1 |
| P7-UI-002 | UI | Create Company Profile Settings | Organization details | ⏳ | P1 |
| P7-UI-003 | UI | Create Leave Policy Settings | Leave configuration | ⏳ | P2 |
| P7-UI-004 | UI | Create Attendance Settings | Working hours, overtime | ⏳ | P2 |
| P7-UI-005 | UI | Create Notification Settings | Email/alert preferences | ⏳ | P3 |

### Audit Log Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P7-AUDIT-001 | AUDIT | Create AuditLogService | Audit log operations | ⏳ | P1 |
| P7-AUDIT-002 | AUDIT | Implement Audit Triggers | Database triggers for logging | ⏳ | P1 |
| P7-AUDIT-003 | AUDIT | Define Auditable Actions | What actions to log | ⏳ | P1 |
| P7-UI-006 | UI | Create Audit Log Viewer | View system audit trail | ⏳ | P1 |
| P7-UI-007 | UI | Add Audit Log Filtering | Filter by date, user, action | ⏳ | P2 |
| P7-UI-008 | UI | Add Audit Log Export | Export audit data | ⏳ | P3 |

**Phase 7 Summary:** 0/13 tasks completed, 13 planned

---

## Phase 8 — QA, Hardening & Deployment

### QA Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P8-QA-001 | QA | Create Manual Test Checklist | Comprehensive test cases | ⏳ | P1 |
| P8-QA-002 | QA | Test All CRUD Operations | Verify data operations | ⏳ | P1 |
| P8-QA-003 | QA | Test RLS Policies | Verify access control | ⏳ | P0 |
| P8-QA-004 | QA | Test Authentication Flows | Login, logout, session | ⏳ | P1 |
| P8-QA-005 | QA | Test Role-Based Access | Verify role restrictions | ⏳ | P1 |
| P8-QA-006 | QA | Cross-Browser Testing | Chrome, Firefox, Safari, Edge | ⏳ | P2 |
| P8-QA-007 | QA | Mobile Responsiveness Testing | Test on various devices | ⏳ | P2 |
| P8-QA-008 | QA | Performance Testing | Load times, query optimization | ⏳ | P2 |

### Deployment Tasks

| ID | Category | Title | Description | Status | Priority |
|----|----------|-------|-------------|--------|----------|
| P8-DEPLOY-001 | DEPLOY | Create Production Checklist | Pre-deployment verification | ⏳ | P1 |
| P8-DEPLOY-002 | DEPLOY | Configure Production Environment | Environment variables | ⏳ | P1 |
| P8-DEPLOY-003 | DEPLOY | Setup Custom Domain | Connect production domain | ⏳ | P2 |
| P8-DEPLOY-004 | DEPLOY | Configure Backup Strategy | Database backup plan | ⏳ | P1 |
| P8-DEPLOY-005 | DEPLOY | Create User Documentation | End-user guides | ⏳ | P2 |
| P8-DEPLOY-006 | DEPLOY | Create Admin Documentation | System admin guides | ⏳ | P2 |
| P8-DEPLOY-007 | DEPLOY | Setup Monitoring | Error tracking, analytics | ⏳ | P2 |
| P8-DEPLOY-008 | DEPLOY | Production Launch | Go-live deployment | ⏳ | P0 |

**Phase 8 Summary:** 0/16 tasks completed, 16 planned

---

## Overall Summary

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| 0 | ✅ Complete | 7 | 7 |
| 1 | ✅ Complete | 35 | 35 |
| 2 | 🔄 In Progress | 25 | 8 |
| 3 | ⏳ Planned | 14 | 0 |
| 4 | ⏳ Planned | 18 | 0 |
| 5 | ⏳ Planned | 12 | 0 |
| 6 | ⏳ Planned | 15 | 0 |
| 7 | ⏳ Planned | 13 | 0 |
| 8 | ⏳ Planned | 16 | 0 |
| **Total** | | **155** | **50** |

---

## Next Actions

### Phase 2 — Remaining Steps (5+)
1. Create Organization Units UI (P2-UI-002, P2-UI-003)
2. Create Positions UI (P2-UI-004, P2-UI-005)
3. Create Employee Edit Form (P2-UI-008)
4. Add remaining service definitions (P2-SVC-002, P2-SVC-003, P2-SVC-004)
