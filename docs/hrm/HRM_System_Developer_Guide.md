# SoZaVo HRM System — Developer Guide

**Version:** 2.0  
**Last Updated:** 2025-01-09  
**Audience:** Developers, Lovable AI, Contributors

---

## 1. Introduction

This guide establishes the development standards, conventions, and best practices for the SoZaVo HRM System. All code contributions must adhere to these guidelines to maintain consistency, quality, and alignment with the Darkone React template.

---

## 2. Development Environment

### 2.1 Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| Git | Latest |
| VS Code (recommended) | Latest |

### 2.2 Getting Started

```bash
# Clone repository
git clone <repository-url>
cd hrm-system

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 2.3 Environment Variables

Create `.env.local` for local development:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Note:** Never commit `.env.local` to version control.

---

## 3. Repository Structure

### 3.1 Root Directory

```
/
├── docs/                    # Project documentation
│   └── hrm/                 # HRM system docs
├── public/                  # Static assets
├── src/                     # Source code
├── supabase/                # Supabase config & migrations
│   ├── config.toml          # Supabase configuration
│   ├── functions/           # Edge functions
│   └── migrations/          # SQL migrations
├── Darkone-React_v1.0/      # Original template (reference)
├── index.html               # Entry HTML
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

### 3.2 Source Directory Structure

```
src/
├── app/                     # Route-based pages
│   ├── (admin)/             # Admin layout routes
│   │   ├── dashboards/      # Dashboard pages
│   │   ├── hrm/             # HRM module pages
│   │   │   ├── employees/   # Employee management
│   │   │   ├── organization/# Org units & positions
│   │   │   ├── leave/       # Leave management
│   │   │   ├── attendance/  # Attendance tracking
│   │   │   ├── documents/   # Document center
│   │   │   └── reports/     # Reports
│   │   ├── users/           # User management
│   │   ├── settings/        # System settings
│   │   └── audit/           # Audit logs
│   └── (other)/             # Auth & public routes
│       ├── auth/            # Authentication pages
│       └── errors/          # Error pages
├── assets/                  # Static assets
│   ├── scss/                # SCSS stylesheets
│   ├── images/              # Image files
│   └── data/                # Mock data files
├── components/              # Reusable components
│   ├── layout/              # Layout components
│   ├── ui/                  # UI primitives
│   └── hrm/                 # HRM-specific components
├── context/                 # React contexts
├── helpers/                 # Helper functions
├── hooks/                   # Custom React hooks
├── integrations/            # External integrations
│   └── supabase/            # Supabase client
├── layouts/                 # Page layouts
├── routes/                  # Route configuration
├── schemas/                 # Zod validation schemas
├── services/                # API service layer
├── types/                   # TypeScript types
│   └── hrm/                 # HRM-specific types
└── utils/                   # Utility functions
```

---

## 4. Naming Conventions

### 4.1 Files and Directories

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `EmployeeList.tsx` |
| Pages | `page.tsx` | `app/hrm/employees/page.tsx` |
| Hooks | camelCase with `use` prefix | `useEmployees.ts` |
| Services | PascalCase with `Service` suffix | `EmployeeService.ts` |
| Types | PascalCase | `Employee.ts` |
| Utils | camelCase | `formatDate.ts` |
| Schemas | camelCase with `Schema` suffix | `employeeSchema.ts` |
| SCSS | kebab-case | `_employee-list.scss` |

### 4.2 Variables and Functions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `employeeList` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Functions | camelCase | `getEmployees()` |
| React Components | PascalCase | `EmployeeCard` |
| Event Handlers | camelCase with `handle` prefix | `handleSubmit` |
| Boolean | camelCase with `is/has/should` prefix | `isLoading`, `hasError` |

### 4.3 Database Tables and Columns

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case with `hrm_` prefix | `hrm_employees` |
| Columns | snake_case | `first_name`, `org_unit_id` |
| Primary Keys | `id` | `id` |
| Foreign Keys | `{table}_id` | `employee_id`, `org_unit_id` |
| Timestamps | `created_at`, `updated_at` | `created_at` |
| Booleans | `is_` prefix | `is_active` |

### 4.4 TypeScript Types

```typescript
// Interfaces for objects with behavior
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

// Types for unions or simple data
type EmployeeStatus = 'active' | 'inactive' | 'terminated';

// Input types
interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
}

// Response types
interface PaginatedResult<T> {
  data: T[];
  total: number;
}
```

---

## 5. UI Development Rules

### 5.1 Darkone Template Fidelity

**CRITICAL RULE:** All UI must maintain 1:1 fidelity with the Darkone React template.

#### Do:
- ✅ Use existing Darkone components
- ✅ Follow Darkone's SCSS styling patterns
- ✅ Maintain consistent spacing and typography
- ✅ Use Darkone's color variables
- ✅ Reference the `Darkone-React_v1.0/` directory for patterns

#### Don't:
- ❌ Create custom CSS that conflicts with Darkone
- ❌ Modify core Darkone components
- ❌ Use different UI libraries (no Material UI, Ant Design, etc.)
- ❌ Override Bootstrap variables arbitrarily
- ❌ Create layouts that deviate from template patterns

### 5.2 Component Usage Guidelines

| Use Case | Darkone Component |
|----------|-------------------|
| Data display tables | DataTable component |
| Forms | React Bootstrap Form |
| Modals | React Bootstrap Modal |
| Cards | Darkone Card component |
| Navigation | Darkone Sidebar/Header |
| Buttons | Darkone Button variants |
| Inputs | Darkone Form Controls |
| Select dropdowns | React Select (styled) |
| Date pickers | Flatpickr |
| Charts | ApexCharts |
| Icons | Iconify React |
| Toasts | React Toastify |

### 5.3 Layout Patterns

**Page Layout:**
```tsx
const EmployeeListPage = () => {
  return (
    <>
      {/* Page Title */}
      <PageTitle title="Employees" />
      
      {/* Main Content */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h4 className="card-title">Employee List</h4>
              <Button variant="primary">Add Employee</Button>
            </Card.Header>
            <Card.Body>
              {/* Content here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
```

**Form Modal Pattern:**
```tsx
const CreateEmployeeModal = ({ show, onHide }: ModalProps) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Form fields */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
```

### 5.4 Styling Rules

**Use SCSS Variables:**
```scss
// ✅ Correct
.employee-card {
  background-color: var(--#{$prefix}card-bg);
  border-color: var(--#{$prefix}border-color);
}

// ❌ Incorrect
.employee-card {
  background-color: #ffffff;
  border-color: #e0e0e0;
}
```

**Component-Scoped Styles:**
```tsx
// Create component-specific SCSS file
// src/components/hrm/EmployeeCard/_employee-card.scss

// Import in component
import './_employee-card.scss';
```

---

## 6. State Management

### 6.1 React Query for Server State

```typescript
// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['employees', filters],
  queryFn: () => EmployeeService.getAll(filters),
});

// Mutations
const mutation = useMutation({
  mutationFn: EmployeeService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    toast.success('Employee created');
  },
});
```

### 6.2 React Context for App State

```typescript
// AuthContext for authentication state
const { user, role, isLoading, signOut } = useAuth();

// LayoutContext for UI state
const { sidebarOpen, toggleSidebar } = useLayout();
```

### 6.3 Local State with useState

```typescript
// Component-local state only
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

---

## 7. Service Layer Patterns

### 7.1 Service Structure

```typescript
// src/services/EmployeeService.ts

import { supabase } from '@/integrations/supabase/client';
import type { Employee, CreateEmployeeInput } from '@/types/hrm';

export const EmployeeService = {
  async getAll(filters?: EmployeeFilters): Promise<PaginatedResult<Employee>> {
    // Implementation
  },

  async getById(id: string): Promise<Employee> {
    // Implementation
  },

  async create(input: CreateEmployeeInput): Promise<Employee> {
    // Implementation
  },

  async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
    // Implementation
  },

  async delete(id: string): Promise<void> {
    // Implementation
  },
};
```

### 7.2 Error Handling

```typescript
async getById(id: string): Promise<Employee> {
  const { data, error } = await supabase
    .from('hrm_employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    throw new HRMError('DATABASE_ERROR', 'Failed to fetch employee', { id });
  }

  return data;
}
```

### 7.3 Audit Logging

```typescript
// Always log audit events for write operations
async create(input: CreateEmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from('hrm_employees')
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  // Log audit event
  await AuditService.log('employee', data.id, 'CREATE', { after: data });

  return data;
}
```

---

## 8. TypeScript Guidelines

### 8.1 Strict Mode

TypeScript strict mode is enabled. All code must pass strict type checking.

### 8.2 Type Definitions

**Location:** `src/types/hrm/`

```typescript
// src/types/hrm/employee.ts

export interface Employee {
  id: string;
  employee_no: string;
  first_name: string;
  last_name: string;
  email?: string;
  status: EmployeeStatus;
  org_unit_id?: string;
  position_id?: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
  
  // Expanded relations
  organization_unit?: OrgUnit;
  position?: Position;
}

export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';

export interface CreateEmployeeInput {
  employee_no: string;
  first_name: string;
  last_name: string;
  email?: string;
  org_unit_id?: string;
  position_id?: string;
  employment_type: 'permanent' | 'contract' | 'temporary';
  hire_date: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {}

export interface EmployeeFilters {
  status?: EmployeeStatus;
  orgUnitId?: string;
  positionId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
```

### 8.3 Avoid `any`

```typescript
// ❌ Bad
const handleData = (data: any) => { ... };

// ✅ Good
const handleData = (data: Employee) => { ... };

// ✅ When type is truly unknown
const handleData = (data: unknown) => {
  if (isEmployee(data)) {
    // data is now Employee
  }
};
```

---

## 9. Form Handling

### 9.1 React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema, type CreateEmployeeInput } from '@/schemas/employee';

const EmployeeForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
  });

  const onSubmit = async (data: CreateEmployeeInput) => {
    await EmployeeService.create(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group>
        <Form.Label>First Name</Form.Label>
        <Form.Control
          {...register('first_name')}
          isInvalid={!!errors.first_name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.first_name?.message}
        </Form.Control.Feedback>
      </Form.Group>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </Form>
  );
};
```

### 9.2 Validation Schema

```typescript
// src/schemas/employee.ts
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employee_no: z.string().min(1, 'Employee number is required'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  hire_date: z.string().min(1, 'Hire date is required'),
  employment_type: z.enum(['permanent', 'contract', 'temporary']),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
```

---

## 10. Security Guidelines

### 10.1 Authentication

- Always use Supabase Auth for authentication
- Never store tokens in localStorage (use Supabase's built-in session handling)
- Implement proper session refresh

### 10.2 Authorization

- **CRITICAL:** Roles must be in separate `user_roles` table
- Use `has_role()` security definer function for RLS
- Never trust client-side role checks for sensitive operations

### 10.3 Data Access

- All sensitive operations must have RLS policies
- Never expose API keys in frontend code
- Use environment variables for configuration

### 10.4 Input Validation

- Always validate input on both client and server (RLS)
- Use Zod schemas for form validation
- Sanitize user input before display

---

## 11. Testing Strategy

### 11.1 Manual Testing Checklist

Before submitting code:

- [ ] All forms validate correctly
- [ ] Error states display properly
- [ ] Loading states show during data fetching
- [ ] Empty states display when no data
- [ ] Pagination works correctly
- [ ] Search/filter functions work
- [ ] CRUD operations complete successfully
- [ ] Toast notifications appear correctly
- [ ] Responsive design works on mobile
- [ ] No console errors

### 11.2 RLS Policy Testing

```sql
-- Test as specific user
SET request.jwt.claims = '{"sub": "user-uuid", "email": "test@example.com"}';

-- Attempt to access data
SELECT * FROM hrm_employees;

-- Reset
RESET request.jwt.claims;
```

---

## 12. Git Workflow

### 12.1 Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/employee-list` |
| Bugfix | `fix/description` | `fix/leave-validation` |
| Hotfix | `hotfix/description` | `hotfix/auth-redirect` |

### 12.2 Commit Messages

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(employees): add employee list page with filters
fix(auth): resolve redirect loop on sign-in
docs(api): update API specification
chore(deps): upgrade react-query to v5
```

### 12.3 Pull Request Guidelines

- Clear title following commit convention
- Description of changes
- Screenshots for UI changes
- Testing notes
- Link to related issues

---

## 13. Performance Guidelines

### 13.1 Data Fetching

- Use pagination for large datasets (default: 20 items)
- Implement search debouncing (300ms)
- Use React Query caching (stale time: 5 min)

### 13.2 Component Optimization

```typescript
// Use React.memo for expensive components
const EmployeeCard = React.memo(({ employee }: Props) => {
  // ...
});

// Use useCallback for handlers passed to children
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);

// Use useMemo for expensive computations
const sortedEmployees = useMemo(() => {
  return [...employees].sort((a, b) => a.lastName.localeCompare(b.lastName));
}, [employees]);
```

### 13.3 Lazy Loading

```typescript
// Lazy load route components
const EmployeesPage = lazy(() => import('@/app/(admin)/hrm/employees/page'));

// Use Suspense boundary
<Suspense fallback={<FallbackLoading />}>
  <EmployeesPage />
</Suspense>
```

---

## 14. Accessibility

### 14.1 Requirements

- All interactive elements must be keyboard accessible
- Form inputs must have associated labels
- Images must have alt text
- Color contrast must meet WCAG AA standards
- Focus states must be visible

### 14.2 Implementation

```tsx
// Accessible form input
<Form.Group controlId="firstName">
  <Form.Label>First Name</Form.Label>
  <Form.Control
    type="text"
    aria-describedby="firstNameHelp"
    aria-invalid={!!errors.firstName}
  />
  <Form.Text id="firstNameHelp">
    Enter the employee's legal first name
  </Form.Text>
</Form.Group>

// Accessible button
<Button
  onClick={handleDelete}
  aria-label="Delete employee John Doe"
  disabled={isDeleting}
>
  <Icon icon="mdi:delete" />
</Button>
```

---

## 15. Troubleshooting

### 15.1 Common Issues

| Issue | Solution |
|-------|----------|
| RLS policy blocking access | Check user role in `user_roles` table |
| Component not rendering | Check lazy loading Suspense boundary |
| Form not submitting | Check Zod validation errors |
| Data not updating | Invalidate React Query cache |
| Auth redirect loop | Check `onAuthStateChange` implementation |

### 15.2 Debugging Tools

- Browser DevTools (Console, Network)
- React DevTools
- React Query DevTools
- Supabase Dashboard (SQL editor, logs)

---

## 16. Resources

### 16.1 Documentation

- [Darkone Template Docs](./Darkone-React_v1.0/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

### 16.2 Project Documentation

- `docs/hrm/HRM_System_Master_Architecture.md`
- `docs/hrm/HRM_System_Database_Specification.md`
- `docs/hrm/HRM_System_Module_Designs.md`
- `docs/hrm/HRM_System_Implementation_Roadmap_v2.md`
- `docs/hrm/HRM_System_API_Spec_v2.md`

---

**End of Developer Guide**
