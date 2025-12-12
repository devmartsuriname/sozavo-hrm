/**
 * Organization Units Directory Page
 * Read-only listing of organization units with RLS-aware data fetching
 * Access restricted to Admin and HR Manager roles (Phase 3 – Step 3.3)
 */

import { Link } from 'react-router-dom'
import { Card, Table, Spinner, Alert, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useHrmOrgUnits } from '@/hooks/useHrmOrgUnits'
import { usePermissions } from '@/hooks/usePermissions'
import PageTitle from '@/components/PageTitle'

const OrgUnitsPage = () => {
  const { orgUnits, isLoading, error } = useHrmOrgUnits()
  const { canViewHRMData } = usePermissions()

  // Access guard: only Admin and HR Manager can view
  if (!canViewHRMData()) {
    return (
      <>
        <PageTitle title="Organization Units" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          You do not have permission to view organization units.
        </Alert>
      </>
    )
  }

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
                        <Link
                          to={`/hrm/org-units/${unit.id}`}
                          className="text-primary fw-medium text-decoration-none"
                        >
                          {unit.code}
                        </Link>
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
