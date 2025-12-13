# World Map — Login Location Tracking

> **Target HRM Feature:** Login location audit visualization  
> **Priority:** Phase 6+ (Dashboard & Reporting)

---

## Implementation Target

**Primary Component:** `CountryMap` from Dashboard  
**Location:** `src/app/(admin)/dashboards/components/CountryMap.tsx`

This is the preferred implementation because:
1. Already integrated with dashboard layout
2. Uses simple marker configuration
3. Matches existing Darkone Card styling

---

## File Paths

| File | Purpose |
|------|---------|
| `src/app/(admin)/dashboards/components/CountryMap.tsx` | Dashboard map widget |
| `src/components/VectorMap/WorldMap.tsx` | World map wrapper |
| `src/components/VectorMap/BaseVectorMap.tsx` | Base vector map component |
| `src/app/(admin)/maps/vectormaps/page.tsx` | Demo page (reference only) |

---

## Dependencies

```json
{
  "jsvectormap": "^1.3.2"
}
```

**Import Requirements:**
```typescript
import 'jsvectormap'
import 'jsvectormap/dist/maps/world.js'
```

---

## Marker Data Format

### jsvectormap Marker Schema

```typescript
interface MapMarker {
  name: string        // Tooltip label
  coords: [number, number]  // [latitude, longitude]
}
```

### Configuration Example

```typescript
const salesLocationOptions = {
  map: 'world',
  zoomOnScroll: false,
  zoomButtons: true,
  markersSelectable: true,
  
  // Region styling
  regionStyle: {
    initial: {
      fill: '#e9ecef'
    },
    hover: {
      fill: '#d1d5db'
    }
  },
  
  // Marker styling
  markerStyle: {
    initial: {
      fill: '#3e60d5',
      stroke: '#fff',
      r: 6  // radius
    },
    hover: {
      fill: '#fa5c7c',
      r: 8
    }
  },
  
  // Marker data
  markers: [
    { name: 'Suriname', coords: [3.9193, -56.0278] },
    { name: 'Netherlands', coords: [52.1326, 5.2913] },
    { name: 'USA', coords: [37.0902, -95.7129] },
    { name: 'Brazil', coords: [-14.2350, -51.9253] }
  ]
}
```

---

## HRM Login Location Schema

### Future Data Model

```typescript
interface LoginLocationData {
  country: string       // Country name
  countryCode: string   // ISO 3166-1 alpha-2 (e.g., 'SR', 'NL')
  latitude: number      // Decimal degrees
  longitude: number     // Decimal degrees
  loginCount: number    // Number of logins from this location
  lastLoginAt: string   // ISO timestamp
}
```

### Data Source

Supabase provides auth audit logs that can be queried:

```sql
-- Future query (requires auth.audit_log_entries access)
SELECT 
  ip_metadata->>'country' as country,
  ip_metadata->>'latitude' as latitude,
  ip_metadata->>'longitude' as longitude,
  COUNT(*) as login_count
FROM auth.audit_log_entries
WHERE action = 'login'
GROUP BY country, latitude, longitude
ORDER BY login_count DESC
```

**Note:** IP geolocation requires Supabase Pro plan or external geo-IP service.

---

## Integration Steps

1. **Create LoginLocationService**
   ```typescript
   // src/services/loginLocationService.ts
   export async function getLoginLocations(): Promise<LoginLocationData[]>
   ```

2. **Transform to Marker Format**
   ```typescript
   const markers = loginLocations.map(loc => ({
     name: `${loc.country} (${loc.loginCount} logins)`,
     coords: [loc.latitude, loc.longitude]
   }))
   ```

3. **Create HRM Map Component**
   ```typescript
   // src/app/(admin)/hrm/analytics/LoginLocationMap.tsx
   import WorldVectorMap from '@/components/VectorMap/WorldMap'
   
   export function LoginLocationMap({ markers }) {
     return <WorldVectorMap options={{ ...baseOptions, markers }} />
   }
   ```

---

## Available Map Types

| Map | Import | File |
|-----|--------|------|
| World | `jsvectormap/dist/maps/world.js` | `WorldMap.tsx` |
| Canada | `jsvectormap/dist/maps/canada.js` | `CanadaMap.tsx` |
| Iraq | `jsvectormap/dist/maps/iraq.js` | `IraqVectorMap.tsx` |
| Russia | `jsvectormap/dist/maps/russia.js` | `RussiaMap.tsx` |
| Spain | `jsvectormap/dist/maps/spain.js` | `SpainMap.tsx` |

For SoZaVo (Suriname-based), a South America map could be added if needed.

---

## Screenshot Reference

The demo dashboard shows a world map with colored markers at various locations.
Key visual elements:
- Light gray landmass (#e9ecef)
- Blue markers (#3e60d5) at 6px radius
- Hover state with larger red markers
- Zoom controls in corner
