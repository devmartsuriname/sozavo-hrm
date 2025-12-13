# Icons Reference

> **Source Path:** `src/app/(admin)/icons/`  
> **Demo Routes:** `/icons/*`  
> **Wrapper Component:** `IconifyIcon`

---

## Available Icon Sets

| Set | Route | Library | Count |
|-----|-------|---------|-------|
| Box Icons | `/icons/boxicons` | @iconify/react | 1500+ |
| Solar Icons | `/icons/solar` | @iconify/react | 1000+ |

---

## IconifyIcon Component

**Location:** `src/components/wrapper/IconifyIcon.tsx`

```tsx
import { Icon } from '@iconify/react'

interface IconifyIconProps {
  icon: string
  className?: string
  width?: number
  height?: number
}

export const IconifyIcon = ({ icon, className, width, height }: IconifyIconProps) => (
  <Icon icon={icon} className={className} width={width} height={height} />
)
```

### Usage

```tsx
import IconifyIcon from '@/components/wrapper/IconifyIcon'

// Solar Icons (recommended)
<IconifyIcon icon="solar:users-group-rounded-bold" className="fs-24" />
<IconifyIcon icon="solar:check-circle-bold" className="text-success" />
<IconifyIcon icon="solar:calendar-bold" className="text-primary" />

// Box Icons
<IconifyIcon icon="bx:user" />
<IconifyIcon icon="bx:check-circle" />
```

---

## HRM Icon Mapping

### Sidebar Menu

| Menu Item | Icon |
|-----------|------|
| Dashboard | `solar:home-2-bold-duotone` |
| HRM | `solar:users-group-rounded-bold-duotone` |
| Employees | `solar:user-id-bold-duotone` |
| Organization Units | `solar:buildings-bold-duotone` |
| Positions | `solar:case-bold-duotone` |
| Users & Roles | `solar:user-setting-line` |

### Status Indicators

| Status | Icon | Color |
|--------|------|-------|
| Active | `solar:check-circle-bold` | `text-success` |
| Inactive | `solar:close-circle-bold` | `text-secondary` |
| Pending | `solar:clock-circle-bold` | `text-warning` |
| Error | `solar:danger-bold` | `text-danger` |

### Actions

| Action | Icon |
|--------|------|
| View | `solar:eye-bold` |
| Edit | `solar:pen-bold` |
| Delete | `solar:trash-bin-trash-bold` |
| Add | `solar:add-circle-bold` |
| Download | `solar:download-bold` |
| Upload | `solar:upload-bold` |

---

## Finding Icons

### Iconify Search

Visit [icon-sets.iconify.design](https://icon-sets.iconify.design/) to search:

1. Search for keyword (e.g., "user")
2. Filter by collection (Solar, Box Icons)
3. Copy icon name (e.g., `solar:user-bold`)
4. Use with `IconifyIcon` component

### Recommended Sets for HRM

| Priority | Set | Style | Best For |
|----------|-----|-------|----------|
| 1 | Solar | Modern, consistent | Primary UI |
| 2 | Box Icons | Classic, versatile | Fallback |
| 3 | Material Symbols | Google style | Forms |
