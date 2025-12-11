/**
 * HRM User Detail Page
 * Read-only view of a single user's roles and linked employee
 * Phase 3 – Step 1: RBAC Visibility
 * 
 * Access: Admin and HR Manager only
 */

import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageTitle from '@/components/PageTitle'
import { useHrmUserDetail } from '@/hooks/useHrmUserDetail'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import type { AppRole } from '@/types/supabase-auth'

/** Role badge color mapping */
const getRoleBadgeClass = (role: AppRole): string => {
  switch (role) {
    case 'admin':
      return 'bg-danger'
    case 'hr_manager':
      return 'bg-primary'
    case 'manager':
      return 'bg-info'
    case 'employee':
      return 'bg-secondary'
    default:
      return 'bg-secondary'
  }
}

/** Format role label for display */
const formatRoleLabel = (role: AppRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'hr_manager':
      return 'HR Manager'
    case 'manager':
      return 'Manager'
    case 'employee':
      return 'Employee'
    default:
      return role
  }
}

/** Format date for display */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const { user, isLoading, error } = useHrmUserDetail(userId)
  const { isAdmin, isHRManager, isLoading: authLoading } = useSupabaseAuth()

  // Access control
  const canAccess = isAdmin || isHRManager

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  // Access denied guard
  if (!canAccess) {
    return (
      <>
        <PageTitle title="User Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:shield-lock-outline" className="me-2" width={20} />
              <strong>Access Denied</strong>
              <p className="mb-0 mt-2">
                You do not have permission to view user details.
                This page is restricted to Administrators and HR Managers.
              </p>
            </Alert>
            <Button as={Link as any} to="/hrm/users" variant="secondary">
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Users
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageTitle title="User Details" subName="HRM" />
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="User Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="danger">
              <Icon icon="mdi:alert-circle" className="me-2" width={18} />
              {error}
            </Alert>
            <Button as={Link as any} to="/hrm/users" variant="secondary">
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Users
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <PageTitle title="User Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:account-question" className="me-2" width={18} />
              User not found or you don't have permission to view this user.
            </Alert>
            <Button as={Link as any} to="/hrm/users" variant="secondary">
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Users
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <PageTitle title="User Details" subName="HRM" />

      {/* Header Card */}
      <Row className="mb-3">
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                  style={{ width: 60, height: 60, fontSize: '1.5rem' }}
                >
                  <Icon icon="mdi:account" width={32} />
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1">
                    {user.linkedEmployeeName || 'User Account'}
                  </h4>
                  <p className="mb-1 text-muted">
                    <code style={{ fontSize: '0.8rem' }}>{user.userId}</code>
                  </p>
                  <div className="d-flex gap-1 flex-wrap">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`badge ${getRoleBadgeClass(role)}`}
                      >
                        {formatRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Button as={Link as any} to="/hrm/users" variant="outline-secondary">
                    <Icon icon="mdi:arrow-left" className="me-1" width={18} />
                    Back
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Details Cards */}
      <Row>
        {/* Role Information */}
        <Col lg={6} className="mb-3">
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-3">
                <Icon icon="mdi:shield-account" className="me-2" width={20} />
                Role Information
              </h5>
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: 140 }}>Assigned Roles</td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`badge ${getRoleBadgeClass(role)}`}
                          >
                            {formatRoleLabel(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Role Count</td>
                    <td>{user.roles.length}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">First Assigned</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>

        {/* Linked Employee */}
        <Col lg={6} className="mb-3">
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-3">
                <Icon icon="mdi:account-tie" className="me-2" width={20} />
                Linked Employee
              </h5>
              {user.linkedEmployeeId ? (
                <>
                  <table className="table table-borderless mb-3">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: 140 }}>Employee</td>
                        <td>
                          <Link
                            to={`/hrm/employees/${user.linkedEmployeeId}`}
                            className="text-primary text-decoration-none"
                          >
                            {user.linkedEmployeeName}
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Employee Code</td>
                        <td><code>{user.linkedEmployeeCode}</code></td>
                      </tr>
                      <tr>
                        <td className="text-muted">Organization</td>
                        <td>{user.linkedEmployeeOrgUnit || '—'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Position</td>
                        <td>{user.linkedEmployeePosition || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                  <Button
                    as={Link as any}
                    to={`/hrm/employees/${user.linkedEmployeeId}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    <Icon icon="mdi:eye" className="me-1" width={16} />
                    View Employee Profile
                  </Button>
                </>
              ) : (
                <Alert variant="info" className="mb-0">
                  <Icon icon="mdi:link-off" className="me-2" width={18} />
                  This user is not linked to an employee record.
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default UserDetailPage
