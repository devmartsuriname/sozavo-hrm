/**
 * Shared Employee Form Component
 * Reusable for both Create and Edit modes
 * Handles validation and business rules
 */

import { useState, useEffect } from 'react'
import {
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
import type { EmploymentStatusType } from '@/types/hrm'

/** Employment status options (matches DB enum) */
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
]

/** Form data structure */
export interface EmployeeFormData {
  first_name: string
  last_name: string
  email: string
  phone: string | null
  org_unit_id: string | null
  position_id: string | null
  manager_id: string | null
  employment_status: EmploymentStatusType
  hire_date: string | null
  termination_date: string | null
  is_active: boolean
}

/** Select option format */
interface SelectOption {
  value: string
  label: string
}

interface EmployeeFormBaseProps {
  mode: 'create' | 'edit'
  initialData: EmployeeFormData
  employeeCode?: string // Only for edit mode display
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: string | null
  orgUnits: SelectOption[]
  positions: SelectOption[]
  employees: SelectOption[]
  currentEmployeeId?: string // For edit mode - exclude from manager list
}

/** Derive initials from a full name */
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  const first = parts[0][0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : ''
  return (first + last).toUpperCase() || '?'
}

const EmployeeFormBase = ({
  mode,
  initialData,
  employeeCode,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  orgUnits,
  positions,
  employees,
  currentEmployeeId,
}: EmployeeFormBaseProps) => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialData)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Sync form data when initialData changes (for edit mode)
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  // Handle form field changes
  const handleChange = (field: keyof EmployeeFormData, value: string | boolean | null) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Rule A: Auto-set is_active to false when status changes to terminated
      if (field === 'employment_status' && value === 'terminated') {
        updated.is_active = false
      }

      return updated
    })
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

    // Create mode requires org_unit_id and position_id
    if (mode === 'create') {
      if (!formData.org_unit_id) {
        errors.org_unit_id = 'Organization unit is required'
      }
      if (!formData.position_id) {
        errors.position_id = 'Position is required'
      }
    }

    // Rule B: Termination date + active status is invalid
    if (formData.termination_date && formData.employment_status === 'active') {
      errors.employment_status = 'An employee with a termination date cannot have status "Active".'
      errors.termination_date = 'Clear this date or change status from "Active".'
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

    // Apply business rules to payload
    const processedData = { ...formData }

    // Rule A: Terminated status forces is_active = false
    if (processedData.employment_status === 'terminated') {
      processedData.is_active = false
    }

    await onSubmit(processedData)
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim()
  const isCreate = mode === 'create'
  const headerTitle = isCreate ? 'New Employee' : fullName || 'Employee'
  const submitButtonText = isCreate ? 'Create Employee' : 'Save Changes'
  const statusBadgeText = isCreate ? 'Creating' : 'Editing'

  return (
    <Form onSubmit={handleSubmit}>
      {/* Header Card */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Button variant="light" size="sm" onClick={onCancel} className="me-2">
                  <Icon icon="mdi:arrow-left" width={18} />
                </Button>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                  style={{ width: 64, height: 64, fontSize: '1.5rem' }}
                  aria-label={headerTitle}
                >
                  {isCreate ? (
                    <Icon icon="mdi:account-plus" width={32} />
                  ) : (
                    getInitials(fullName || '?')
                  )}
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1">{headerTitle}</h4>
                  <p className="text-muted mb-0">
                    {employeeCode || (isCreate ? 'Code will be auto-generated' : '')}
                    <Badge className="ms-2 bg-info">{statusBadgeText}</Badge>
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        {isCreate ? 'Creating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Icon icon={isCreate ? 'mdi:account-plus' : 'mdi:content-save'} className="me-1" width={18} />
                        {submitButtonText}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Submit error alert */}
      {submitError && (
        <Row className="mb-4">
          <Col xs={12}>
            <div className="alert alert-danger">
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {submitError}
            </div>
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
                <Form.Label>
                  First Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  isInvalid={!!validationErrors.first_name}
                  placeholder="Enter first name"
                />
                {validationErrors.first_name && (
                  <div className="invalid-feedback d-block">{validationErrors.first_name}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Last Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  isInvalid={!!validationErrors.last_name}
                  placeholder="Enter last name"
                />
                {validationErrors.last_name && (
                  <div className="invalid-feedback d-block">{validationErrors.last_name}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  isInvalid={!!validationErrors.email}
                  placeholder="Enter email address"
                />
                {validationErrors.email && (
                  <div className="invalid-feedback d-block">{validationErrors.email}</div>
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
                <Form.Label>
                  Organization Unit {isCreate && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Select
                  value={formData.org_unit_id || ''}
                  onChange={(e) => handleChange('org_unit_id', e.target.value || null)}
                  isInvalid={!!validationErrors.org_unit_id}
                >
                  <option value="">— Select Organization Unit —</option>
                  {orgUnits.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.org_unit_id && (
                  <div className="invalid-feedback d-block">{validationErrors.org_unit_id}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Position {isCreate && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Select
                  value={formData.position_id || ''}
                  onChange={(e) => handleChange('position_id', e.target.value || null)}
                  isInvalid={!!validationErrors.position_id}
                >
                  <option value="">— Select Position —</option>
                  {positions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.position_id && (
                  <div className="invalid-feedback d-block">{validationErrors.position_id}</div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label>Manager</Form.Label>
                <Form.Select
                  value={formData.manager_id || ''}
                  onChange={(e) => handleChange('manager_id', e.target.value || null)}
                >
                  <option value="">— No Manager —</option>
                  {employees
                    .filter((emp) => emp.value !== currentEmployeeId) // Exclude self in edit mode
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
                      isInvalid={!!validationErrors.employment_status}
                    >
                      {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                    {validationErrors.employment_status && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.employment_status}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Active</Form.Label>
                    <div className="pt-2">
                      {formData.employment_status === 'terminated' ? (
                        <span className="text-muted">
                          <Icon icon="mdi:lock-outline" className="me-1" width={16} />
                          Inactive (locked by status 'Terminated')
                        </span>
                      ) : (
                        <Form.Check
                          type="switch"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => handleChange('is_active', e.target.checked)}
                          label={formData.is_active ? 'Yes' : 'No'}
                        />
                      )}
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
                      isInvalid={!!validationErrors.termination_date}
                    />
                    {validationErrors.termination_date && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.termination_date}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Form>
  )
}

export default EmployeeFormBase
