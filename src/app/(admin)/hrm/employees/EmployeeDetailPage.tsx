/**
 * HRM Employee Detail Page
 * Read-only view of a single employee's profile
 * Uses Darkone card patterns, respects RLS via authenticated session
 * Phase 4.2.1: Added Reactivate Employee functionality with unified history card
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useHrmEmployeeDetail } from '@/hooks/useHrmEmployeeDetail'
import { usePermissions } from '@/hooks/usePermissions'
import { useTerminateEmployee } from '@/hooks/useTerminateEmployee'
import { useReactivateEmployee } from '@/hooks/useReactivateEmployee'
import { TerminateEmployeeModal } from '@/components/hrm/TerminateEmployeeModal'
import { ReactivateEmployeeModal } from '@/components/hrm/ReactivateEmployeeModal'

/** Derive initials from a full name */
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  const first = parts[0][0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : ''
  return (first + last).toUpperCase() || '?'
}

/** Format date for display */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Format datetime for display */
const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/** Get status badge variant */
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-success'
    case 'on_leave':
      return 'bg-warning'
    case 'terminated':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const { employee, isLoading, error, refetch } = useHrmEmployeeDetail(employeeId || '')
  const { canEditEmployee, canTerminateEmployee, canReactivateEmployee, isHRManager, isAdmin } = usePermissions()
  const { isTerminating, error: terminateError, terminate, clearError: clearTerminateError } = useTerminateEmployee()
  const { isReactivating, error: reactivateError, reactivate, clearError: clearReactivateError } = useReactivateEmployee()

  // Modal states
  const [showTerminateModal, setShowTerminateModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)

  // Permissions
  const canEdit = canEditEmployee()
  const canTerminate = canTerminateEmployee()
  const canReactivate = canReactivateEmployee()
  const isTerminated = employee?.employment_status === 'terminated'

  const handleBack = () => {
    navigate('/hrm/employees')
  }

  const handleEdit = () => {
    navigate(`/hrm/employees/${employeeId}/edit`)
  }

  const handleTerminateClick = () => {
    clearTerminateError()
    setShowTerminateModal(true)
  }

  const handleReactivateClick = () => {
    clearReactivateError()
    setShowReactivateModal(true)
  }

  const handleTerminateConfirm = async (terminationDate: string, terminationReason: string | null) => {
    if (!employeeId) return
    
    const success = await terminate(employeeId, terminationDate, terminationReason)
    if (success) {
      setShowTerminateModal(false)
      toast.success('Employee terminated successfully')
      refetch()
    }
  }

  const handleReactivateConfirm = async (reactivationReason: string | null) => {
    if (!employeeId) return
    
    const success = await reactivate(employeeId, reactivationReason)
    if (success) {
      setShowReactivateModal(false)
      toast.success('Employee reactivated successfully')
      refetch()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Employee Details" subName="HRM" />
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <PageTitle title="Employee Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {error}
            </Alert>
            <Button variant="secondary" onClick={handleBack}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Directory
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  // Not found state
  if (!employee) {
    return (
      <>
        <PageTitle title="Employee Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <Icon icon="mdi:information-outline" className="me-2" width={20} />
              Employee not found or you do not have access to this record.
            </Alert>
            <Button variant="secondary" onClick={handleBack}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Directory
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  // Check if employee has reactivation history
  const hasReactivationHistory = !!employee.reactivated_at

  return (
    <>
      <PageTitle title="Employee Details" subName="HRM" />

      {/* Terminate error alert */}
      {terminateError && (
        <Row className="mb-3">
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={clearTerminateError}>
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {terminateError}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Reactivate error alert */}
      {reactivateError && (
        <Row className="mb-3">
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={clearReactivateError}>
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {reactivateError}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Header with avatar and basic info */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Button variant="light" size="sm" onClick={handleBack} className="me-2">
                  <Icon icon="mdi:arrow-left" width={18} />
                </Button>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                  style={{ width: 64, height: 64, fontSize: '1.5rem' }}
                  aria-label={employee.fullName}
                >
                  {getInitials(employee.fullName)}
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1">{employee.fullName}</h4>
                  <p className="text-muted mb-0">
                    {employee.employee_code}
                    <Badge className={`ms-2 ${getStatusBadgeClass(employee.employment_status)}`}>
                      {employee.employment_status}
                    </Badge>
                  </p>
                </div>
                <div className="d-flex gap-2">
                  {canEdit && !isTerminated && (
                    <Button variant="primary" onClick={handleEdit}>
                      <Icon icon="mdi:pencil" className="me-1" width={18} />
                      Edit
                    </Button>
                  )}
                  {canTerminate && !isTerminated && (
                    <Button variant="outline-danger" onClick={handleTerminateClick}>
                      <Icon icon="mdi:account-remove" className="me-1" width={18} />
                      Terminate
                    </Button>
                  )}
                  {canReactivate && isTerminated && (
                    <Button variant="outline-success" onClick={handleReactivateClick}>
                      <Icon icon="mdi:account-reactivate" className="me-1" width={18} />
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Contact Information */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <Icon icon="mdi:account-circle-outline" className="me-2" width={20} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <label className="text-muted small d-block">Email</label>
                <a href={`mailto:${employee.email}`} className="text-primary">
                  {employee.email}
                </a>
              </div>
              <div>
                <label className="text-muted small d-block">Phone</label>
                <span>{employee.phone || '—'}</span>
              </div>
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
              <div className="mb-3">
                <label className="text-muted small d-block">Organization Unit</label>
                <span>{employee.orgUnitName || '—'}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Position</label>
                <span>{employee.positionTitle || '—'}</span>
              </div>
              <div>
                <label className="text-muted small d-block">Manager</label>
                <span>{employee.managerName || '—'}</span>
              </div>
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
                <Col md={3} className="mb-3 mb-md-0">
                  <label className="text-muted small d-block">Status</label>
                  <Badge className={getStatusBadgeClass(employee.employment_status)}>
                    {employee.employment_status}
                  </Badge>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <label className="text-muted small d-block">Active</label>
                  <span>
                    {employee.is_active ? (
                      <Icon icon="mdi:check-circle" className="text-success" width={20} />
                    ) : (
                      <Icon icon="mdi:close-circle" className="text-danger" width={20} />
                    )}
                    {employee.is_active ? ' Yes' : ' No'}
                  </span>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <label className="text-muted small d-block">Hire Date</label>
                  <span>{formatDate(employee.hire_date)}</span>
                </Col>
                <Col md={3}>
                  <label className="text-muted small d-block">Termination Date</label>
                  <span>{formatDate(employee.termination_date)}</span>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6} className="mb-3 mb-md-0">
                  <label className="text-muted small d-block">Created</label>
                  <span>{formatDate(employee.created_at)}</span>
                </Col>
                <Col md={6}>
                  <label className="text-muted small d-block">Last Updated</label>
                  <span>{formatDate(employee.updated_at)}</span>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Termination & Reactivation History Card - Only shown for terminated or reactivated employees */}
      {(isTerminated || hasReactivationHistory) && (
        <Row>
          <Col xs={12} className="mb-4">
            <Card className={isTerminated ? 'border-danger' : 'border-success'}>
              <CardHeader className={isTerminated ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}>
                <CardTitle as="h5" className={`mb-0 ${isTerminated ? 'text-danger' : 'text-success'}`}>
                  <Icon icon="mdi:history" className="me-2" width={20} />
                  Termination & Reactivation History
                </CardTitle>
              </CardHeader>
              <CardBody>
                {/* Termination Section */}
                <h6 className="text-muted mb-3">
                  <Icon icon="mdi:account-remove" className="me-2" width={18} />
                  Termination Details
                </h6>
                <Row className="mb-4">
                  <Col md={3} className="mb-3 mb-md-0">
                    <label className="text-muted small d-block">Termination Date</label>
                    <span className="fw-medium">{formatDate(employee.termination_date)}</span>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <label className="text-muted small d-block">Terminated At</label>
                    <span>{formatDateTime(employee.terminated_at)}</span>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <label className="text-muted small d-block">Terminated By</label>
                    <span>{employee.terminated_by || '—'}</span>
                  </Col>
                  <Col md={3}>
                    <label className="text-muted small d-block">Reason</label>
                    <span>{employee.termination_reason || '—'}</span>
                  </Col>
                </Row>

                {/* Reactivation Section - Only shown if reactivated */}
                {hasReactivationHistory && (
                  <>
                    <hr />
                    <h6 className="text-success mb-3">
                      <Icon icon="mdi:account-reactivate" className="me-2" width={18} />
                      Reactivation Details
                    </h6>
                    <Row>
                      <Col md={4} className="mb-3 mb-md-0">
                        <label className="text-muted small d-block">Reactivated At</label>
                        <span className="fw-medium">{formatDateTime(employee.reactivated_at)}</span>
                      </Col>
                      <Col md={4} className="mb-3 mb-md-0">
                        <label className="text-muted small d-block">Reactivated By</label>
                        <span>{employee.reactivated_by || '—'}</span>
                      </Col>
                      <Col md={4}>
                        <label className="text-muted small d-block">Reason</label>
                        <span>{employee.reactivation_reason || '—'}</span>
                      </Col>
                    </Row>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Terminate Modal */}
      <TerminateEmployeeModal
        show={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        onConfirm={handleTerminateConfirm}
        employeeName={employee.fullName}
        employeeCode={employee.employee_code}
        isTerminating={isTerminating}
      />

      {/* Reactivate Modal */}
      <ReactivateEmployeeModal
        show={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={handleReactivateConfirm}
        employeeName={employee.fullName}
        employeeCode={employee.employee_code}
        isReactivating={isReactivating}
        requireReason={isHRManager && !isAdmin}
      />
    </>
  )
}

export default EmployeeDetailPage