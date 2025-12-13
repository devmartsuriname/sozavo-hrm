# Layouts Reference

> **Source Path:** `src/app/(admin)/layouts/`  
> **Demo Routes:** `/layouts/*`

---

## Available Layout Variants

| Layout | Route | Description | HRM Applicability |
|--------|-------|-------------|-------------------|
| Dark Sidenav | `/layouts/dark-sidenav` | Dark sidebar, light content | ⚠️ Future option |
| Dark Topnav | `/layouts/dark-topnav` | Dark header, light content | ⚠️ Future option |
| Small Sidenav | `/layouts/small-sidenav` | Collapsed icon-only sidebar | ⚠️ Mobile enhancement |
| Hidden Sidenav | `/layouts/hidden-sidenav` | Toggle-able sidebar | ⚠️ Mobile enhancement |
| Dark Mode | `/layouts/dark` | Full dark theme | ⚠️ Future option |

---

## Current HRM Layout

**Active Layout:** Default Darkone AdminLayout

| Component | File | Status |
|-----------|------|--------|
| AdminLayout | `src/layouts/AdminLayout.tsx` | ✅ Protected (read-only) |
| TopNavigationBar | `src/components/layout/TopNavigationBar/` | ✅ Protected |
| VerticalNavigationBar | `src/components/layout/VerticalNavigationBar/` | ✅ Protected |
| Footer | `src/components/layout/Footer.tsx` | ✅ Protected |

---

## Layout Guardrails

**Per project constraints, these layout files are READ-ONLY:**

- ❌ Do NOT modify `AdminLayout.tsx`
- ❌ Do NOT modify `TopNavigationBar/`
- ❌ Do NOT modify `VerticalNavigationBar/`
- ❌ Do NOT modify `Footer.tsx`
- ❌ Do NOT modify `src/assets/scss/` structure

**Allowed modifications:**
- ✅ Add menu items via `src/assets/data/menu-items.ts`
- ✅ Add new routes via `src/routes/index.tsx`
- ✅ Create new HRM components in `src/components/hrm/`

---

## Future Theme Options

If theme switching is requested in Phase 8+:

1. **Dark Mode Toggle**
   - Leverage existing `dark` layout variant
   - Add theme context for user preference
   - Store preference in localStorage or user profile

2. **Compact Sidebar**
   - Use `small-sidenav` variant for mobile
   - Auto-collapse below 768px breakpoint

3. **Theme Configuration**
   - Color scheme selection
   - Logo customization
   - Font size preferences

---

## Responsive Behavior (Built-in)

Darkone includes responsive breakpoints:

| Breakpoint | Width | Sidebar Behavior |
|------------|-------|------------------|
| xs | < 576px | Hidden (hamburger menu) |
| sm | ≥ 576px | Hidden (hamburger menu) |
| md | ≥ 768px | Collapsed icons |
| lg | ≥ 992px | Expanded with labels |
| xl | ≥ 1200px | Full expanded |

These behaviors are built into AdminLayout and should not be modified.
