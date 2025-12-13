# Darkone Charts Library

> **Source Path:** `src/app/(admin)/charts/apex/components/AllApexChart.tsx`  
> **Demo Route:** `/charts/apex`  
> **Dependency:** `apexcharts`, `react-apexcharts`

---

## Available Chart Types (19 Total)

| # | Chart Type | Function Name | Lines | HRM Applicability |
|---|------------|---------------|-------|-------------------|
| 1 | Line | `LineChart` | 4-45 | ⭐⭐⭐ Attendance trends |
| 2 | Gradient Line | `LineGradientChart` | 47-110 | ⭐⭐ Monthly metrics |
| 3 | Stacked Area | `StackedAreaChart` | 112-175 | ⭐⭐ Leave accumulation |
| 4 | Basic Column | `BasicColumnChart` | 177-240 | ⭐⭐⭐ Department comparison |
| 5 | Column w/ Labels | `ColumnWithLabelsChart` | 242-305 | ⭐⭐ Employee counts |
| 6 | Stacked Column | `StackedColumnChart` | 307-375 | ⭐⭐ Multi-category data |
| 7 | Bar | `BarChart` | 377-430 | ⭐⭐⭐ Position distribution |
| 8 | Grouped Bar | `GroupedBarChart` | 432-500 | ⭐⭐ Comparison views |
| 9 | Mixed (Line + Column) | `MixedChart` | 502-580 | ⭐⭐⭐ Trend + volume |
| 10 | Bubble | `BubbleChart` | 582-655 | ⭐ Special analytics |
| 11 | Candlestick | `CandlestickChart` | 657-720 | ❌ Not applicable |
| 12 | Timeline | `TimelineChart` | 722-785 | ⭐⭐ Project timelines |
| 13 | Scatter | `ScatterChart` | 787-850 | ⭐ Correlation analysis |
| 14 | Pie | `PieChart` | 852-900 | ⭐⭐⭐ Distribution views |
| 15 | Donut | `DonutChart` | 902-950 | ⭐⭐⭐ Category breakdown |
| 16 | Radial | `RadialChart` | 952-1010 | ⭐⭐ Progress indicators |
| 17 | Radar | `RadarChart` | 1012-1075 | ⭐ Skills mapping |
| 18 | Polar Area | `PolarAreaChart` | 1077-1130 | ⭐ Multi-axis data |
| 19 | Heatmap | `HeatmapChart` | 1132-1200 | ⭐⭐ Attendance calendar |

**Legend:** ⭐⭐⭐ High priority | ⭐⭐ Medium | ⭐ Low | ❌ Not applicable

---

## Priority Charts for HRM

### Tier 1 (Dashboard KPIs)
- **Sparkline Area** — KPI cards (see `sparkline-kpi.json`)
- **Donut** — Category distribution (see `donut-category.json`)
- **Basic Column** — Department comparison (see `bar-metrics.json`)

### Tier 2 (Reports)
- **Line** — Trend analysis over time
- **Mixed** — Combined metrics (bar + line)
- **Heatmap** — Attendance calendar view

### Tier 3 (Advanced)
- **Stacked Area** — Cumulative metrics
- **Radar** — Employee skills visualization

---

## JSON Configuration Files

| File | Chart Type | Purpose |
|------|------------|---------|
| `sparkline-kpi.json` | Sparkline Area | KPI stat cards |
| `line-revenue.json` | Mixed Bar+Area | Trend dashboard |
| `donut-category.json` | Donut | Category breakdown |
| `bar-metrics.json` | Basic Column | Comparison charts |

---

## Integration Pattern

```typescript
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

// Load config from demo library
import chartConfig from '@/demo-configs/donut-category.json'

// Replace mock data with real HRM data
const options: ApexOptions = {
  ...chartConfig.apexOptions,
  labels: ['Annual', 'Sick', 'Casual', 'Unpaid'], // HRM labels
}

const series = await getLeaveDistribution() // [45, 25, 20, 10]

return <ReactApexChart options={options} series={series} type="donut" />
```
