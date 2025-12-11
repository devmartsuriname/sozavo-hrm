/**
 * Positions Directory Page
 * Read-only listing of positions with RLS-aware data fetching
 */

import { Card, Table, Spinner, Alert, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useHrmPositions } from '@/hooks/useHrmPositions'
import PageTitle from '@/components/PageTitle'

const PositionsPage = () => {
  const { positions, isLoading, error } = useHrmPositions()

  return (
    <>
      <PageTitle title="Positions" subName="HRM" />

      <Card>
        <Card.Header>
          <h4 className="card-title mb-0">Positions</h4>
          <p className="text-muted mb-0 mt-1">
            View job positions and their organization units. Access is determined by your role.
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

          {!isLoading && !error && positions.length === 0 && (
            <Alert variant="info">
              No positions available for your role.
            </Alert>
          )}

          {!isLoading && !error && positions.length > 0 && (
            <div className="table-responsive">
              <Table className="table-centered table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Organization Unit</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td>
                        <Link to={`/hrm/positions/${position.id}`} className="text-primary fw-medium">
                          {position.code}
                        </Link>
                      </td>
                      <td>{position.title}</td>
                      <td>{position.orgUnitName || '—'}</td>
                      <td>
                        <Badge bg={position.is_active ? 'success' : 'secondary'}>
                          {position.is_active ? 'Active' : 'Inactive'}
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

export default PositionsPage
