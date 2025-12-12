/**
 * HRM User Detail Page
 * View and manage user roles and linked employee
 * Phase 3 – Steps 1-2: RBAC Visibility & Role Management
 * 
 * Access: Admin (full edit) and HR Manager (read-only)
 */

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useHrmUserDetail } from '@/hooks/useHrmUserDetail'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import { RoleManagerModal } from '@/components/hrm/RoleManagerModal'
import { supabase } from '@/integrations/supabase/client'
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

interface EmployeeOption {
  id: string
  code: string
  name: string
  orgUnitName: string | null
}

const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const { user, isLoading, error, refetch } = useHrmUserDetail(userId)
  const { isAdmin, isHRManager, isLoading: authLoading } = useSupabaseAuth()

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)

  // Access control
  const canAccess = isAdmin || isHRManager

  // Fetch employees for the linking dropdown when modal opens
  useEffect(() => {
    if (showModal && employees.length === 0) {
      const fetchEmployees = async () => {
        setEmployeesLoading(true)
        try {
          const { data: empData, error: empError } = await supabase
            .from('hrm_employees')
            .select('id, employee_code, first_name, last_name, org_unit_id')
            .eq('is_active', true)
            .order('employee_code')

          if (empError) {
            console.warn('Failed to fetch employees:', empError.message)
            return
          }

          // Fetch org units for names
          const { data: orgData } = await supabase
            .from('hrm_organization_units')
            .select('id, name')

          const orgMap = new Map(orgData?.map(o => [o.id, o.name]) ?? [])

          const options: EmployeeOption[] = (empData ?? []).map(emp => ({
            id: emp.id,
            code: emp.employee_code,
            name: `${emp.first_name} ${emp.last_name}`.trim(),
            orgUnitName: emp.org_unit_id ? orgMap.get(emp.org_unit_id) ?? null : null,
          }))

          setEmployees(options)
        } catch (err) {
          console.warn('Failed to fetch employees for linking:', err)
        } finally {
          setEmployeesLoading(false)
        }
      }

      fetchEmployees()
    }
  }, [showModal, employees.length])

  const handleSaveSuccess = () => {
    toast.success('User roles and linking updated successfully.')
    refetch()
  }

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
                    {user.employeeName || user.email || 'User Account'}
                  </h4>
                  <p className="mb-1 text-muted">
                    {user.email || <code style={{ fontSize: '0.8rem' }}>{user.userId}</code>}
                  </p>
                  <div className="d-flex gap-1 flex-wrap">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span
                          key={role}
                          className={`badge ${getRoleBadgeClass(role)}`}
                        >
                          {formatRoleLabel(role)}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted fst-italic">No roles assigned</span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {/* Manage Roles button - visible for Admin and HR Manager */}
                  <Button
                    variant={isAdmin ? 'primary' : 'outline-secondary'}
                    onClick={() => setShowModal(true)}
                    disabled={employeesLoading}
                  >
                    <Icon icon="mingcute:user-setting-line" className="me-1" width={18} />
                    {isAdmin ? 'Manage Roles & Linking' : 'View Roles & Linking'}
                  </Button>
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
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span
                              key={role}
                              className={`badge ${getRoleBadgeClass(role)}`}
                            >
                              {formatRoleLabel(role)}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted fst-italic">No roles assigned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Role Count</td>
                    <td>{user.roles.length}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Account Created</td>
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
              {user.employeeId ? (
                <>
                  <table className="table table-borderless mb-3">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: 140 }}>Employee</td>
                        <td>
                          <Link
                            to={`/hrm/employees/${user.employeeId}`}
                            className="text-primary text-decoration-none"
                          >
                            {user.employeeName}
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Employee Code</td>
                        <td><code>{user.employeeCode}</code></td>
                      </tr>
                    </tbody>
                  </table>
                  <Button
                    as={Link as any}
                    to={`/hrm/employees/${user.employeeId}`}
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
                  {user.roles.length > 0 && (
                    <div className="mt-2 text-danger">
                      <Icon icon="mdi:alert" className="me-1" width={16} />
                      <strong>Warning:</strong> Users with roles should be linked to an employee.
                    </div>
                  )}
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Role Manager Modal */}
      {user && (
        <RoleManagerModal
          show={showModal}
          onClose={() => setShowModal(false)}
          user={user}
          employees={employees}
          isAdmin={isAdmin}
          isHRManager={isHRManager}
          onSave={handleSaveSuccess}
        />
      )}
    </>
  )
}

export default UserDetailPage
