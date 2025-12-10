/**
 * HRM Employee Directory Page
 * Read-only table listing employees from hrm_employees
 * Uses Darkone table patterns, respects RLS via authenticated session
 */

import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { useHrmEmployees } from '@/hooks/useHrmEmployees'

const EmployeeDirectory = () => {
  const { employees, isLoading, error } = useHrmEmployees()

  return (
    <>
      <PageTitle title="Employee Directory" subName="HRM" />

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <CardTitle as="h5">Employees</CardTitle>
              <p className="card-subtitle">
                View all employees you have access to based on your role.
              </p>
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
                        <th scope="col">Employee Code</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Org Unit</th>
                        <th scope="col">Position</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td>{emp.employee_code}</td>
                          <td>{emp.fullName}</td>
                          <td>{emp.email}</td>
                          <td>{emp.phone || '—'}</td>
                          <td>{emp.orgUnitName || '—'}</td>
                          <td>{emp.positionTitle || '—'}</td>
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
