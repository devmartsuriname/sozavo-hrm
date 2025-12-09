# Darkone Component Registry

**Version:** 1.0  
**Last Updated:** 2025-01-09  
**Purpose:** Canonical reference for building HRM pages with Darkone components

---

## 1. Overview

This registry documents all reusable Darkone components available for HRM development. Use these components to ensure visual consistency with the template.

---

## 2. Layout Components

### 2.1 AdminLayout

**Path:** `src/layouts/AdminLayout.tsx`

**Purpose:** Main wrapper for all admin pages. Provides sidebar, topbar, footer, and animated stars.

**Usage:**
```tsx
// Automatically applied via routing - do not import directly
// All routes under (admin) use this layout
```

**Structure:**
```
┌─────────────────────────────────────────────────┐
│                  TopNavigationBar               │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Vertical │           page-content               │
│   Nav    │     ┌─────────────────────────┐      │
│   Bar    │     │   Container (fluid)     │      │
│          │     │     {children}          │      │
│          │     └─────────────────────────┘      │
│          │              Footer                  │
└──────────┴──────────────────────────────────────┘
```

---

### 2.2 AuthLayout

**Path:** `src/layouts/AuthLayout.tsx`

**Purpose:** Wrapper for authentication pages (login, signup, reset password).

**Usage:**
```tsx
// Automatically applied via routing
// Routes under (other)/auth use this layout
```

---

### 2.3 TopNavigationBar

**Path:** `src/components/layout/TopNavigationBar/page.tsx`

**Purpose:** Top header with logo, search, notifications, user profile dropdown.

**Note:** Do not modify. Loaded lazily by `AdminLayout`.

---

### 2.4 VerticalNavigationBar

**Path:** `src/components/layout/VerticalNavigationBar/page.tsx`

**Purpose:** Left sidebar with menu items. Reads from `menu-items.ts`.

**To add menu items:** Edit `src/assets/data/menu-items.ts`

---

### 2.5 Footer

**Path:** `src/components/layout/Footer.tsx`

**Purpose:** Page footer with copyright and version info.

---

## 3. Page Shell Components

### 3.1 PageTitle

**Path:** `src/components/PageTitle.tsx`

**Purpose:** Page header with title and breadcrumb navigation.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title (displayed and in document title) |
| `subName` | `string` | Parent section name for breadcrumb |

**Usage:**
```tsx
import PageTitle from '@/components/PageTitle'

const EmployeesPage = () => {
  return (
    <>
      <PageTitle title="Employees" subName="HRM" />
      {/* Page content */}
    </>
  )
}
```

---

### 3.2 ComponentContainerCard

**Path:** `src/components/ComponentContainerCard.tsx`

**Purpose:** Card wrapper with title, optional description, and anchor link.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title |
| `id` | `string` | Anchor ID |
| `description` | `ReactNode` | Optional description below title |
| `titleClass` | `string` | Optional title CSS class |
| `descriptionClass` | `string` | Optional description CSS class |
| `children` | `ReactNode` | Card body content |

**Usage:**
```tsx
import ComponentContainerCard from '@/components/ComponentContainerCard'

<ComponentContainerCard 
  title="Employee List" 
  id="employee-list"
  description="Active employees in the organization"
>
  {/* Table or content here */}
</ComponentContainerCard>
```

---

### 3.3 FallbackLoading

**Path:** `src/components/FallbackLoading.tsx`

**Purpose:** Loading placeholder for lazy-loaded components.

**Usage:**
```tsx
import FallbackLoading from '@/components/FallbackLoading'

<Suspense fallback={<FallbackLoading />}>
  <LazyComponent />
</Suspense>
```

---

### 3.4 Preloader

**Path:** `src/components/Preloader.tsx`

**Purpose:** Initial page load spinner.

---

### 3.5 Spinner

**Path:** `src/components/Spinner.tsx`

**Purpose:** Inline loading spinner component.

---

## 4. Form Input Components

### 4.1 TextFormInput

**Path:** `src/components/from/TextFormInput.tsx`

**Purpose:** Text input with react-hook-form integration and validation.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Field name |
| `control` | `Control` | react-hook-form control |
| `label` | `string \| ReactNode` | Input label |
| `id` | `string` | Input ID |
| `containerClassName` | `string` | Wrapper class |
| `labelClassName` | `string` | Label class |
| `noValidate` | `boolean` | Disable validation display |
| `...other` | `InputHTMLAttributes` | Standard input props |

**Usage:**
```tsx
import { useForm } from 'react-hook-form'
import TextFormInput from '@/components/from/TextFormInput'

const { control, handleSubmit } = useForm()

<TextFormInput
  name="first_name"
  control={control}
  label="First Name"
  placeholder="Enter first name"
  containerClassName="mb-3"
/>
```

---

### 4.2 PasswordFormInput

**Path:** `src/components/from/PasswordFormInput.tsx`

**Purpose:** Password input with visibility toggle.

**Usage:**
```tsx
import PasswordFormInput from '@/components/from/PasswordFormInput'

<PasswordFormInput
  name="password"
  control={control}
  label="Password"
  placeholder="Enter password"
  containerClassName="mb-3"
/>
```

---

### 4.3 TextAreaFormInput

**Path:** `src/components/from/TextAreaFormInput.tsx`

**Purpose:** Textarea with react-hook-form integration.

---

### 4.4 DropzoneFormInput

**Path:** `src/components/from/DropzoneFormInput.tsx`

**Purpose:** Drag-and-drop file upload zone.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Zone label |
| `text` | `string` | Drop zone text |
| `showPreview` | `boolean` | Show file previews |
| `onFileUpload` | `function` | Callback on file select |
| `iconProps` | `object` | Icon configuration |
| `className` | `string` | Additional classes |

**Usage:**
```tsx
import DropzoneFormInput from '@/components/from/DropzoneFormInput'

<DropzoneFormInput
  label="Upload Documents"
  text="Drop files here or click to upload"
  showPreview={true}
  onFileUpload={(files) => handleFiles(files)}
/>
```

---

### 4.5 ChoicesFormInput

**Path:** `src/components/from/ChoicesFormInput.tsx`

**Purpose:** Choices.js powered select dropdown.

---

## 5. UI Wrapper Components

### 5.1 IconifyIcon

**Path:** `src/components/wrapper/IconifyIcon.tsx`

**Purpose:** Iconify icon wrapper for consistent icon rendering.

**Usage:**
```tsx
import IconifyIcon from '@/components/wrapper/IconifyIcon'

<IconifyIcon icon="mingcute:user-4-line" height={24} width={24} />
```

**Icon Sources:**
- `mingcute:*` — Primary icon set used by Darkone
- `bx:*` — BoxIcons
- `bi:*` — Bootstrap Icons

---

## 6. Chart Components

### 6.1 ApexCharts Integration

**Path:** Various in `src/app/(admin)/dashboards/components/`

**Purpose:** Chart widgets using react-apexcharts.

**Usage Pattern:**
```tsx
import ReactApexChart from 'react-apexcharts'

<ReactApexChart
  options={chartOptions}
  series={chartSeries}
  type="area"
  height={350}
/>
```

---

## 7. Table Patterns

### 7.1 Bootstrap Table

**Usage:**
```tsx
import { Table } from 'react-bootstrap'

<Table responsive className="table-centered mb-0">
  <thead className="table-light">
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {employees.map((employee) => (
      <tr key={employee.id}>
        <td>{employee.name}</td>
        <td>{employee.email}</td>
        <td>
          <Badge bg={employee.status === 'active' ? 'success' : 'danger'}>
            {employee.status}
          </Badge>
        </td>
        <td>
          <Button variant="soft-primary" size="sm">Edit</Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

### 7.2 Grid.js Table

**Usage:**
```tsx
import { Grid } from 'gridjs-react'

<Grid
  data={employees}
  columns={['Name', 'Email', 'Status']}
  pagination={{ limit: 10 }}
  search={true}
  sort={true}
/>
```

---

## 8. Modal Pattern

**Usage:**
```tsx
import { Modal, Button } from 'react-bootstrap'

const [show, setShow] = useState(false)

<Modal show={show} onHide={() => setShow(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Create Employee</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Form content */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShow(false)}>
      Cancel
    </Button>
    <Button variant="primary" type="submit">
      Save
    </Button>
  </Modal.Footer>
</Modal>
```

---

## 9. Card Pattern

**Usage:**
```tsx
import { Card, CardBody, CardTitle } from 'react-bootstrap'

<Card>
  <CardBody>
    <CardTitle as="h5" className="mb-3">
      Employee Information
    </CardTitle>
    {/* Card content */}
  </CardBody>
</Card>
```

---

## 10. Button Variants

Available button variants in Darkone:

| Variant | Class | Usage |
|---------|-------|-------|
| Primary | `btn-primary` | Main actions |
| Secondary | `btn-secondary` | Secondary actions |
| Success | `btn-success` | Confirmations |
| Danger | `btn-danger` | Destructive actions |
| Warning | `btn-warning` | Caution actions |
| Info | `btn-info` | Informational |
| Light | `btn-light` | Light background |
| Dark | `btn-dark` | Dark background |
| Soft variants | `btn-soft-primary` | Subtle appearance |
| Outline | `btn-outline-primary` | Border only |

**Usage:**
```tsx
import { Button } from 'react-bootstrap'

<Button variant="primary">Save</Button>
<Button variant="soft-danger">Delete</Button>
<Button variant="outline-secondary">Cancel</Button>
```

---

## 11. Badge Variants

**Usage:**
```tsx
import { Badge } from 'react-bootstrap'

<Badge bg="success">Active</Badge>
<Badge bg="danger">Inactive</Badge>
<Badge bg="warning" text="dark">Pending</Badge>
<Badge className="badge-soft-primary">Soft Badge</Badge>
```

---

## 12. Alert Pattern

**Usage:**
```tsx
import { Alert } from 'react-bootstrap'

<Alert variant="success">
  Employee created successfully!
</Alert>

<Alert variant="danger" dismissible onClose={() => setShowAlert(false)}>
  An error occurred. Please try again.
</Alert>
```

---

## 13. How to Build HRM Pages (100% Darkone)

### 13.1 Page Template

```tsx
import { Row, Col, Card, CardBody, CardTitle, Button } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'

const HRMPage = () => {
  return (
    <>
      {/* 1. Page Title with Breadcrumb */}
      <PageTitle title="Employees" subName="HRM" />

      {/* 2. Main Content Row */}
      <Row>
        <Col xs={12}>
          {/* 3. Card Container */}
          <Card>
            <CardBody>
              {/* 4. Card Header with Title and Actions */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle as="h5" className="mb-0">
                  Employee List
                </CardTitle>
                <Button variant="primary">
                  <IconifyIcon icon="mingcute:add-line" className="me-1" />
                  Add Employee
                </Button>
              </div>

              {/* 5. Content (Table, Form, etc.) */}
              <Table responsive className="table-centered mb-0">
                {/* Table content */}
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default HRMPage
```

### 13.2 Spacing Rules

| Element | Class | Value |
|---------|-------|-------|
| Section gap | `mb-4` | 1.5rem |
| Card body padding | (default) | 1.25rem |
| Form field gap | `mb-3` | 1rem |
| Button gap | `gap-2` | 0.5rem |
| Table cell padding | (default) | 0.75rem |

### 13.3 Typography

| Element | Class | Usage |
|---------|-------|-------|
| Page title | `h4` | PageTitle component |
| Card title | `h5` | CardTitle |
| Section heading | `h6` | Sub-sections |
| Body text | (default) | Content |
| Muted text | `text-muted` | Secondary info |
| Small text | `small` or `fs-sm` | Captions |

### 13.4 Colors (CSS Variables)

Use Bootstrap/Darkone CSS variables:

```scss
var(--bs-primary)      // Primary blue
var(--bs-success)      // Green
var(--bs-danger)       // Red
var(--bs-warning)      // Yellow
var(--bs-info)         // Cyan
var(--bs-body-bg)      // Background
var(--bs-body-color)   // Text color
var(--bs-border-color) // Border color
```

---

## 14. Navigation Menu Structure

To add HRM menu items, edit `src/assets/data/menu-items.ts`:

```typescript
// Add after existing menu items, before 'OTHER' title

{
  key: 'hrm-menu',
  label: 'HRM...',
  isTitle: true,
},
{
  key: 'hrm-dashboard',
  label: 'HRM Dashboard',
  icon: 'mingcute:dashboard-line',
  url: '/hrm/dashboard',
},
{
  key: 'hrm-employees',
  label: 'Employees',
  icon: 'mingcute:user-4-line',
  url: '/hrm/employees',
},
{
  key: 'hrm-organization',
  label: 'Organization',
  icon: 'mingcute:building-line',
  children: [
    {
      key: 'hrm-org-units',
      label: 'Units',
      url: '/hrm/organization/units',
      parentKey: 'hrm-organization',
    },
    {
      key: 'hrm-positions',
      label: 'Positions',
      url: '/hrm/organization/positions',
      parentKey: 'hrm-organization',
    },
  ],
},
{
  key: 'hrm-leave',
  label: 'Leave Management',
  icon: 'mingcute:calendar-line',
  url: '/hrm/leave',
},
{
  key: 'hrm-attendance',
  label: 'Attendance',
  icon: 'mingcute:time-line',
  url: '/hrm/attendance',
},
```

---

## 15. Quick Reference

| Need | Use |
|------|-----|
| Page wrapper | `AdminLayout` (automatic via routing) |
| Page title | `<PageTitle title="..." subName="..." />` |
| Card container | `<Card><CardBody>...</CardBody></Card>` |
| Form inputs | `TextFormInput`, `PasswordFormInput`, etc. |
| Icons | `<IconifyIcon icon="mingcute:..." />` |
| Tables | `<Table responsive>` or Grid.js |
| Modals | `<Modal>` from react-bootstrap |
| Buttons | `<Button variant="...">` |
| Badges | `<Badge bg="...">` |
| Alerts | `<Alert variant="...">` |

---

**End of Component Registry**
