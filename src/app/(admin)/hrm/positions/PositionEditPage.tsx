/**
 * HRM Position Edit Page
 * Edit form for updating position details
 * Uses Darkone form patterns, respects RLS via authenticated session
 * Access: Admin, HR Manager (full), Manager (scoped to positions in own org unit)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useHrmPositionDetail } from '@/hooks/useHrmPositionDetail'
import { useUpdatePosition } from '@/hooks/useUpdatePosition'
import { usePermissions } from '@/hooks/usePermissions'

interface FormData {
  title: string
  description: string
  is_active: boolean
}

interface FormErrors {
  title?: string
}

const PositionEditPage = () => {
  const { positionId } = useParams<{ positionId: string }>()
  const navigate = useNavigate()
  const { position, isLoading, error } = useHrmPositionDetail(positionId || '')
  const { update, isUpdating, updateError } = useUpdatePosition()
  const { canEditPosition } = usePermissions()

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Populate form when position data loads
  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title,
        description: position.description || '',
        is_active: position.is_active,
      })
    }
  }, [position])

  const handleBack = () => {
    navigate(`/hrm/positions/${positionId}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error when field changes
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !positionId) return

    const result = await update(positionId, {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      is_active: formData.is_active,
    })

    if (result) {
      toast.success('Position updated successfully')
      navigate(`/hrm/positions/${positionId}`)
    }
  }

  // Access guard: only Admin, HR Manager, and Manager can edit
  if (!canEditPosition()) {
    return (
      <>
        <PageTitle title="Edit Position" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          You do not have permission to edit position records.
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/positions')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Positions
        </Button>
      </>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Edit Position" subName="HRM" />
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
        <PageTitle title="Edit Position" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          {error}
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/positions')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Positions
        </Button>
      </>
    )
  }

  // Not found state
  if (!position) {
    return (
      <>
        <PageTitle title="Edit Position" subName="HRM" />
        <Alert variant="info">
          <Icon icon="mdi:information-outline" className="me-2" width={20} />
          Position not found or you do not have access to this record.
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/positions')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Positions
        </Button>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Edit Position" subName="HRM" />

      {/* Header */}
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
                  <h4 className="mb-1">Edit: {position.title}</h4>
                  <p className="text-muted mb-0">
                    {position.code}
                    <Badge className={`ms-2 ${position.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {position.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Error Alert */}
      {updateError && (
        <Alert variant="danger" className="mb-4">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          {updateError}
        </Alert>
      )}

      {/* Edit Form */}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="card-title mb-0">
                  <Icon icon="mdi:information-outline" className="me-2" width={20} />
                  Position Details
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Code (Read-Only) */}
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control type="text" value={position.code} disabled readOnly />
                  <Form.Text className="text-muted">
                    Code is immutable and cannot be changed.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    isInvalid={!!formErrors.title}
                    placeholder="Enter position title"
                  />
                  {formErrors.title && (
                    <div className="invalid-feedback d-block">{formErrors.title}</div>
                  )}
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description (optional)"
                  />
                </Form.Group>

                {/* Organization Unit (Read-Only) */}
                <Form.Group className="mb-3">
                  <Form.Label>Organization Unit</Form.Label>
                  <Form.Control type="text" value={position.orgUnitName || '—'} disabled readOnly />
                  <Form.Text className="text-muted">
                    Organization unit assignment cannot be changed.
                  </Form.Text>
                </Form.Group>

                {/* Is Active */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is_active"
                    name="is_active"
                    label={formData.is_active ? 'Active' : 'Inactive'}
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" className="me-1" width={18} />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={handleBack} disabled={isUpdating}>
                Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default PositionEditPage
