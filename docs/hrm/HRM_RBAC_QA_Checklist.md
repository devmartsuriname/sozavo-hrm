# SoZaVo HRM System — RBAC QA Checklist

> **Version:** 1.0  
> **Created:** 2025-12-12  
> **Phase:** 3 – Step 3.4 (RBAC QA Pass)  
> **Status:** Ready for Testing

---

## Overview

This document provides a comprehensive checklist for validating Role-Based Access Control (RBAC) in the SoZaVo HRM System. It covers all four core roles and their expected access to HRM features.

### Purpose

- Verify that permission model behaves exactly as designed
- Document expected vs actual behavior for each role
- Identify any permission gaps or misconfigurations
- Provide stakeholders with a clear, auditable QA record

---

## Test Users

| Email | Role | Password | Employee Code | Description |
|-------|------|----------|---------------|-------------|
| `admin@sozavo.sr` | `admin` | (set in Supabase) | EMP-ADMIN-001 | Full system access |
| `hr.manager@sozavo.sr` | `hr_manager` | (set in Supabase) | EMP-HR-001 | HR operations, read-only roles |
| `manager@sozavo.sr` | `manager` | (set in Supabase) | EMP-MANAGER-001 | Team visibility only |
| `employee@sozavo.sr` | `employee` | (set in Supabase) | EMP-EMP-001 | Self-service only |

### Test Data Hierarchy

```
SoZaVo HQ (SOZAVO_HQ)
├── HR Department (HR)
│   ├── HR Director (HR-DIR) ← Karel Adminstra (admin)
│   └── HR Officer (HR-OFF) ← Henk HRManager (hr_manager)
└── Volkshuisvesting Department (VHV)
    ├── Department Manager (VHV-MGR) ← Maria Manager (manager)
    └── Staff Member (VHV-STAFF) ← Jan Employee (employee)
```

- **Manager (Maria Manager)** has 2 direct reports: Jan Employee + additional VHV staff
- **Employee (Jan Employee)** has no subordinates

---

## Test Scenarios by Role

### 1. Admin Role (`admin@sozavo.sr`)

Login as Admin and verify:

#### Global Navigation Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| A1 | Access `/hrm/employees` | ✅ See all employees in table | | |
| A2 | Access `/hrm/users` | ✅ See all users with roles | | |
| A3 | Access `/hrm/org-units` | ✅ See all organization units | | |
| A4 | Access `/hrm/positions` | ✅ See all positions | | |

#### Users & Roles

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| A5 | Click any user in Users list | ✅ Opens User Detail page | | |
| A6 | Click "Manage Roles & Linking" | ✅ Opens Role Manager modal | | |
| A7 | Toggle role checkboxes | ✅ Can add/remove roles | | |
| A8 | Change employee linking | ✅ Can link/unlink employee | | |
| A9 | Save role changes | ✅ Changes persist after refresh | | |

#### Employee Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| A10 | Click any employee code | ✅ Opens Employee Detail page | | |
| A11 | Click "Edit" on any employee | ✅ Opens Employee Edit form | | |
| A12 | Access `/hrm/employees/new` | ✅ Opens Employee Create form | | |
| A13 | Submit employee form | ✅ Creates/updates employee | | |

#### Structural Data

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| A14 | Click org unit code | ✅ Opens Org Unit Detail page | | |
| A15 | Click position code | ✅ Opens Position Detail page | | |

---

### 2. HR Manager Role (`hr.manager@sozavo.sr`)

Login as HR Manager and verify:

#### Global Navigation Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| H1 | Access `/hrm/employees` | ✅ See all employees in table | | |
| H2 | Access `/hrm/users` | ✅ See all users with roles | | |
| H3 | Access `/hrm/org-units` | ✅ See all organization units | | |
| H4 | Access `/hrm/positions` | ✅ See all positions | | |

#### Users & Roles

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| H5 | Click any user in Users list | ✅ Opens User Detail page | | |
| H6 | Click "Manage Roles & Linking" | ✅ Opens Role Manager modal | | |
| H7 | Attempt to toggle role checkboxes | ⛔ Checkboxes are **disabled** (read-only) | | |
| H8 | Attempt to change employee linking | ⛔ Dropdown is **disabled** (read-only) | | |
| H9 | View Save button state | ⛔ Save button is **hidden or disabled** | | |

#### Employee Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| H10 | Click any employee code | ✅ Opens Employee Detail page | | |
| H11 | Click "Edit" on any employee | ✅ Opens Employee Edit form | | |
| H12 | Access `/hrm/employees/new` | ✅ Opens Employee Create form | | |
| H13 | Submit employee form | ✅ Creates/updates employee | | |

#### Structural Data

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| H14 | Click org unit code | ✅ Opens Org Unit Detail page | | |
| H15 | Click position code | ✅ Opens Position Detail page | | |

---

### 3. Manager Role (`manager@sozavo.sr`)

Login as Manager and verify:

#### Global Navigation Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| M1 | Access `/hrm/employees` | ✅ See **only direct reports** (2 rows max) | | |
| M2 | Access `/hrm/users` | ⛔ See "Access Denied" alert | | |
| M3 | Access `/hrm/org-units` | ⛔ See "Access Denied" alert | | |
| M4 | Access `/hrm/positions` | ⛔ See "Access Denied" alert | | |

#### Users & Roles

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| M5 | Navigate to `/hrm/users` via URL | ⛔ See "Access Denied" or redirect | | |
| M6 | Navigate to `/hrm/users/:userId` via URL | ⛔ See "Access Denied" or redirect | | |

#### Employee Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| M7 | View own employee detail (EMP-MANAGER-001) | ✅ Opens successfully | | |
| M8 | View direct report detail | ✅ Opens successfully | | |
| M9 | Navigate to other employee by URL | ⛔ "Not found or access denied" | | |
| M10 | Access `/hrm/employees/:id/edit` | ⛔ See "Access Denied" alert | | |
| M11 | Access `/hrm/employees/new` | ⛔ See "Access Denied" alert | | |
| M12 | See "Edit" button on Employee Detail | ⛔ Button is **hidden** | | |

#### Structural Data

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| M13 | Navigate to `/hrm/org-units/:id` via URL | ⛔ See "Access Denied" alert | | |
| M14 | Navigate to `/hrm/positions/:id` via URL | ⛔ See "Access Denied" alert | | |

---

### 4. Employee Role (`employee@sozavo.sr`)

Login as Employee and verify:

#### Global Navigation Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| E1 | Access `/hrm/employees` | ✅ See **only own record** (1 row) | | |
| E2 | Access `/hrm/users` | ⛔ See "Access Denied" alert | | |
| E3 | Access `/hrm/org-units` | ⛔ See "Access Denied" alert | | |
| E4 | Access `/hrm/positions` | ⛔ See "Access Denied" alert | | |

#### Users & Roles

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| E5 | Navigate to `/hrm/users` via URL | ⛔ See "Access Denied" or redirect | | |
| E6 | Navigate to `/hrm/users/:userId` via URL | ⛔ See "Access Denied" or redirect | | |

#### Employee Access

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| E7 | View own employee detail (EMP-EMP-001) | ✅ Opens successfully | | |
| E8 | Navigate to manager's detail by URL | ⛔ "Not found or access denied" | | |
| E9 | Navigate to any other employee by URL | ⛔ "Not found or access denied" | | |
| E10 | Access `/hrm/employees/:id/edit` | ⛔ See "Access Denied" alert | | |
| E11 | Access `/hrm/employees/new` | ⛔ See "Access Denied" alert | | |
| E12 | See "Edit" button on Employee Detail | ⛔ Button is **hidden** | | |

#### Structural Data

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| E13 | Navigate to `/hrm/org-units/:id` via URL | ⛔ See "Access Denied" alert | | |
| E14 | Navigate to `/hrm/positions/:id` via URL | ⛔ See "Access Denied" alert | | |

---

## Summary Results

| Role | Tests | Passed | Failed | Notes |
|------|-------|--------|--------|-------|
| Admin | 15 | | | |
| HR Manager | 15 | | | |
| Manager | 14 | | | |
| Employee | 14 | | | |
| **Total** | **58** | | | |

---

## Known Limitations

1. **Sidebar Menu Filtering**: Menu items are visible to all roles. Access control is enforced at the page level, not sidebar level. Darkone guardrails prevent dynamic menu filtering; this is deferred to a future step.

2. **RLS-Derived Fields**: Managers and Employees see "—" for org unit/position names due to RLS blocking access to lookup tables.

3. **Employee Code Navigation**: Employee codes are clickable links; if RLS blocks the target employee, the detail page shows "Not found or access denied".

---

## Permission Gap Analysis

| Permission Check | Implementation | Expected | Gap? |
|------------------|----------------|----------|------|
| `canViewUsers()` | Admin + HR Manager | Admin + HR Manager | ✅ No |
| `canModifyRoles()` | Admin only | Admin only | ✅ No |
| `canViewHRMData()` | Admin + HR Manager | Admin + HR Manager | ✅ No |
| `canEditEmployee()` | Admin + HR Manager | Admin + HR Manager | ✅ No |
| `canViewEmployee()` | Self + managers + Admin + HR | Self + managers + Admin + HR | ✅ No |

**Conclusion:** No permission gaps identified during checklist creation. All permission checks align with documented RBAC model.

---

## How to Use This Checklist

1. **Login** as each test user
2. **Execute** each scenario in sequence
3. **Record** actual result in "Actual" column
4. **Mark** status: ✅ Pass, ⛔ Fail, ⚠️ Partial
5. **Note** any deviations or unexpected behavior
6. **Report** failures for remediation

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-12 | 1.0 | Lovable AI | Initial creation for Phase 3 – Step 3.4 |
