/**
 * HRM Employee Edit Page
 * Thin wrapper around EmployeeFormBase for edit mode.
 * Responsibilities: Access control, data fetching, submit handling, navigation.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { useHrmEmployeeDetail } from '@/hooks/useHrmEmployeeDetail'
import { useUpdateEmployee } from '@/hooks/useUpdateEmployee'
import { useEmployeeFormOptions } from '@/hooks/useEmployeeFormOptions'
import EmployeeFormBase, { type EmployeeFormData } from '@/components/hrm/EmployeeFormBase'
import type { EmploymentStatusType } from '@/types/hrm'

const EmployeeEditPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const { isAdmin, isHRManager, status } = useSupabaseAuth()

  // Data hooks
  const { employee, isLoading: isLoadingEmployee, error: employeeError } = useHrmEmployeeDetail(employeeId || '')
  const { updateEmployee, isLoading: isUpdating, error: updateError } = useUpdateEmployee(employeeId || '')
  const { orgUnits, positions, employees, isLoading: isLoadingOptions } = useEmployeeFormOptions()

  // Access control check (EARLY - before loading states)
  const canEdit = isAdmin || isHRManager

  if (status === 'authenticated' && !canEdit) {
    return (
      <>
        <PageTitle title="Access denied" subName="HRM" />
        <Alert variant="warning" className="mt-3">
          You do not have permission to edit employee records. If you believe this is an error, please contact the system administrator.
        </Alert>
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => navigate('/hrm/employees')}
        >
          Back to Employee Directory
        </Button>
      </>
    )
  }

  // Loading state
  if (isLoadingEmployee || isLoadingOptions) {
    return (
      <>
        <PageTitle title="Edit Employee" subName="HRM" />
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </>
    )
  }

  // Error loading employee
  if (employeeError) {
    return (
      <>
        <PageTitle title="Edit Employee" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {employeeError}
            </Alert>
            <Button variant="secondary" onClick={() => navigate('/hrm/employees')}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Directory
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  // Not found
  if (!employee) {
    return (
      <>
        <PageTitle title="Edit Employee" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <Icon icon="mdi:information-outline" className="me-2" width={20} />
              Employee not found or you do not have access to this record.
            </Alert>
            <Button variant="secondary" onClick={() => navigate('/hrm/employees')}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Directory
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  // Map fetched employee data to form data format
  const initialFormData: EmployeeFormData = {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone,
    org_unit_id: employee.org_unit_id,
    position_id: employee.position_id,
    manager_id: employee.manager_id,
    employment_status: employee.employment_status as EmploymentStatusType,
    hire_date: employee.hire_date,
    termination_date: employee.termination_date,
    is_active: employee.is_active,
  }

  // Submit handler
  const handleSubmit = async (formData: EmployeeFormData) => {
    const result = await updateEmployee(formData)
    if (result) {
      toast.success('Employee updated successfully')
      navigate(`/hrm/employees/${employeeId}`)
    }
  }

  // Cancel handler
  const handleCancel = () => {
    navigate(`/hrm/employees/${employeeId}`)
  }

  return (
    <>
      <PageTitle title="Edit Employee" subName="HRM" />
      <EmployeeFormBase
        mode="edit"
        initialData={initialFormData}
        employeeCode={employee.employee_code}
        currentEmployeeId={employeeId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isUpdating}
        submitError={updateError}
        orgUnits={orgUnits}
        positions={positions}
        employees={employees}
      />
    </>
  )
}

export default EmployeeEditPage
