# Darkone Dashboard Widgets

> **Source Path:** `src/app/(admin)/dashboards/`  
> **Demo Route:** `/dashboards/default`

---

## 1. StatCard (KPI Cards with Sparkline)

### Component Details

| Property | Value |
|----------|-------|
| **File Path** | `src/app/(admin)/dashboards/components/Cards.tsx` |
| **Component Name** | `StatCard` |
| **Wrapper Component** | `Cards` |
| **Chart Type** | Sparkline Area |

### Props Interface

```typescript
interface CardsType {
  count: string | number
  icon: string
  series: ApexAxisChartSeries
  title: string
}
```

### Data Source

```typescript
// From src/app/(admin)/dashboards/data.ts
export const cardsData: CardsType[] = [
  {
    count: '$1456.00',
    icon: 'solar:round-double-alt-arrow-up-bold-duotone',
    title: 'Today Revenue',
    series: [{ data: [25, 66, 41, 89, 63, 25, 44] }]
  },
  // ... more cards
]
```

### ApexOptions Configuration

```typescript
// Lines 8-59 in Cards.tsx
const chartOpts: ApexOptions = {
  chart: {
    type: 'area',
    sparkline: { enabled: true },
    height: 56,
    width: 80,
  },
  stroke: { width: 2, curve: 'smooth' },
  fill: { type: 'gradient', gradient: { ... } },
  colors: ['#0acf97'], // Success green
}
```

### HRM Reuse Mapping

| Demo Metric | HRM Metric | Data Source |
|-------------|------------|-------------|
| Today Revenue | Total Employees | `COUNT(*) FROM hrm_employees WHERE is_active = true` |
| Total Sales | Active Leave Requests | `COUNT(*) FROM hrm_leave_requests WHERE status = 'approved'` |
| Today Orders | Pending Approvals | `COUNT(*) FROM hrm_leave_requests WHERE status = 'pending'` |
| New Users | Attendance Rate | `(present / total) * 100 FROM hrm_attendance_records` |

---

## 2. Revenue Chart (Bar + Area Combo)

### Component Details

| Property | Value |
|----------|-------|
| **File Path** | `src/app/(admin)/dashboards/components/Chart.tsx` |
| **Chart Type** | Mixed (Bar + Area) |
| **Height** | 315px |

### ApexOptions Configuration

```typescript
// Lines 8-135 in Chart.tsx
const salesChart: ApexOptions = {
  chart: { type: 'bar', stacked: false, toolbar: { show: false } },
  series: [
    { name: 'Page Views', type: 'bar', data: [...] },
    { name: 'Clicks', type: 'area', data: [...] },
    { name: 'Revenue', type: 'area', data: [...] }
  ],
  xaxis: { categories: ['Jan', 'Feb', ...] },
  yaxis: [{ title: 'Views' }, { opposite: true, title: 'Revenue' }],
}
```

### HRM Reuse Mapping

| Demo Series | HRM Series | Data Source |
|-------------|------------|-------------|
| Page Views (bar) | Attendance Count | Daily attendance aggregation |
| Clicks (area) | Leave Requests | Monthly leave requests |
| Revenue (area) | New Hires | Monthly onboarding trend |

---

## 3. SaleChart (Donut Chart)

### Component Details

| Property | Value |
|----------|-------|
| **File Path** | `src/app/(admin)/dashboards/components/SaleChart.tsx` |
| **Chart Type** | Donut |
| **Height** | 231px |

### ApexOptions Configuration

```typescript
// Lines 6-50 in SaleChart.tsx
const SaleChartOptions: ApexOptions = {
  chart: { type: 'donut', height: 231 },
  series: [44, 55, 41, 17], // Percentages
  labels: ['Direct', 'Affilliate', 'Sponsored', 'E-mail'],
  colors: ['#3e60d5', '#6c757d', '#47ad77', '#ffc35a'],
  legend: { show: false },
  plotOptions: {
    pie: { donut: { size: '70%' } }
  }
}
```

### HRM Reuse Mapping

| Demo Category | HRM Category | Data Source |
|---------------|--------------|-------------|
| Direct | Annual Leave | Leave type count |
| Affiliate | Sick Leave | Leave type count |
| Sponsored | Casual Leave | Leave type count |
| E-mail | Unpaid Leave | Leave type count |

---

## 4. CountryMap (World Vector Map)

### Component Details

| Property | Value |
|----------|-------|
| **File Path** | `src/app/(admin)/dashboards/components/CountryMap.tsx` |
| **Map Component** | `WorldVectorMap` |
| **Dependency** | `jsvectormap` |

### Configuration Reference

See `maps/world-map-login-locations.md` for full documentation.

---

## 5. User Tables (New Accounts / Recent Transactions)

### Component Details

| Property | Value |
|----------|-------|
| **File Path** | `src/app/(admin)/dashboards/components/User.tsx` |
| **Pattern** | Bootstrap Table with Avatar |

### Table Structure

```tsx
<Table className="table-centered mb-0">
  <thead className="bg-light bg-opacity-50">
    <tr>
      <th>ID</th>
      <th>Date</th>
      <th>User</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.date}</td>
        <td><img /> {item.name}</td>
        <td><Badge>{item.status}</Badge></td>
      </tr>
    ))}
  </tbody>
</Table>
```

### HRM Reuse Mapping

| Demo Table | HRM Table | Data Source |
|------------|-----------|-------------|
| New Accounts | Recent Employee Changes | `hrm_employees ORDER BY updated_at DESC` |
| Recent Transactions | Recent Leave Actions | `hrm_leave_requests ORDER BY updated_at DESC` |
