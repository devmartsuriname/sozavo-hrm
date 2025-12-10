/**
 * Organization Units Directory Page
 * Read-only listing of organization units with RLS-aware data fetching
 */

import { Card, Table, Spinner, Alert, Badge } from 'react-bootstrap'
import { useHrmOrgUnits } from '@/hooks/useHrmOrgUnits'
import PageTitle from '@/components/PageTitle'

const OrgUnitsPage = () => {
  const { orgUnits, isLoading, error } = useHrmOrgUnits()

  return (
    <>
      <PageTitle title="Organization Units" subName="HRM" />

      <Card>
        <Card.Header>
          <h4 className="card-title mb-0">Organization Units</h4>
          <p className="text-muted mb-0 mt-1">
            View organizational structure. Access is determined by your role.
          </p>
        </Card.Header>
        <Card.Body>
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {!isLoading && !error && orgUnits.length === 0 && (
            <Alert variant="info">
              No organization units available for your role.
            </Alert>
          )}

          {!isLoading && !error && orgUnits.length > 0 && (
            <div className="table-responsive">
              <Table className="table-centered table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Parent Unit</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {orgUnits.map((unit) => (
                    <tr key={unit.id}>
                      <td>
                        <span className="fw-medium">{unit.code}</span>
                      </td>
                      <td>{unit.name}</td>
                      <td>{unit.description || '—'}</td>
                      <td>{unit.parentOrgUnitName || '—'}</td>
                      <td>
                        <Badge bg={unit.is_active ? 'success' : 'secondary'}>
                          {unit.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default OrgUnitsPage
