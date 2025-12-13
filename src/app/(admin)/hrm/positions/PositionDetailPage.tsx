/**
 * HRM Position Detail Page
 * Read-only view of a single position's profile
 * Uses Darkone card patterns, respects RLS via authenticated session
 * Access restricted to Admin and HR Manager roles (Phase 3 – Step 3.3)
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Badge, Card, Col, Row, Spinner, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageTitle from '@/components/PageTitle'
import { useHrmPositionDetail } from '@/hooks/useHrmPositionDetail'
import { usePermissions } from '@/hooks/usePermissions'

/** Format date for display */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
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

const PositionDetailPage = () => {
  const { positionId } = useParams<{ positionId: string }>()
  const navigate = useNavigate()
  const { position, isLoading, error } = useHrmPositionDetail(positionId || '')
  const { canViewHRMData, canEditPosition } = usePermissions()

  const handleBack = () => {
    navigate('/hrm/positions')
  }

  const handleEdit = () => {
    navigate(`/hrm/positions/${positionId}/edit`)
  }

  // Access guard: only Admin and HR Manager can view
  if (!canViewHRMData()) {
    return (
      <>
        <PageTitle title="Position Details" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          You do not have permission to view position details.
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/employees')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Employees
        </Button>
      </>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Position Details" subName="HRM" />
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
        <PageTitle title="Position Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {error}
            </Alert>
            <Button variant="secondary" onClick={handleBack}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Positions
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  // Not found state
  if (!position) {
    return (
      <>
        <PageTitle title="Position Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <Icon icon="mdi:information-outline" className="me-2" width={20} />
              Position not found or you do not have access to this record.
            </Alert>
            <Button variant="secondary" onClick={handleBack}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Positions
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Position Details" subName="HRM" />

      {/* Header with basic info */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Button variant="light" size="sm" onClick={handleBack} className="me-2">
                  <Icon icon="mdi:arrow-left" width={18} />
                </Button>
                <div
                  className="d-flex align-items-center justify-content-center rounded bg-primary text-white fw-bold"
                  style={{ width: 64, height: 64, fontSize: '1.5rem' }}
                >
                  <Icon icon="mingcute:briefcase-line" width={32} />
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1">{position.title}</h4>
                  <p className="text-muted mb-0">
                    {position.code}
                    <Badge className={`ms-2 ${position.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {position.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
                {canEditPosition() && (
                  <Button variant="primary" onClick={handleEdit}>
                    <Icon icon="mdi:pencil" className="me-1" width={18} />
                    Edit
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Basic Info Card */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title mb-0">
                <Icon icon="mdi:information-outline" className="me-2" width={20} />
                Basic Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="text-muted small d-block">Position Title</label>
                <span className="fw-medium">{position.title}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Code</label>
                <span>{position.code}</span>
              </div>
              <div>
                <label className="text-muted small d-block">Description</label>
                <span>{position.description || 'No description provided.'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Organization & Status Card */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title mb-0">
                <Icon icon="mdi:office-building-outline" className="me-2" width={20} />
                Organization & Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="text-muted small d-block">Organization Unit</label>
                <span>{position.orgUnitName || '—'}</span>
              </div>
              <div>
                <label className="text-muted small d-block">Status</label>
                <Badge className={position.is_active ? 'bg-success' : 'bg-secondary'}>
                  {position.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Audit Info Card */}
      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">
                <Icon icon="mdi:clock-outline" className="me-2" width={20} />
                Audit Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3 mb-md-0">
                  <label className="text-muted small d-block">Created</label>
                  <span>{formatDate(position.created_at)}</span>
                </Col>
                <Col md={6}>
                  <label className="text-muted small d-block">Last Updated</label>
                  <span>{formatDate(position.updated_at)}</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PositionDetailPage
