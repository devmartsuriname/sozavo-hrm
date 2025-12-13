# Stat Cards & KPI Widgets

> **Source Path:** `src/app/(admin)/dashboards/components/Cards.tsx`  
> **Pattern:** Bootstrap Card + Row/Col + ApexCharts Sparkline

---

## KPI Card Layout

### Structure

```tsx
<Card>
  <CardBody>
    <Row className="align-items-center">
      {/* Left: Icon Badge */}
      <Col xs={6}>
        <div className="avatar-sm bg-soft-primary rounded">
          <IconifyIcon icon={icon} className="avatar-title text-primary" />
        </div>
      </Col>
      
      {/* Right: Sparkline Chart */}
      <Col xs={6}>
        <ReactApexChart 
          type="area"
          series={series}
          options={chartOpts}
        />
      </Col>
    </Row>
    
    {/* Title & Count */}
    <p className="text-muted mb-0 mt-3">{title}</p>
    <h3 className="mt-1 mb-0">{count}</h3>
  </CardBody>
</Card>
```

### Visual Layout

```
┌─────────────────────────────────────┐
│  [Icon]              [Sparkline]    │
│                                     │
│  Metric Title                       │
│  1,234                              │
└─────────────────────────────────────┘
```

---

## Badge & Status Patterns

### Background Classes

| Class | Color | Use Case |
|-------|-------|----------|
| `bg-soft-primary` | Light blue | Default/info |
| `bg-soft-success` | Light green | Active/approved |
| `bg-soft-warning` | Light yellow | Pending/attention |
| `bg-soft-danger` | Light red | Error/terminated |
| `bg-soft-secondary` | Light gray | Inactive/neutral |

### Badge Classes

| Class | Color | Use Case |
|-------|-------|----------|
| `badge-soft-success` | Green | Active status |
| `badge-soft-warning` | Yellow | On Leave |
| `badge-soft-danger` | Red | Terminated |
| `badge-soft-secondary` | Gray | Inactive |

### Usage Example

```tsx
<Badge className={`badge-soft-${getStatusColor(status)}`}>
  {status}
</Badge>

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'success'
    case 'on_leave': return 'warning'
    case 'terminated': return 'danger'
    default: return 'secondary'
  }
}
```

---

## HRM Metrics Mapping

### Dashboard KPI Cards

| Position | Metric | Icon | Color |
|----------|--------|------|-------|
| 1 | Total Employees | `solar:users-group-rounded-bold` | Primary |
| 2 | Active Today | `solar:check-circle-bold` | Success |
| 3 | Pending Approvals | `solar:clock-circle-bold` | Warning |
| 4 | On Leave | `solar:calendar-bold` | Info |

### Data Queries

```typescript
// Card 1: Total Employees
const totalEmployees = await supabase
  .from('hrm_employees')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', true)

// Card 2: Present Today
const presentToday = await supabase
  .from('hrm_attendance_records')
  .select('*', { count: 'exact', head: true })
  .eq('date', today)
  .eq('status', 'present')

// Card 3: Pending Leave Requests
const pendingLeave = await supabase
  .from('hrm_leave_requests')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending')

// Card 4: Currently On Leave
const onLeave = await supabase
  .from('hrm_leave_requests')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'approved')
  .lte('start_date', today)
  .gte('end_date', today)
```

---

## Sparkline Trend Data

### 7-Day Trend Pattern

```typescript
async function getEmployeeTrend(days: number = 7): Promise<number[]> {
  const trend: number[] = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const { count } = await supabase
      .from('hrm_employees')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', date.toISOString())
      .eq('is_active', true)
    
    trend.push(count || 0)
  }
  
  return trend
}
```

### Color Selection

```typescript
function getSparklineColor(trend: number[]): string {
  const first = trend[0]
  const last = trend[trend.length - 1]
  
  if (last > first) return '#0acf97' // Success (up)
  if (last < first) return '#fa5c7c' // Danger (down)
  return '#6c757d' // Neutral (flat)
}
```
