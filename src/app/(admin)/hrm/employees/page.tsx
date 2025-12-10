/**
 * HRM Employee Directory Page
 * Read-only table listing employees from hrm_employees
 * Uses Darkone table patterns, respects RLS via authenticated session
 * Features: initials avatar, sorting, filtering, manager name display
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageTitle from '@/components/PageTitle'
import { useHrmEmployees } from '@/hooks/useHrmEmployees'
import type { HrmEmployeeDirectory } from '@/types/hrm'

type SortKey = 'employee_code' | 'fullName' | 'orgUnitName' | 'positionTitle' | 'managerName' | 'employment_status'
type SortDirection = 'asc' | 'desc'

/** Derive initials from a full name */
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  const first = parts[0][0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : ''
  return (first + last).toUpperCase() || '?'
}

const EmployeeDirectory = () => {
  const { employees, isLoading, error } = useHrmEmployees()

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('employee_code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')

  // Handle header click for sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // Filtered and sorted employees
  const displayedEmployees = useMemo(() => {
    let result = [...employees]

    // Filter by search term (case-insensitive partial match)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((emp) => {
        return (
          emp.employee_code.toLowerCase().includes(term) ||
          emp.fullName.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term) ||
          (emp.orgUnitName?.toLowerCase().includes(term) ?? false) ||
          (emp.positionTitle?.toLowerCase().includes(term) ?? false) ||
          (emp.managerName?.toLowerCase().includes(term) ?? false)
        )
      })
    }

    // Sort
    result.sort((a, b) => {
      const aVal = (a[sortKey] ?? '').toString().toLowerCase()
      const bVal = (b[sortKey] ?? '').toString().toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [employees, searchTerm, sortKey, sortDirection])

  // Render sort indicator
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <Icon icon="mdi:unfold-more-horizontal" className="ms-1 opacity-50" width={14} />
    }
    return sortDirection === 'asc' ? (
      <Icon icon="mdi:chevron-up" className="ms-1" width={14} />
    ) : (
      <Icon icon="mdi:chevron-down" className="ms-1" width={14} />
    )
  }

  // Sortable header cell
  const SortableHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      scope="col"
      onClick={() => handleSort(sortKeyName)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      className="text-nowrap"
    >
      {label}
      {renderSortIcon(sortKeyName)}
    </th>
  )

  return (
    <>
      <PageTitle title="Employee Directory" subName="HRM" />

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <CardTitle as="h5">Employees</CardTitle>
                <p className="card-subtitle mb-0">
                  View all employees you have access to based on your role.
                </p>
              </div>
              <Form.Control
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: 250 }}
              />
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
                  {error}
                </Alert>
              )}

              {!isLoading && !error && employees.length === 0 && (
                <Alert variant="info">
                  No employees found. You may not have permission to view employee records.
                </Alert>
              )}

              {!isLoading && !error && employees.length > 0 && (
                <div className="table-responsive">
                  <Table className="table-striped table-hover table-centered mb-0">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 50 }}></th>
                        <SortableHeader label="Employee Code" sortKeyName="employee_code" />
                        <SortableHeader label="Full Name" sortKeyName="fullName" />
                        <th scope="col">Email</th>
                        <th scope="col">Phone</th>
                        <SortableHeader label="Org Unit" sortKeyName="orgUnitName" />
                        <SortableHeader label="Position" sortKeyName="positionTitle" />
                        <SortableHeader label="Manager" sortKeyName="managerName" />
                        <SortableHeader label="Status" sortKeyName="employment_status" />
                      </tr>
                    </thead>
                    <tbody>
                      {displayedEmployees.map((emp) => (
                        <tr key={emp.id}>
                          <td>
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-semibold"
                              style={{ width: 36, height: 36, fontSize: '0.8rem' }}
                              aria-label={emp.fullName}
                            >
                              {getInitials(emp.fullName)}
                            </div>
                          </td>
                          <td>
                            <Link 
                              to={`/hrm/employees/${emp.id}`}
                              className="text-primary text-decoration-none fw-medium"
                            >
                              {emp.employee_code}
                            </Link>
                          </td>
                          <td>{emp.fullName}</td>
                          <td>{emp.email}</td>
                          <td>{emp.phone || '—'}</td>
                          <td>{emp.orgUnitName || '—'}</td>
                          <td>{emp.positionTitle || '—'}</td>
                          <td>{emp.managerName || '—'}</td>
                          <td>
                            <span
                              className={`badge ${
                                emp.employment_status === 'active'
                                  ? 'bg-success'
                                  : emp.employment_status === 'on_leave'
                                  ? 'bg-warning'
                                  : emp.employment_status === 'terminated'
                                  ? 'bg-danger'
                                  : 'bg-secondary'
                              }`}
                            >
                              {emp.employment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {displayedEmployees.length === 0 && searchTerm && (
                    <p className="text-center text-muted py-3 mb-0">
                      No employees match your search.
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

export default EmployeeDirectory
