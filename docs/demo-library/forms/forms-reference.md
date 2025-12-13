# Forms Reference

> **Source Path:** `src/app/(admin)/forms/`  
> **Demo Routes:** `/forms/*`

---

## Available Form Modules

| Module | Route | Key Components | HRM Reuse |
|--------|-------|----------------|-----------|
| Basic Elements | `/forms/basic` | Input, Select, Checkbox, Radio, Switch | ✅ Employee forms |
| Flatpicker | `/forms/flatpicker` | Date/Time pickers | ✅ Leave dates, Hire dates |
| Validation | `/forms/validation` | Form validation patterns | ✅ All forms |
| File Uploads | `/forms/fileuploads` | Dropzone, File input | ✅ Document uploads |
| Editors | `/forms/editors` | ReactQuill (Quill.js) | ⚠️ Notes/comments only |

---

## Key Components

### Text Inputs (`TextFormInput`)

```tsx
import { TextFormInput } from '@/components/form'

<TextFormInput
  name="firstName"
  label="First Name"
  placeholder="Enter first name"
  control={control}
  required
/>
```

### Password Input (`PasswordFormInput`)

```tsx
import { PasswordFormInput } from '@/components/form'

<PasswordFormInput
  name="password"
  label="Password"
  control={control}
/>
```

### Dropzone (`DropzoneFormInput`)

```tsx
import { DropzoneFormInput } from '@/components/form'

<DropzoneFormInput
  name="documents"
  label="Upload Files"
  control={control}
  accept={{ 'application/pdf': ['.pdf'] }}
/>
```

### React Select (`ChoicesFormInput`)

```tsx
import { ChoicesFormInput } from '@/components/form'

<ChoicesFormInput
  name="department"
  label="Department"
  control={control}
  options={departmentOptions}
/>
```

---

## Flatpickr Date Picker

**Dependency:** `react-flatpickr`

```tsx
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css'

<Flatpickr
  className="form-control"
  value={hireDate}
  onChange={(dates) => setHireDate(dates[0])}
  options={{
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'F j, Y'
  }}
/>
```

---

## Form Validation Pattern

```tsx
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  hireDate: yup.date().required('Hire date is required')
})

function EmployeeForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })
  
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextFormInput name="firstName" control={control} />
      {errors.firstName && <span className="text-danger">{errors.firstName.message}</span>}
    </Form>
  )
}
```

---

## HRM Form Components (Already Implemented)

| Component | Location | Status |
|-----------|----------|--------|
| `EmployeeFormBase` | `src/components/hrm/EmployeeFormBase.tsx` | ✅ Complete |
| Employee Create | `src/app/(admin)/hrm/employees/EmployeeCreatePage.tsx` | ✅ Complete |
| Employee Edit | `src/app/(admin)/hrm/employees/EmployeeEditPage.tsx` | ✅ Complete |
