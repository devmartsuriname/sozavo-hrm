# Tables Reference

> **Source Path:** `src/app/(admin)/tables/`  
> **Demo Routes:** `/tables/*`

---

## Available Table Implementations

| Type | Route | Library | HRM Reuse |
|------|-------|---------|-----------|
| Basic Tables | `/tables/basic` | react-bootstrap `Table` | ✅ Simple lists |
| Grid JS | `/tables/gridjs` | gridjs-react | ✅ Advanced grids |

---

## 1. Basic Bootstrap Tables

**Component:** `react-bootstrap` Table

```tsx
import { Table } from 'react-bootstrap'

<Table className="table-centered mb-0">
  <thead className="bg-light bg-opacity-50">
    <tr>
      <th>Employee Code</th>
      <th>Name</th>
      <th>Department</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {employees.map(emp => (
      <tr key={emp.id}>
        <td>{emp.employee_code}</td>
        <td>
          <div className="d-flex align-items-center">
            <div className="avatar-sm me-2">
              <span className="avatar-title bg-soft-primary rounded-circle">
                {emp.initials}
              </span>
            </div>
            {emp.fullName}
          </div>
        </td>
        <td>{emp.orgUnitName}</td>
        <td>
          <Badge className={`badge-soft-${getStatusColor(emp.status)}`}>
            {emp.status}
          </Badge>
        </td>
        <td>
          <Button size="sm" variant="soft-primary">View</Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

### Table Variants

| Class | Description |
|-------|-------------|
| `table-striped` | Alternating row colors |
| `table-bordered` | Cell borders |
| `table-hover` | Hover effect on rows |
| `table-sm` | Compact spacing |
| `table-centered` | Vertically centered cells |

---

## 2. Grid JS Tables

**Dependency:** `gridjs-react`

```tsx
import { Grid } from 'gridjs-react'
import 'gridjs/dist/theme/mermaid.css'

<Grid
  data={employees.map(emp => [
    emp.employee_code,
    emp.fullName,
    emp.orgUnitName,
    emp.status
  ])}
  columns={['Code', 'Name', 'Department', 'Status']}
  search={true}
  sort={true}
  pagination={{
    limit: 10,
    summary: true
  }}
  className={{
    table: 'table table-hover'
  }}
/>
```

### Grid JS Features

| Feature | Property | Description |
|---------|----------|-------------|
| Search | `search={true}` | Client-side filtering |
| Sort | `sort={true}` | Column sorting |
| Pagination | `pagination={{ limit: 10 }}` | Paged results |
| Server-side | `server={{ url: '...' }}` | API data source |

---

## HRM Table Implementations (Already Built)

| Page | Table Type | Features |
|------|------------|----------|
| Employee Directory | Basic Table | Avatars, badges, sorting, search |
| Organization Units | Basic Table | Active badges, parent unit |
| Positions | Basic Table | Org unit lookup |
| Users & Roles | Basic Table | Role badges, employee linking |

---

## Table Patterns in HRM

### Avatar Column

```tsx
<td>
  <div className="d-flex align-items-center">
    <div 
      className="avatar-sm rounded-circle bg-soft-primary d-flex align-items-center justify-content-center me-2"
      aria-label={fullName}
    >
      <span className="fw-medium text-primary">
        {getInitials(fullName)}
      </span>
    </div>
    <span>{fullName}</span>
  </div>
</td>
```

### Status Badge Column

```tsx
<td>
  <Badge className={`badge-soft-${emp.is_active ? 'success' : 'secondary'}`}>
    {emp.is_active ? 'Active' : 'Inactive'}
  </Badge>
</td>
```

### Action Buttons Column

```tsx
<td>
  <Link to={`/hrm/employees/${emp.id}`}>
    <Button size="sm" variant="soft-primary" className="me-1">
      View
    </Button>
  </Link>
  {canEdit && (
    <Link to={`/hrm/employees/${emp.id}/edit`}>
      <Button size="sm" variant="soft-warning">
        Edit
      </Button>
    </Link>
  )}
</td>
```
