# SoZaVo HRM System — Implementation Roadmap v2.0

**Version:** 2.0  
**Last Updated:** 2025-01-09  
**Status:** Aligned with Darkone React Template Integration

---

## 1. Executive Summary

This roadmap provides the step-by-step execution plan for building the SoZaVo HRM System. It is fully aligned with the completed Darkone React template integration and optimized for Lovable's AI-assisted development workflow.

### Key Milestones

| Phase | Name | Duration | Status |
|-------|------|----------|--------|
| 0 | Environment & Template Setup | 1-2 days | ✅ COMPLETE |
| 1 | Database & Authentication | 3-5 days | 🔄 NEXT |
| 2 | Core HR Module | 5-7 days | ⏳ Planned |
| 3 | RBAC & User Management | 3-4 days | ⏳ Planned |
| 4 | Leave & Attendance | 4-6 days | ⏳ Planned |
| 5 | Documents & Storage | 3-4 days | ⏳ Planned |
| 6 | Dashboard & Reporting | 2-3 days | ⏳ Planned |
| 7 | Settings & Audit Logs | 2-3 days | ⏳ Planned |
| 8 | QA, Hardening & Deployment | 3-5 days | ⏳ Planned |

**Total Estimated Duration:** 26-39 days

---

## 2. Phase 0 — Environment & Template Setup ✅ COMPLETE

### 2.1 Deliverables Achieved

| Task | Status | Notes |
|------|--------|-------|
| GitHub repository created | ✅ | Connected to Lovable |
| Darkone React template integrated | ✅ | Full 1:1 conversion |
| SCSS styling system active | ✅ | style.scss loaded |
| React Router configured | ✅ | All template routes working |
| Layouts functional | ✅ | AdminLayout, AuthLayout |
| Authentication pages present | ✅ | /auth/sign-in, /auth/sign-up |
| Dashboard rendering | ✅ | /dashboards working |

### 2.2 Current Repository Structure

```
src/
├── app/                    ✅ Route-based pages
│   ├── (admin)/            ✅ Admin layout routes
│   │   └── dashboards/     ✅ Dashboard pages
│   └── (other)/            ✅ Auth & public routes
├── assets/                 ✅ Static assets & SCSS
├── components/             ✅ Reusable UI components
├── context/                ✅ React contexts
├── helpers/                ✅ Utility functions
├── hooks/                  ✅ Custom React hooks
├── layouts/                ✅ Page layouts
├── routes/                 ✅ Route configuration
├── types/                  ✅ TypeScript definitions
└── utils/                  ✅ Utility functions
```

### 2.3 No Modifications to Darkone Template

**Rule:** The Darkone template code remains untouched. All HRM features are additive only.

---

## 3. Phase 1 — Database & Authentication Foundation

### 3.1 Overview

Establish the Supabase Cloud backend with authentication and core database schema.

### 3.2 Tasks

#### 3.2.1 Enable Lovable Cloud

| Task | Priority | Duration |
|------|----------|----------|
| Enable Lovable Cloud (Supabase) | P0 | 5 min |
| Verify Supabase project connection | P0 | 5 min |
| Review auto-generated client | P0 | 10 min |

#### 3.2.2 Create Database Schema

| Task | Priority | Duration |
|------|----------|----------|
| Create `app_role` enum | P0 | 10 min |
| Create `employee_status` enum | P0 | 10 min |
| Create `leave_status` enum | P0 | 10 min |
| Create `attendance_status` enum | P0 | 10 min |
| Create `hrm_organization_units` table | P0 | 15 min |
| Create `hrm_positions` table | P0 | 15 min |
| Create `hrm_employees` table | P0 | 20 min |
| Create `user_roles` table (CRITICAL) | P0 | 15 min |
| Create `hrm_leave_types` table | P1 | 15 min |
| Create `hrm_leave_requests` table | P1 | 15 min |
| Create `hrm_attendance_records` table | P1 | 15 min |
| Create `hrm_documents` table | P1 | 15 min |
| Create `hrm_audit_logs` table | P1 | 15 min |
| Create `hrm_settings` table | P2 | 10 min |
| Add indexes | P1 | 20 min |

#### 3.2.3 Security Functions

| Task | Priority | Duration |
|------|----------|----------|
| Create `has_role()` security definer | P0 | 15 min |
| Create `get_user_role()` function | P0 | 10 min |
| Create `is_admin()` function | P0 | 10 min |

#### 3.2.4 RLS Policies

| Task | Priority | Duration |
|------|----------|----------|
| Enable RLS on all tables | P0 | 10 min |
| Create `hrm_employees` policies | P0 | 30 min |
| Create `user_roles` policies | P0 | 20 min |
| Create `hrm_leave_requests` policies | P1 | 20 min |
| Create `hrm_documents` policies | P1 | 15 min |
| Create `hrm_audit_logs` policies | P2 | 10 min |

#### 3.2.5 Authentication Integration

| Task | Priority | Duration |
|------|----------|----------|
| Update existing auth pages to use Supabase | P0 | 1 hour |
| Implement `onAuthStateChange` listener | P0 | 30 min |
| Create `AuthContext` with role lookup | P0 | 45 min |
| Implement `emailRedirectTo` for sign-up | P0 | 15 min |
| Add error handling for auth flows | P0 | 30 min |
| Test login/logout flow | P0 | 20 min |

#### 3.2.6 Seed Data

| Task | Priority | Duration |
|------|----------|----------|
| Seed default leave types | P1 | 10 min |
| Seed default settings | P1 | 10 min |
| Seed test organization units | P2 | 15 min |
| Seed test employees | P2 | 15 min |
| Create first system admin user | P0 | 10 min |

### 3.3 Acceptance Criteria

- [ ] Supabase Cloud is enabled and connected
- [ ] All database tables exist with correct schema
- [ ] RLS policies are active and tested
- [ ] `user_roles` table is separate from any profile table
- [ ] `has_role()` function works correctly
- [ ] Authentication flow works (sign-in, sign-up, sign-out)
- [ ] User role is retrieved after login
- [ ] Seed data is populated

### 3.4 Dependencies

- Lovable Cloud activation
- Supabase project URL and anon key

---

## 4. Phase 2 — Core HR Module

### 4.1 Overview

Build the foundational employee management, organization structure, and positions modules.

### 4.2 Tasks

#### 4.2.1 Service Layer

| Task | Priority | Duration |
|------|----------|----------|
| Create `src/services/` directory | P0 | 5 min |
| Implement `OrgUnitService.ts` | P0 | 30 min |
| Implement `PositionService.ts` | P0 | 30 min |
| Implement `EmployeeService.ts` | P0 | 45 min |

#### 4.2.2 TypeScript Types

| Task | Priority | Duration |
|------|----------|----------|
| Create `src/types/hrm/` directory | P0 | 5 min |
| Define `Employee` type | P0 | 15 min |
| Define `OrgUnit` type | P0 | 10 min |
| Define `Position` type | P0 | 10 min |
| Define service input/output types | P0 | 20 min |

#### 4.2.3 Organization Units UI

| Task | Priority | Duration |
|------|----------|----------|
| Create `/hrm/organization/units` page | P0 | 1 hour |
| Build org unit tree component | P1 | 1.5 hours |
| Create org unit form modal | P0 | 45 min |
| Implement CRUD operations | P0 | 1 hour |

#### 4.2.4 Positions UI

| Task | Priority | Duration |
|------|----------|----------|
| Create `/hrm/organization/positions` page | P0 | 45 min |
| Build positions data table | P0 | 30 min |
| Create position form modal | P0 | 30 min |
| Implement CRUD operations | P0 | 45 min |

#### 4.2.5 Employee Management UI

| Task | Priority | Duration |
|------|----------|----------|
| Create `/hrm/employees` list page | P0 | 1.5 hours |
| Build employee data table with filters | P0 | 1 hour |
| Create `/hrm/employees/:id` detail page | P0 | 1.5 hours |
| Build profile tab content | P0 | 1 hour |
| Create employee form (create/edit) | P0 | 1.5 hours |
| Implement Zod validation schemas | P0 | 30 min |
| Add search functionality | P1 | 30 min |
| Add CSV export | P2 | 30 min |

#### 4.2.6 Navigation Integration

| Task | Priority | Duration |
|------|----------|----------|
| Add HRM menu section to sidebar | P0 | 30 min |
| Configure route guards | P0 | 30 min |

### 4.3 Acceptance Criteria

- [ ] Organization units can be created, viewed, edited, deleted
- [ ] Hierarchy view shows parent-child relationships
- [ ] Positions can be managed with categories
- [ ] Employee list shows with pagination and filters
- [ ] Employee detail page displays all profile information
- [ ] Employee create/edit forms validate input
- [ ] Navigation shows HRM menu items
- [ ] All pages use Darkone components

### 4.4 Dependencies

- Phase 1 complete (database schema, auth)

---

## 5. Phase 3 — RBAC & User Management

### 5.1 Overview

Implement the full role-based access control system with user management UI.

### 5.2 Tasks

#### 5.2.1 Auth Context Enhancement

| Task | Priority | Duration |
|------|----------|----------|
| Add role to AuthContext state | P0 | 20 min |
| Implement role lookup on login | P0 | 30 min |
| Create `usePermission` hook | P0 | 30 min |

#### 5.2.2 Route Guards

| Task | Priority | Duration |
|------|----------|----------|
| Create `RouteGuard` component | P0 | 30 min |
| Apply guards to all HRM routes | P0 | 30 min |
| Create `/unauthorized` page | P0 | 20 min |

#### 5.2.3 User Management Service

| Task | Priority | Duration |
|------|----------|----------|
| Implement `UserService.ts` | P0 | 45 min |
| Add role assignment functions | P0 | 30 min |

#### 5.2.4 User Management UI

| Task | Priority | Duration |
|------|----------|----------|
| Create `/users` list page | P0 | 1 hour |
| Build user data table | P0 | 30 min |
| Create user invite form | P0 | 45 min |
| Create role change modal | P0 | 30 min |
| Implement user activation toggle | P0 | 20 min |
| Link user to employee | P1 | 30 min |

#### 5.2.5 Permission-Based UI

| Task | Priority | Duration |
|------|----------|----------|
| Hide/show menu items by role | P0 | 30 min |
| Disable buttons based on permissions | P0 | 30 min |

### 5.3 Acceptance Criteria

- [ ] Users are stored with roles in separate `user_roles` table
- [ ] Route guards prevent unauthorized access
- [ ] User list shows all users with roles
- [ ] Roles can be changed by system admin
- [ ] Users can be deactivated
- [ ] Menu items are filtered by role
- [ ] Buttons are disabled based on permissions

### 5.4 Dependencies

- Phase 2 complete (employees exist to link)

---

## 6. Phase 4 — Leave & Attendance Management

### 6.1 Overview

Implement leave request workflows and daily attendance tracking.

### 6.2 Tasks

#### 6.2.1 Leave Types Management

| Task | Priority | Duration |
|------|----------|----------|
| Implement `LeaveService.ts` | P0 | 45 min |
| Create `/hrm/leave/types` page | P0 | 1 hour |
| Build leave type form | P0 | 30 min |

#### 6.2.2 Leave Requests

| Task | Priority | Duration |
|------|----------|----------|
| Create `/hrm/leave/requests` page | P0 | 1.5 hours |
| Build leave request form | P0 | 1 hour |
| Implement date validation (no overlap) | P0 | 45 min |
| Create approval workflow UI | P0 | 1 hour |
| Build leave balance display | P1 | 30 min |
| Add employee leave tab | P0 | 45 min |

#### 6.2.3 Attendance Tracking

| Task | Priority | Duration |
|------|----------|----------|
| Implement `AttendanceService.ts` | P0 | 45 min |
| Create `/hrm/attendance/daily` page | P0 | 1.5 hours |
| Build attendance grid/table | P0 | 1 hour |
| Implement bulk status update | P0 | 45 min |
| Create employee attendance tab | P0 | 45 min |
| Build attendance summary | P1 | 30 min |

### 6.3 Acceptance Criteria

- [ ] Leave types can be configured
- [ ] Employees can submit leave requests
- [ ] Managers can approve/reject requests
- [ ] Overlapping leaves are prevented
- [ ] Leave balance is displayed
- [ ] Daily attendance can be recorded
- [ ] Bulk status updates work
- [ ] Attendance history is viewable

### 6.4 Dependencies

- Phase 3 complete (RBAC for approvals)

---

## 7. Phase 5 — Documents & Storage

### 7.1 Overview

Implement file upload and document management using Supabase Storage.

### 7.2 Tasks

#### 7.2.1 Storage Setup

| Task | Priority | Duration |
|------|----------|----------|
| Create `hrm-documents` storage bucket | P0 | 15 min |
| Configure bucket RLS policies | P0 | 30 min |

#### 7.2.2 Document Service

| Task | Priority | Duration |
|------|----------|----------|
| Implement `DocumentService.ts` | P0 | 45 min |
| Add upload function | P0 | 30 min |
| Add download URL function | P0 | 20 min |

#### 7.2.3 Document UI

| Task | Priority | Duration |
|------|----------|----------|
| Create document dropzone component | P0 | 45 min |
| Build document list component | P0 | 30 min |
| Add employee documents tab | P0 | 45 min |
| Implement file preview (PDF, images) | P1 | 1 hour |
| Add document delete confirmation | P0 | 20 min |

### 7.3 Acceptance Criteria

- [ ] Storage bucket is created with correct RLS
- [ ] Files can be uploaded to employee profiles
- [ ] Document metadata is stored in database
- [ ] Files can be downloaded
- [ ] PDF/image preview works
- [ ] Documents can be deleted

### 7.4 Dependencies

- Phase 2 complete (employee records exist)

---

## 8. Phase 6 — Dashboard & Reporting

### 8.1 Overview

Build KPI dashboards and reporting functionality.

### 8.2 Tasks

#### 8.2.1 HRM Dashboard

| Task | Priority | Duration |
|------|----------|----------|
| Create HRM-specific dashboard page | P0 | 30 min |
| Build KPI stat cards | P0 | 1 hour |
| Implement employee count widget | P0 | 20 min |
| Implement pending leave widget | P0 | 20 min |
| Implement attendance rate widget | P0 | 30 min |

#### 8.2.2 Charts

| Task | Priority | Duration |
|------|----------|----------|
| Create employees by org unit chart | P1 | 30 min |
| Create attendance trend chart | P1 | 30 min |
| Create leave utilization chart | P2 | 30 min |

#### 8.2.3 Reports

| Task | Priority | Duration |
|------|----------|----------|
| Create `/hrm/reports` page | P0 | 30 min |
| Implement employee export (CSV) | P0 | 30 min |
| Implement attendance export (CSV) | P1 | 30 min |
| Implement leave export (CSV) | P1 | 30 min |
| Add Excel export option | P2 | 45 min |

### 8.3 Acceptance Criteria

- [ ] Dashboard shows accurate KPIs
- [ ] Charts display real data
- [ ] Reports page lists available exports
- [ ] CSV export downloads correctly
- [ ] Excel export works (if implemented)

### 8.4 Dependencies

- Phases 2-5 complete (data exists)

---

## 9. Phase 7 — Settings & Audit Logs

### 9.1 Overview

Implement system settings and audit log viewer.

### 9.2 Tasks

#### 9.2.1 Settings Module

| Task | Priority | Duration |
|------|----------|----------|
| Implement `SettingsService.ts` | P0 | 30 min |
| Create `/settings` page | P0 | 45 min |
| Build organization settings form | P0 | 45 min |
| Build work schedule settings | P1 | 30 min |

#### 9.2.2 Audit Logging

| Task | Priority | Duration |
|------|----------|----------|
| Implement `AuditService.ts` | P0 | 30 min |
| Add audit logging to all services | P0 | 1.5 hours |
| Create `/audit` page | P0 | 1 hour |
| Build audit log table with filters | P0 | 45 min |
| Create log detail modal | P1 | 30 min |

### 9.3 Acceptance Criteria

- [ ] Organization settings can be saved
- [ ] Work schedule can be configured
- [ ] All CRUD operations create audit logs
- [ ] Audit log page shows filterable history
- [ ] Log details display before/after values

### 9.4 Dependencies

- All previous phases complete

---

## 10. Phase 8 — QA, Hardening & Deployment

### 10.1 Overview

Final quality assurance, security hardening, and production readiness.

### 10.2 Tasks

#### 10.2.1 Frontend QA

| Task | Priority | Duration |
|------|----------|----------|
| Test all forms for validation | P0 | 2 hours |
| Test all tables for pagination | P0 | 1 hour |
| Test all modals/toasts | P0 | 1 hour |
| Test responsive layouts | P1 | 1 hour |
| Fix UI bugs | P0 | Variable |

#### 10.2.2 Backend QA

| Task | Priority | Duration |
|------|----------|----------|
| Test all RLS policies | P0 | 2 hours |
| Validate foreign key constraints | P0 | 30 min |
| Test role-based access | P0 | 1 hour |
| Security audit (OWASP) | P1 | 2 hours |

#### 10.2.3 Performance

| Task | Priority | Duration |
|------|----------|----------|
| Review database indexes | P1 | 30 min |
| Optimize slow queries | P1 | 1 hour |
| Test with larger datasets | P1 | 1 hour |

#### 10.2.4 Documentation

| Task | Priority | Duration |
|------|----------|----------|
| Update architecture docs | P1 | 1 hour |
| Create user guide | P2 | 2 hours |
| Document API endpoints | P2 | 1 hour |

#### 10.2.5 Deployment

| Task | Priority | Duration |
|------|----------|----------|
| Verify production environment | P0 | 30 min |
| Publish to Lovable | P0 | 15 min |
| Connect custom domain (optional) | P2 | 30 min |
| Smoke test production | P0 | 30 min |

### 10.3 Acceptance Criteria

- [ ] All forms validate correctly
- [ ] All tables paginate and filter
- [ ] No console errors in production
- [ ] RLS policies prevent unauthorized access
- [ ] Performance is acceptable (<2s page load)
- [ ] Production deployment successful
- [ ] Smoke tests pass

---

## 11. Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| RLS policy misconfiguration | High | Medium | Thorough testing, security audit |
| Template breaking changes | Medium | Low | Strict 1:1 Darkone adherence |
| Supabase downtime | Medium | Low | VPS migration plan documented |
| Scope creep | Medium | Medium | Strict phase boundaries |
| Data migration issues | High | Low | SQL backups, schema versioning |

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| All MVP modules complete | 100% |
| RLS policies active | 100% of tables |
| UI matches Darkone template | 100% |
| Critical bugs | 0 |
| Page load time | <2 seconds |
| Test coverage (future) | >70% |

---

## 13. Next Steps

1. **Wait for approval** of this documentation set
2. **Enable Lovable Cloud** (Phase 1, Task 1)
3. **Create database schema** (Phase 1)
4. **Begin implementation** phase by phase

---

**End of Implementation Roadmap**
