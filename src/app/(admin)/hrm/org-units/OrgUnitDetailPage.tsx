/**
 * HRM Organization Unit Detail Page
 * Read-only view of a single organization unit's profile
 * Uses Darkone card patterns, respects RLS via authenticated session
 * Access restricted to Admin and HR Manager roles (Phase 3 – Step 3.3)
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Badge, Card, Col, Row, Spinner, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageTitle from '@/components/PageTitle'
import { useHrmOrgUnitDetail } from '@/hooks/useHrmOrgUnitDetail'
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

const OrgUnitDetailPage = () => {
  const { orgUnitId } = useParams<{ orgUnitId: string }>()
  const navigate = useNavigate()
  const { orgUnit, isLoading, error } = useHrmOrgUnitDetail(orgUnitId || '')
  const { canViewHRMData } = usePermissions()

  const handleBack = () => {
    navigate('/hrm/org-units')
  }

  // Access guard: only Admin and HR Manager can view
  if (!canViewHRMData()) {
    return (
      <>
        <PageTitle title="Organization Unit Details" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          You do not have permission to view organization unit details.
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
        <PageTitle title="Organization Unit Details" subName="HRM" />
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
        <PageTitle title="Organization Unit Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="warning">
              <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
              {error}
            </Alert>
            <Button variant="secondary" onClick={handleBack}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Organization Units
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  // Not found state
  if (!orgUnit) {
    return (
      <>
        <PageTitle title="Organization Unit Details" subName="HRM" />
        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <Icon icon="mdi:information-outline" className="me-2" width={20} />
              Organization unit not found or you do not have access to this record.
            </Alert>
            <Button variant="secondary" onClick={handleBack}>
              <Icon icon="mdi:arrow-left" className="me-1" width={18} />
              Back to Organization Units
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Organization Unit Details" subName="HRM" />

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
                  <Icon icon="mdi:office-building-outline" width={32} />
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1">{orgUnit.name}</h4>
                  <p className="text-muted mb-0">
                    {orgUnit.code}
                    <Badge className={`ms-2 ${orgUnit.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {orgUnit.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
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
                <label className="text-muted small d-block">Name</label>
                <span className="fw-medium">{orgUnit.name}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Code</label>
                <span>{orgUnit.code}</span>
              </div>
              <div>
                <label className="text-muted small d-block">Description</label>
                <span>{orgUnit.description || 'No description provided.'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Hierarchy & Status Card */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title mb-0">
                <Icon icon="mdi:sitemap-outline" className="me-2" width={20} />
                Hierarchy & Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="text-muted small d-block">Parent Organization Unit</label>
                <span>{orgUnit.parentOrgUnitName || '— (Top-level unit)'}</span>
              </div>
              <div>
                <label className="text-muted small d-block">Status</label>
                <Badge className={orgUnit.is_active ? 'bg-success' : 'bg-secondary'}>
                  {orgUnit.is_active ? 'Active' : 'Inactive'}
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
                  <span>{formatDate(orgUnit.created_at)}</span>
                </Col>
                <Col md={6}>
                  <label className="text-muted small d-block">Last Updated</label>
                  <span>{formatDate(orgUnit.updated_at)}</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrgUnitDetailPage
