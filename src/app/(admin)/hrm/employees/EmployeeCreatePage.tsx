/**
 * HRM Employee Create Page
 * Allows Admin and HR Manager to create new employee records.
 * Uses shared EmployeeFormBase component.
 */

import { useNavigate } from 'react-router-dom'
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { useCreateEmployee, type EmployeeCreateFormData } from '@/hooks/useCreateEmployee'
import { useEmployeeFormOptions } from '@/hooks/useEmployeeFormOptions'
import EmployeeFormBase, { type EmployeeFormData } from '@/components/hrm/EmployeeFormBase'
import type { EmploymentStatusType } from '@/types/hrm'

/** Default form values for new employee */
const getDefaultFormData = (): EmployeeFormData => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: null,
  org_unit_id: null,
  position_id: null,
  manager_id: null,
  employment_status: 'active' as EmploymentStatusType,
  hire_date: new Date().toISOString().split('T')[0], // Today
  termination_date: null,
  is_active: true,
})

const EmployeeCreatePage = () => {
  const navigate = useNavigate()
  const { isAdmin, isHRManager, status } = useSupabaseAuth()

  // Data hooks
  const { create, isLoading: isCreating, error: createError } = useCreateEmployee()
  const { orgUnits, positions, employees, isLoading: isLoadingOptions } = useEmployeeFormOptions()

  // Check access: only Admin and HR Manager can create
  const canCreate = isAdmin || isHRManager

  // Handle form submission
  const handleSubmit = async (formData: EmployeeFormData) => {
    // Validate required fields for create (org_unit_id and position_id)
    if (!formData.org_unit_id || !formData.position_id) {
      return
    }

    const createData: EmployeeCreateFormData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      org_unit_id: formData.org_unit_id,
      position_id: formData.position_id,
      manager_id: formData.manager_id,
      employment_status: formData.employment_status,
      hire_date: formData.hire_date,
      termination_date: formData.termination_date,
      is_active: formData.is_active,
    }

    const result = await create(createData)

    if (result) {
      toast.success('Employee created successfully')
      navigate(`/hrm/employees/${result.id}`)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    navigate('/hrm/employees')
  }

  // Hard guard for role-based access
  if (status === 'authenticated' && !canCreate) {
    return (
      <>
        <PageTitle title="Access denied" subName="HRM" />
        <Alert variant="warning" className="mt-3">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          You do not have permission to create employee records. If you believe this is an error, please contact the system administrator.
        </Alert>
        <Button variant="secondary" className="mt-2" onClick={() => navigate('/hrm/employees')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Employee Directory
        </Button>
      </>
    )
  }

  // Loading options
  if (isLoadingOptions) {
    return (
      <>
        <PageTitle title="Create Employee" subName="HRM" />
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Create Employee" subName="HRM" />

      <EmployeeFormBase
        mode="create"
        initialData={getDefaultFormData()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isCreating}
        submitError={createError}
        orgUnits={orgUnits}
        positions={positions}
        employees={employees}
      />
    </>
  )
}

export default EmployeeCreatePage
