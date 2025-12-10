# SoZaVo HRM System — Implementation Roadmap v2.0

**Version:** 2.1  
**Last Updated:** 2025-12-10  
**Status:** Aligned with Darkone React Template Integration

---

## 1. Executive Summary

This roadmap provides the step-by-step execution plan for building the SoZaVo HRM System. It is fully aligned with the completed Darkone React template integration and optimized for Lovable's AI-assisted development workflow.

### Key Milestones

| Phase | Name | Duration | Status |
|-------|------|----------|--------|
| 0 | Environment & Template Setup | 1-2 days | ✅ COMPLETE |
| 1 | Database & Authentication | 3-5 days | ✅ COMPLETE |
| 2 | Core HR Module | 5-7 days | 🔄 In Progress (Steps 1–4 Complete) |
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
│   │   ├── dashboards/     ✅ Dashboard pages
│   │   └── hrm/            ✅ HRM module pages
│   └── (other)/            ✅ Auth & public routes
├── assets/                 ✅ Static assets & SCSS
├── components/             ✅ Reusable UI components
├── context/                ✅ React contexts (incl. SupabaseAuthContext)
├── helpers/                ✅ Utility functions
├── hooks/                  ✅ Custom React hooks (incl. HRM hooks)
├── layouts/                ✅ Page layouts
├── routes/                 ✅ Route configuration
├── services/               ✅ Data access services (incl. HRM services)
├── types/                  ✅ TypeScript definitions (incl. HRM types)
└── utils/                  ✅ Utility functions
```

### 2.3 No Modifications to Darkone Template

**Rule:** The Darkone template code remains untouched. All HRM features are additive only.

---

## 3. Phase 1 — Database & Authentication Foundation ✅ COMPLETE

### 3.1 Overview

Establish the Supabase Cloud backend with authentication and core database schema.

### 3.2 Tasks

#### 3.2.1 Enable Lovable Cloud

| Task | Priority | Status |
|------|----------|--------|
| Enable Lovable Cloud (Supabase) | P0 | ✅ |
| Verify Supabase project connection | P0 | ✅ |
| Review auto-generated client | P0 | ✅ |

#### 3.2.2 Create Database Schema

| Task | Priority | Status |
|------|----------|--------|
| Create `app_role` enum | P0 | ✅ |
| Create `employee_status` enum | P0 | ✅ |
| Create `leave_status` enum | P0 | ✅ |
| Create `attendance_status` enum | P0 | ✅ |
| Create `hrm_organization_units` table | P0 | ✅ |
| Create `hrm_positions` table | P0 | ✅ |
| Create `hrm_employees` table | P0 | ✅ |
| Create `user_roles` table (CRITICAL) | P0 | ✅ |
| Create `hrm_leave_types` table | P1 | ✅ |
| Create `hrm_leave_requests` table | P1 | ✅ |
| Create `hrm_attendance_records` table | P1 | ✅ |
| Create `hrm_documents` table | P1 | ✅ |
| Create `hrm_audit_logs` table | P1 | ✅ |
| Create `hrm_settings` table | P2 | ✅ |
| Add indexes | P1 | ✅ |

#### 3.2.3 Security Functions

| Task | Priority | Status |
|------|----------|--------|
| Create `has_role()` security definer | P0 | ✅ |
| Create `get_user_role()` function | P0 | ✅ |
| Create `is_admin()` function | P0 | ✅ |
| Create `is_manager_of()` function | P0 | ✅ |
| Create `get_manager_chain()` function | P1 | ✅ |

#### 3.2.4 RLS Policies

| Task | Priority | Status |
|------|----------|--------|
| Enable RLS on all tables | P0 | ✅ |
| Create `hrm_employees` policies | P0 | ✅ |
| Create `user_roles` policies | P0 | ✅ |
| Create `hrm_organization_units` policies | P1 | ✅ |
| Create `hrm_positions` policies | P1 | ✅ |
| Create `hrm_leave_requests` policies | P1 | ✅ |
| Create `hrm_documents` policies | P1 | ✅ |
| Create `hrm_audit_logs` policies | P2 | ✅ |

#### 3.2.5 Authentication Integration

| Task | Priority | Status |
|------|----------|--------|
| Update existing auth pages to use Supabase | P0 | ✅ |
| Implement `onAuthStateChange` listener | P0 | ✅ |
| Create `SupabaseAuthContext` with role lookup | P0 | ✅ |
| Implement role service (`roleService.ts`) | P0 | ✅ |
| Add error handling for auth flows | P0 | ✅ |
| Test login/logout flow | P0 | ✅ |
| Remove legacy fake-backend | P0 | ✅ |

#### 3.2.6 Seed Data

| Task | Priority | Status |
|------|----------|--------|
| Seed default leave types | P1 | ✅ |
| Seed default settings | P1 | ✅ |
| Seed test organization units | P2 | ✅ |
| Seed test employees | P2 | ✅ |
| Create test users (admin, hr_manager, manager, employee) | P0 | ✅ |

### 3.3 Acceptance Criteria ✅ ALL MET

- [x] Supabase Cloud is enabled and connected
- [x] All database tables exist with correct schema
- [x] RLS policies are active and tested
- [x] `user_roles` table is separate from any profile table
- [x] `has_role()` function works correctly
- [x] Authentication flow works (sign-in, sign-out)
- [x] User role is retrieved after login
- [x] Seed data is populated

### 3.4 Verification Status

**Status:** ✅ COMPLETE (Validated 2025-12-10)

All 25 RLS scenarios passed. See `docs/hrm/HRM_RLS_TestPlan.md` for full validation details.

Key verified behaviors:
- Admins have full access to all tables and operations
- HR managers can read/write HRM data but cannot delete structural records
- Managers see only their direct reports (via `is_manager_of()` function)
- Employees see only their own record
- All users can view their own role assignment

---

## 4. Phase 2 — Core HR Module

### 4.1 Overview

Build the foundational employee management, organization structure, and positions modules.

### 4.2 Tasks

#### 4.2.1 Service Layer

| Task | Priority | Status |
|------|----------|--------|
| Create `src/services/` directory | P0 | ✅ |
| Implement `hrmEmployeeService.ts` | P0 | ✅ |
| Implement `OrgUnitService.ts` | P0 | ⏳ |
| Implement `PositionService.ts` | P0 | ⏳ |

#### 4.2.2 TypeScript Types

| Task | Priority | Status |
|------|----------|--------|
| Create `src/types/hrm.ts` | P0 | ✅ |
| Define `HrmEmployeeRow` type | P0 | ✅ |
| Define `HrmEmployeeDirectory` type | P0 | ✅ |
| Define `HrmEmployeeDetail` type | P0 | ✅ |
| Define `OrgUnit` type | P0 | ⏳ |
| Define `Position` type | P0 | ⏳ |

#### 4.2.3 Organization Units UI

| Task | Priority | Status |
|------|----------|--------|
| Create `/hrm/organization/units` page | P0 | ⏳ |
| Build org unit tree component | P1 | ⏳ |
| Create org unit form modal | P0 | ⏳ |
| Implement CRUD operations | P0 | ⏳ |

#### 4.2.4 Positions UI

| Task | Priority | Status |
|------|----------|--------|
| Create `/hrm/organization/positions` page | P0 | ⏳ |
| Build positions data table | P0 | ⏳ |
| Create position form modal | P0 | ⏳ |
| Implement CRUD operations | P0 | ⏳ |

#### 4.2.5 Employee Management UI

| Task | Priority | Status |
|------|----------|--------|
| Create `/hrm/employees` list page | P0 | ✅ |
| Build employee data table with filters | P0 | ✅ |
| Add search functionality | P0 | ✅ |
| Add column sorting | P0 | ✅ |
| Add initials avatars | P0 | ✅ |
| Create `/hrm/employees/:id` detail page | P0 | ✅ |
| Build profile tab content | P0 | ✅ |
| Create employee form (create/edit) | P0 | ⏳ |
| Implement Zod validation schemas | P0 | ⏳ |
| Add CSV export | P2 | ⏳ |

#### 4.2.6 Navigation Integration

| Task | Priority | Status |
|------|----------|--------|
| Add HRM menu section to sidebar | P0 | ✅ |
| Configure route guards | P0 | ✅ |
| Implement hidden route pattern for detail pages | P0 | ✅ |

### 4.3 Implementation Progress

| Step | Description | Status |
|------|-------------|--------|
| 2.1 | Employee Directory (basic) | ✅ Verified |
| 2.2 | Employee Directory (Supabase integration) | ✅ Verified |
| 2.3 | Employee Directory UX (search, sorting, avatars) | ✅ Verified |
| 2.4 | Employee Detail View (read-only) | ✅ Verified |
| 2.5+ | Remaining (Org Units, Positions, Forms) | ⏳ Planned |

**RLS Note:** All employee screens respect role-based access control:
- Admins/HR Managers see all employees with full details
- Managers see direct reports only
- Employees see only their own record

See `docs/hrm/HRM_RLS_TestPlan.md` for validation details.

### 4.4 Acceptance Criteria

- [x] Employee list shows with search and sorting
- [x] Employee detail page displays all profile information
- [x] Navigation shows HRM menu items
- [x] All pages use Darkone components
- [ ] Organization units can be created, viewed, edited, deleted
- [ ] Hierarchy view shows parent-child relationships
- [ ] Positions can be managed with categories
- [ ] Employee create/edit forms validate input

### 4.5 Dependencies

- Phase 1 complete (database schema, auth) ✅

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

- Phases 2-6 complete

---

## 10. Phase 8 — QA, Hardening & Deployment

### 10.1 Overview

Final testing, security hardening, and production deployment.

### 10.2 Tasks

#### 10.2.1 Frontend QA

| Task | Priority | Duration |
|------|----------|----------|
| Manual test all CRUD flows | P0 | 2 hours |
| Test all role-based access scenarios | P0 | 1.5 hours |
| Cross-browser testing | P1 | 1 hour |
| Mobile responsiveness check | P1 | 1 hour |

#### 10.2.2 Backend QA

| Task | Priority | Duration |
|------|----------|----------|
| Verify all RLS policies | P0 | 1 hour |
| Test security functions | P0 | 30 min |
| Verify audit logging | P0 | 30 min |
| Test edge cases | P1 | 1 hour |

#### 10.2.3 Performance

| Task | Priority | Duration |
|------|----------|----------|
| Optimize slow queries | P1 | 1 hour |
| Add missing indexes | P1 | 30 min |
| Review bundle size | P2 | 30 min |

#### 10.2.4 Documentation

| Task | Priority | Duration |
|------|----------|----------|
| Update API documentation | P1 | 1 hour |
| Create user guide | P1 | 2 hours |
| Document deployment process | P0 | 30 min |

#### 10.2.5 Deployment

| Task | Priority | Duration |
|------|----------|----------|
| Configure production environment | P0 | 30 min |
| Setup custom domain | P1 | 30 min |
| Verify SSL certificates | P0 | 15 min |
| Production smoke test | P0 | 30 min |

### 10.3 Acceptance Criteria

- [ ] All manual tests pass
- [ ] No security vulnerabilities found
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Production deployment successful

### 10.4 Dependencies

- All previous phases complete

---

## 11. Risk Management

### 11.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS policy complexity | High | Extensive testing with multiple roles |
| Supabase rate limits | Medium | Implement caching, optimize queries |
| Bundle size growth | Medium | Code splitting, lazy loading |
| Browser compatibility | Low | Test early, use standard APIs |

### 11.2 Schedule Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict adherence to roadmap |
| Underestimated complexity | Medium | Buffer time in estimates |
| Darkone template changes | Medium | Document all customizations |

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| All RLS policies verified | 100% |
| Pages load time | < 3 seconds |
| CRUD operations working | 100% |
| Role-based access enforced | 100% |
| Documentation coverage | > 80% |

---

## 13. Next Steps

### Immediate (Phase 2 – Steps 5+)

1. ⏳ Create Organization Units management UI
2. ⏳ Create Positions management UI
3. ⏳ Create Employee Edit Form
4. ⏳ Add remaining type definitions

### After Phase 2

1. Begin Phase 3 (RBAC & User Management)
2. Implement advanced permission controls
3. Build user management interface
