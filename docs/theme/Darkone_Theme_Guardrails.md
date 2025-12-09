# Darkone Theme Guardrails

**Version:** 1.0  
**Last Updated:** 2025-01-09  
**Status:** Enforced Baseline

---

## 1. Purpose

The **Darkone React Admin Template** is the canonical UI foundation for the SoZaVo HRM System. This document establishes strict guardrails to ensure:

1. **Visual Consistency** — All admin pages maintain 1:1 fidelity with Darkone
2. **Template Preservation** — Core Darkone code remains untouched
3. **Predictable Extension** — New HRM features integrate cleanly without conflicts
4. **Migration Safety** — Future template upgrades remain possible

> ⚠️ **Rule Zero:** Darkone is the law. Do not restyle, refactor, or "improve" template code without explicit approval.

---

## 2. Read-Only Areas (Protected)

The following directories and files are **read-only**. No structural or stylistic changes are permitted without explicit approval from the project lead.

### 2.1 Core SCSS

| Path | Contents | Modification Rule |
|------|----------|-------------------|
| `src/assets/scss/config/**` | SCSS variables, theme modes | ❌ NO CHANGES |
| `src/assets/scss/structure/**` | Layout styles (topbar, sidebar, footer, general) | ❌ NO CHANGES |
| `src/assets/scss/components/**` | Bootstrap component overrides | ❌ NO CHANGES |
| `src/assets/scss/plugins/**` | Third-party plugin styles | ❌ NO CHANGES |
| `src/assets/scss/pages/**` | Page-specific styles | ❌ NO CHANGES |
| `src/assets/scss/style.scss` | Main style entry point | ❌ NO CHANGES |

### 2.2 Core Layout Components

| Path | Component | Modification Rule |
|------|-----------|-------------------|
| `src/layouts/AdminLayout.tsx` | Main admin wrapper | ❌ NO CHANGES |
| `src/layouts/AuthLayout.tsx` | Auth page wrapper | ❌ NO CHANGES |
| `src/components/layout/TopNavigationBar/**` | Top header | ❌ NO CHANGES |
| `src/components/layout/VerticalNavigationBar/**` | Sidebar navigation | ❌ NO CHANGES |
| `src/components/layout/Footer.tsx` | Page footer | ❌ NO CHANGES |

### 2.3 Existing Darkone Demo Pages

| Path | Contents | Modification Rule |
|------|----------|-------------------|
| `src/app/(admin)/dashboards/**` | Dashboard pages | ❌ NO CHANGES |
| `src/app/(admin)/base-ui/**` | Base UI demos | ❌ NO CHANGES |
| `src/app/(admin)/forms/**` | Form demos | ❌ NO CHANGES |
| `src/app/(admin)/tables/**` | Table demos | ❌ NO CHANGES |
| `src/app/(admin)/icons/**` | Icon demos | ❌ NO CHANGES |
| `src/app/(admin)/maps/**` | Map demos | ❌ NO CHANGES |
| `src/app/(admin)/apex-chart/**` | Chart demos | ❌ NO CHANGES |

### 2.4 Supporting Assets

| Path | Contents | Modification Rule |
|------|----------|-------------------|
| `src/assets/images/**` | Template images | ❌ NO CHANGES |
| `src/helpers/**` | Template helpers | ❌ NO CHANGES |

---

## 3. Allowed Extension Points

The following areas are designated for HRM-specific extensions:

### 3.1 New Page Routes

✅ **Allowed:** Create new routes under these namespaces:

```
src/app/(admin)/hrm/**           ← HRM module pages
src/app/(admin)/users/**         ← User management
src/app/(admin)/settings/**      ← System settings
src/app/(admin)/audit/**         ← Audit logs
```

Example structure:
```
src/app/(admin)/hrm/
├── employees/
│   ├── page.tsx                 ← Employee list
│   └── [id]/
│       └── page.tsx             ← Employee detail
├── organization/
│   ├── units/
│   │   └── page.tsx             ← Org units
│   └── positions/
│       └── page.tsx             ← Positions
├── leave/
│   └── page.tsx                 ← Leave management
└── attendance/
    └── page.tsx                 ← Attendance
```

### 3.2 Navigation Menu

✅ **Allowed:** Add new menu items in:

```typescript
// src/assets/data/menu-items.ts

// Add HRM section BEFORE the 'OTHER' title
{
  key: 'hrm',
  label: 'HRM...',
  isTitle: true,
},
{
  key: 'hrm-employees',
  label: 'Employees',
  icon: 'mingcute:user-4-line',
  url: '/hrm/employees',
},
// ... etc
```

### 3.3 HRM-Specific Components

✅ **Allowed:** Create new components under:

```
src/components/hrm/              ← HRM-specific UI components
├── EmployeeCard.tsx
├── EmployeeSelect.tsx
├── LeaveBalanceCard.tsx
├── AttendanceGrid.tsx
└── ...
```

**Rules:**
- Components must use Darkone styling patterns
- Components must import from `react-bootstrap`
- Components must follow existing naming conventions

### 3.4 Services & Types

✅ **Allowed:** Create new files under:

```
src/services/                    ← API service layer
├── EmployeeService.ts
├── LeaveService.ts
└── ...

src/types/hrm/                   ← HRM type definitions
├── employee.ts
├── leave.ts
└── ...

src/schemas/                     ← Zod validation schemas
├── employee.ts
└── ...
```

### 3.5 HRM Style Overrides

✅ **Allowed:** Add override styles in:

```
src/assets/scss/hrm-overrides.scss
```

**Rules:**
- This file is imported AFTER `style.scss` in `main.tsx`
- Only override specific properties as needed
- Document every override with a comment
- Never duplicate or conflict with Darkone core styles

### 3.6 Route Configuration

✅ **Allowed:** Add new routes in:

```
src/routes/                      ← Route configuration files
```

---

## 4. Hard Rules

### 4.1 Styling Rules

| ❌ FORBIDDEN | ✅ ALLOWED |
|-------------|-----------|
| Restyle Darkone components "for fun" | Use Darkone components as-is |
| Convert to Tailwind CSS | Use Bootstrap classes via react-bootstrap |
| Convert to shadcn/ui | Use Darkone's component patterns |
| Override Bootstrap variables in core | Use `hrm-overrides.scss` for minimal fixes |
| Create custom CSS that conflicts | Scope HRM styles carefully |

### 4.2 Component Rules

| ❌ FORBIDDEN | ✅ ALLOWED |
|-------------|-----------|
| Modify `AdminLayout.tsx` | Wrap children in new components |
| Modify sidebar/topbar components | Add menu items via `menu-items.ts` |
| Replace react-bootstrap | Use react-bootstrap for all UI |
| Create parallel design systems | Follow Darkone patterns exactly |

### 4.3 File Structure Rules

| ❌ FORBIDDEN | ✅ ALLOWED |
|-------------|-----------|
| Add files to `src/assets/scss/components/` | Create `src/assets/scss/hrm-overrides.scss` |
| Modify existing page files | Create new pages under allowed paths |
| Rename or move Darkone files | Create new directories for HRM |

---

## 5. Visual Consistency Checklist

When creating new HRM pages, verify:

- [ ] Page uses `AdminLayout` wrapper
- [ ] Page uses `PageTitle` component for header
- [ ] Cards use `Card`, `CardBody`, `CardTitle` from react-bootstrap
- [ ] Tables follow Darkone table patterns
- [ ] Forms use Darkone form input components
- [ ] Buttons use Darkone button variants
- [ ] Modals use react-bootstrap `Modal`
- [ ] Icons use `IconifyIcon` wrapper
- [ ] Spacing follows Bootstrap spacing utilities
- [ ] Colors use Darkone CSS variables

---

## 6. Exception Process

If you believe a change to protected code is necessary:

1. **Document the need** — Explain why the change is required
2. **Propose minimal change** — Show the smallest possible modification
3. **Request approval** — Get explicit approval from project lead
4. **Tag the change** — Mark with `// HRM-EXCEPTION: <reason>`

---

## 7. Reference Files

| Document | Purpose |
|----------|---------|
| `docs/theme/Darkone_Component_Registry.md` | Component usage reference |
| `docs/hrm/HRM_System_Developer_Guide.md` | Development standards |
| `Darkone-React_v1.0/` | Original template reference |

---

**End of Theme Guardrails**
