/**
 * HRM Users & Roles Directory Page
 * Read-only listing of all users with their roles and linked employees
 * Phase 3 – Step 1: RBAC Visibility
 * 
 * Access: Admin and HR Manager only
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageTitle from '@/components/PageTitle'
import { useHrmUsers } from '@/hooks/useHrmUsers'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import type { HrmUserDirectory } from '@/types/hrm-users'
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

const UsersPage = () => {
  const { users, isLoading, error } = useHrmUsers()
  const { isAdmin, isHRManager, isLoading: authLoading } = useSupabaseAuth()

  // Access control
  const canAccess = isAdmin || isHRManager

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<AppRole | ''>('')

  // Filtered users
  const displayedUsers = useMemo(() => {
    let result = [...users]

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((u) => {
        return (
          u.userId.toLowerCase().includes(term) ||
          (u.linkedEmployeeName?.toLowerCase().includes(term) ?? false) ||
          (u.linkedEmployeeCode?.toLowerCase().includes(term) ?? false)
        )
      })
    }

    // Filter by role
    if (roleFilter) {
      result = result.filter((u) => u.roles.includes(roleFilter))
    }

    return result
  }, [users, searchTerm, roleFilter])

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
        <PageTitle title="Users & Roles" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:shield-lock-outline" className="me-2" width={20} />
              <strong>Access Denied</strong>
              <p className="mb-0 mt-2">
                You do not have permission to view user and role information.
                This page is restricted to Administrators and HR Managers.
              </p>
            </Alert>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Users & Roles" subName="HRM" />

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <CardTitle as="h5">User Directory</CardTitle>
                <p className="card-subtitle mb-0">
                  View all system users with their assigned roles and linked employee records.
                </p>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Form.Control
                  type="text"
                  placeholder="Search by ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: 220 }}
                />
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as AppRole | '')}
                  style={{ maxWidth: 160 }}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </Form.Select>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading && (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}

              {error && (
                <Alert variant="danger">
                  <Icon icon="mdi:alert-circle" className="me-2" width={18} />
                  {error}
                </Alert>
              )}

              {!isLoading && !error && users.length === 0 && (
                <Alert variant="info">
                  <Icon icon="mdi:information" className="me-2" width={18} />
                  No users with assigned roles found. Users must have at least one role assignment to appear here.
                </Alert>
              )}

              {!isLoading && !error && users.length > 0 && (
                <div className="table-responsive">
                  <Table className="table-striped table-hover table-centered mb-0">
                    <thead>
                      <tr>
                        <th scope="col">User ID</th>
                        <th scope="col">Roles</th>
                        <th scope="col">Linked Employee</th>
                        <th scope="col">Employee Code</th>
                        <th scope="col" style={{ width: 80 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.map((user) => (
                        <tr key={user.userId}>
                          <td>
                            <code className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {user.userId.substring(0, 8)}...
                            </code>
                          </td>
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
                          <td>
                            {user.linkedEmployeeId ? (
                              <Link
                                to={`/hrm/employees/${user.linkedEmployeeId}`}
                                className="text-primary text-decoration-none"
                              >
                                {user.linkedEmployeeName || '—'}
                              </Link>
                            ) : (
                              <span className="text-muted fst-italic">Not linked</span>
                            )}
                          </td>
                          <td>
                            {user.linkedEmployeeCode ? (
                              <code>{user.linkedEmployeeCode}</code>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <Link
                              to={`/hrm/users/${user.userId}`}
                              className="btn btn-sm btn-soft-primary"
                              title="View Details"
                            >
                              <Icon icon="mdi:eye" width={16} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {displayedUsers.length === 0 && (searchTerm || roleFilter) && (
                    <p className="text-center text-muted py-3 mb-0">
                      No users match your filters.
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default UsersPage
