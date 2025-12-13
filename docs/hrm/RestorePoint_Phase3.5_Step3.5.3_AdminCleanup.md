# Restore Point – Phase 3.5 – Step 3.5.3: Admin Sidebar Cleanup

**Created:** 2025-12-13
**Purpose:** Document state before HRM-only navigation cleanup

## What Was Removed

### From `src/assets/data/menu-items.ts`:
- Authentication section (lines 49-81) — nav entry removed, routes preserved for login
- Error Pages section (lines 82-102) — nav entry removed
- UI Kit title + Base UI (lines 103-241) — all 21 items
- Apex Charts (lines 242-248)
- Forms (lines 249-286) — 5 items
- Tables (lines 288-308) — 2 items
- Icons (lines 310-330) — 2 items
- Maps (lines 332-351) — 2 items
- OTHER title (lines 353-357)
- Layouts (lines 358-400) — 5 items
- Menu Items demo (lines 402-427)
- Disable Item demo (lines 428-434)
- Dashboard badge `{ text: '03', variant: 'primary' }`

### From `src/routes/index.tsx`:
- All Base UI lazy imports (lines 18-39) — 21 imports
- Charts/Maps imports (lines 43-45)
- Forms imports (lines 48-52)
- Tables imports (lines 55-56)
- Icons imports (lines 59-60)
- ErrorAlt import (line 68)
- Layouts imports (lines 72-76)
- `baseUIRoutes` array (lines 131-237)
- `chartsMapsRoutes` array (lines 238-259)
- `formsRoutes` array (lines 261-288)
- `tableRoutes` array (lines 290-301)
- `iconRoutes` array (lines 303-314)
- `layoutsRoutes` array (lines 376-402)
- Spread operators in `appRoutes`: `...baseUIRoutes`, `...formsRoutes`, `...chartsMapsRoutes`, `...layoutsRoutes`, `...tableRoutes`, `...iconRoutes`

### Dashboard Changes:
- Removed imports: `Cards`, `Chart`, `User` (demo KPI components)
- Added: `WelcomeCard`, `SystemStatus`, `QuickLinks` (clean HRM components)
- Changed PageTitle subName from "Darkone" to "SoZaVo HRM"

## What Was Kept

### Menu Items (Final):
- Dashboard (no badge)
- HRM: Employees, Organization Units, Positions, Users & Roles

### Routes (Final):
- Dashboard route
- HRM routes (employees, org-units, positions, users + hidden detail/edit pages)
- Auth routes (preserved for login flow, NOT in sidebar)

### Preserved for Demo Library Reference:
- `src/app/(admin)/dashboards/components/Cards.tsx`
- `src/app/(admin)/dashboards/components/Chart.tsx`
- `src/app/(admin)/dashboards/components/CountryMap.tsx`
- `src/app/(admin)/dashboards/components/SaleChart.tsx`
- `src/app/(admin)/dashboards/components/User.tsx`
- `src/app/(admin)/dashboards/data.ts`
- All demo page folders under `src/app/(admin)/` remain in repo

## Rollback Instructions

To restore demo navigation:

1. **Restore menu-items.ts**: Revert to commit before this step, or manually re-add the removed sections from the Demo Library documentation at `/docs/demo-library/`.

2. **Restore routes/index.tsx**: Revert to commit before this step, or re-add lazy imports and route arrays.

3. **Restore dashboard**: Replace new components with original imports:
   ```typescript
   import Cards from './components/Cards'
   import Chart from './components/Chart'
   import User from './components/User'
   ```

## Reference

- Demo patterns documented in `/docs/demo-library/`
- Original Darkone template preserved in `Darkone-React_v1.0/`
