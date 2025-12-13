# Demo Library — Integration Notes

> **Purpose:** Future integration planning and open questions  
> **Last Updated:** Phase 3.5

---

## Phase 6 Integration Targets

When Phase 6 (Dashboard & Reporting) begins, these demo components should be prioritized:

### HRM Dashboard Page (`P6-UI-001`)

| Widget | Demo Source | Data Source |
|--------|-------------|-------------|
| Employee Count KPI | `Cards.tsx` sparkline | `hrm_employees` COUNT |
| Leave Requests KPI | `Cards.tsx` sparkline | `hrm_leave_requests` COUNT |
| Attendance Rate KPI | `Cards.tsx` sparkline | `hrm_attendance_records` aggregate |
| Department Distribution | `SaleChart.tsx` donut | `hrm_organization_units` + employee count |

### Login Location Map (Audit Feature)

| Feature | Demo Source | Data Source |
|---------|-------------|-------------|
| World Map | `CountryMap.tsx` | Supabase auth.audit_log_entries |
| Country Markers | jsvectormap markers | Aggregated by country code |

---

## Data Shape Mapping

### KPI Cards

Demo data shape:
```typescript
{
  count: number,
  icon: string,
  series: number[], // sparkline data points
  title: string
}
```

HRM data shape:
```typescript
{
  count: await supabase.from('hrm_employees').select('*', { count: 'exact' }),
  icon: 'solar:users-group-rounded-bold',
  series: await getEmployeeTrend(7), // last 7 days
  title: 'Total Employees'
}
```

### Donut Charts

Demo data shape:
```typescript
{
  series: [44, 55, 41, 17], // percentages
  labels: ['Category A', 'Category B', 'Category C', 'Category D']
}
```

HRM data shape:
```typescript
{
  series: await getLeaveByType(), // [annual, sick, casual, unpaid]
  labels: ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave']
}
```

---

## Open Questions

1. **Color Theming**: Should HRM charts use Darkone's default colors or custom HRM palette?
   - Recommendation: Use Darkone defaults for consistency

2. **Responsive Behavior**: How should charts behave on mobile?
   - Recommendation: Follow existing Darkone responsive breakpoints

3. **Real-time Updates**: Should dashboard KPIs auto-refresh?
   - Recommendation: Manual refresh button initially; Supabase Realtime for Phase 8

---

## Dependencies to Preserve

These npm packages are required for demo component functionality:

| Package | Used By | Critical |
|---------|---------|----------|
| `apexcharts` | All charts | ✅ Yes |
| `react-apexcharts` | All charts | ✅ Yes |
| `jsvectormap` | Maps | ✅ Yes |
| `react-bootstrap` | All UI | ✅ Yes |

**Do NOT remove these packages during cleanup.**
