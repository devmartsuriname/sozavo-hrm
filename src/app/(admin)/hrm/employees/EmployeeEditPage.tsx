/**
 * HRM Employee Edit Page
 * Allows Admin and HR Manager to update employee records.
 * Uses Darkone form patterns, respects RLS via authenticated session.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { useHrmEmployeeDetail } from '@/hooks/useHrmEmployeeDetail'
import { useUpdateEmployee } from '@/hooks/useUpdateEmployee'
import { useEmployeeFormOptions } from '@/hooks/useEmployeeFormOptions'
import type { HrmEmployeeUpdatePayload, EmploymentStatusType } from '@/types/hrm'

/** Employment status options (matches DB enum) */
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
]

/** Derive initials from a full name */
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  const first = parts[0][0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : ''
  return (first + last).toUpperCase() || '?'
}

const EmployeeEditPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const { isAdmin, isHRManager, status } = useSupabaseAuth()

  // Data hooks
  const { employee, isLoading: isLoadingEmployee, error: employeeError } = useHrmEmployeeDetail(employeeId || '')
  const { updateEmployee, isLoading: isUpdating, error: updateError } = useUpdateEmployee(employeeId || '')
  const { orgUnits, positions, employees, isLoading: isLoadingOptions } = useEmployeeFormOptions()

  // Form state
  const [formData, setFormData] = useState<HrmEmployeeUpdatePayload>({
    first_name: '',
    last_name: '',
    email: '',
    phone: null,
    org_unit_id: null,
    position_id: null,
    manager_id: null,
    employment_status: 'active' as EmploymentStatusType,
    hire_date: null,
    termination_date: null,
    is_active: true,
  })

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Check access: only Admin and HR Manager can edit
  const canEdit = isAdmin || isHRManager

  // Populate form when employee data loads
  useEffect(() => {
    if (employee) {
      setFormData({
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
      })
    }
  }, [employee])

  // Handle form field changes
  const handleChange = (field: keyof HrmEmployeeUpdatePayload, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const result = await updateEmployee(formData)

    if (result) {
      toast.success('Employee updated successfully')
      navigate(`/hrm/employees/${employeeId}`)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    navigate(`/hrm/employees/${employeeId}`)
  }

  // Access denied for non-Admin/HR users
  if (status === 'authenticated' && !canEdit) {
    return (
      <>
        <PageTitle title="Edit Employee" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="danger">
              <Icon icon="mdi:lock-outline" className="me-2" width={20} />
              Access denied. Only administrators and HR managers can edit employee records.
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

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || employee.fullName

  return (
    <>
      <PageTitle title="Edit Employee" subName="HRM" />

      <Form onSubmit={handleSubmit}>
        {/* Header Card */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <Button variant="light" size="sm" onClick={handleCancel} className="me-2">
                    <Icon icon="mdi:arrow-left" width={18} />
                  </Button>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                    style={{ width: 64, height: 64, fontSize: '1.5rem' }}
                    aria-label={fullName}
                  >
                    {getInitials(fullName)}
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="mb-1">{fullName || 'New Employee'}</h4>
                    <p className="text-muted mb-0">
                      {employee.employee_code}
                      <Badge className="ms-2 bg-info">Editing</Badge>
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={handleCancel} disabled={isUpdating}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:content-save" className="me-1" width={18} />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Update error alert */}
        {updateError && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger">
                <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
                {updateError}
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          {/* Personal Information */}
          <Col lg={6} className="mb-4">
            <Card className="h-100">
              <CardHeader>
                <CardTitle as="h5" className="mb-0">
                  <Icon icon="mdi:account-circle-outline" className="me-2" width={20} />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Form.Group className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    isInvalid={!!validationErrors.first_name}
                    placeholder="Enter first name"
                  />
                  {validationErrors.first_name && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.first_name}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    isInvalid={!!validationErrors.last_name}
                    placeholder="Enter last name"
                  />
                  {validationErrors.last_name && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.last_name}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    isInvalid={!!validationErrors.email}
                    placeholder="Enter email address"
                  />
                  {validationErrors.email && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.email}
                    </div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value || null)}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </CardBody>
            </Card>
          </Col>

          {/* Organization Information */}
          <Col lg={6} className="mb-4">
            <Card className="h-100">
              <CardHeader>
                <CardTitle as="h5" className="mb-0">
                  <Icon icon="mdi:office-building-outline" className="me-2" width={20} />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Form.Group className="mb-3">
                  <Form.Label>Organization Unit</Form.Label>
                  <Form.Select
                    value={formData.org_unit_id || ''}
                    onChange={(e) => handleChange('org_unit_id', e.target.value || null)}
                  >
                    <option value="">— Select Organization Unit —</option>
                    {orgUnits.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Select
                    value={formData.position_id || ''}
                    onChange={(e) => handleChange('position_id', e.target.value || null)}
                  >
                    <option value="">— Select Position —</option>
                    {positions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Manager</Form.Label>
                  <Form.Select
                    value={formData.manager_id || ''}
                    onChange={(e) => handleChange('manager_id', e.target.value || null)}
                  >
                    <option value="">— No Manager —</option>
                    {employees
                      .filter((emp) => emp.value !== employeeId) // Exclude self
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Employment Details */}
          <Col xs={12} className="mb-4">
            <Card>
              <CardHeader>
                <CardTitle as="h5" className="mb-0">
                  <Icon icon="mdi:briefcase-outline" className="me-2" width={20} />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Employment Status</Form.Label>
                      <Form.Select
                        value={formData.employment_status}
                        onChange={(e) => handleChange('employment_status', e.target.value)}
                      >
                        {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Active</Form.Label>
                      <div className="pt-2">
                        <Form.Check
                          type="switch"
                          id="is-active-switch"
                          label={formData.is_active ? 'Yes' : 'No'}
                          checked={formData.is_active}
                          onChange={(e) => handleChange('is_active', e.target.checked)}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Hire Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.hire_date || ''}
                        onChange={(e) => handleChange('hire_date', e.target.value || null)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Termination Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.termination_date || ''}
                        onChange={(e) => handleChange('termination_date', e.target.value || null)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default EmployeeEditPage
