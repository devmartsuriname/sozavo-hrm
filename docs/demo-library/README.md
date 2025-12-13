# Darkone Demo Library

> ⚠️ **ARCHIVED FOR REUSE — Do not delete without review**

> **Purpose:** Preserve reusable Darkone demo components for future HRM features  
> **Created:** Phase 3.5 – Step 3.5.2  
> **Updated:** Phase 3.5 – Step 3.5.3 (demo routes removed from active app)  
> **Status:** Documentation Only (no runtime impact)

---

## Overview

This library documents all Darkone demo UI components, charts, maps, and widgets that have been preserved for future reuse in SoZaVo HRM dashboards and analytics features.

**Important:** These assets are documentation references only. The demo pages will be removed from the active admin sidebar in Step 3.5.3, but the underlying components remain available in the codebase for integration into real HRM features.

---

## Library Structure

| Folder | Contents | HRM Reuse Target |
|--------|----------|------------------|
| `dashboard/` | KPI cards, stat widgets, revenue charts | HRM metrics dashboard |
| `charts/` | ApexCharts configurations (19 types) | Leave trends, attendance analytics |
| `maps/` | World vector map with markers | Login location tracking |
| `ui-widgets/` | Stat cards, badges, status patterns | Employee KPIs, status indicators |
| `forms/` | Form components reference | Employee/Leave forms |
| `tables/` | Table implementations | Data grids, employee lists |
| `icons/` | Icon sets reference | UI iconography |
| `layouts/` | Layout variants | Future theme options |

---

## Quick Reference

### High-Priority Reuse Components

1. **Sparkline KPI Cards** (`dashboard/darkone-dashboard-widgets.md`)
   - Target: HRM Dashboard main metrics
   - Ready for: Total Employees, Active Leave, Pending Approvals

2. **World Vector Map** (`maps/world-map-login-locations.md`)
   - Target: Login location visualization
   - Ready for: Auth audit feature

3. **Donut Chart** (`charts/donut-category.json`)
   - Target: Leave distribution by type
   - Ready for: Phase 4 Leave Analytics

4. **Bar + Area Combo Chart** (`charts/line-revenue.json`)
   - Target: Attendance trends over time
   - Ready for: Phase 4 Attendance Reports

---

## Integration Pattern

When integrating a demo component into HRM:

1. **Find the component** in this library
2. **Copy the configuration** (JSON or code snippet)
3. **Replace mock data** with Supabase query results
4. **Apply HRM context** (labels, colors, formatting)

Example:
```typescript
// Before (demo)
series: [44, 55, 41, 17] // Mock percentages

// After (HRM)
series: [annualLeave, sickLeave, casualLeave, unpaidLeave] // Real data
```

---

## Related Documentation

- `docs/backend.md` — Service layer and data access
- `docs/architecture.md` — System architecture
- `docs/hrm/HRM_Tasks_Backlog.md` — Implementation roadmap
