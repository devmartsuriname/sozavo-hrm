/**
 * HRM Organization Unit Edit Page
 * Edit form for updating organization unit details
 * Uses Darkone form patterns, respects RLS via authenticated session
 * Access: Admin, HR Manager (full), Manager (scoped to own org unit)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { useHrmOrgUnitDetail } from '@/hooks/useHrmOrgUnitDetail'
import { useHrmOrgUnits } from '@/hooks/useHrmOrgUnits'
import { useUpdateOrgUnit } from '@/hooks/useUpdateOrgUnit'
import { usePermissions } from '@/hooks/usePermissions'

interface FormData {
  name: string
  description: string
  parent_id: string
  is_active: boolean
}

interface FormErrors {
  name?: string
  parent_id?: string
}

const OrgUnitEditPage = () => {
  const { orgUnitId } = useParams<{ orgUnitId: string }>()
  const navigate = useNavigate()
  const { orgUnit, isLoading, error } = useHrmOrgUnitDetail(orgUnitId || '')
  const { orgUnits } = useHrmOrgUnits()
  const { update, isUpdating, updateError } = useUpdateOrgUnit()
  const { canEditOrgUnit } = usePermissions()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    parent_id: '',
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Populate form when org unit data loads
  useEffect(() => {
    if (orgUnit) {
      setFormData({
        name: orgUnit.name,
        description: orgUnit.description || '',
        parent_id: orgUnit.parent_id || '',
        is_active: orgUnit.is_active,
      })
    }
  }, [orgUnit])

  const handleBack = () => {
    navigate(`/hrm/org-units/${orgUnitId}`)
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

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    // Prevent self-parenting
    if (formData.parent_id === orgUnitId) {
      errors.parent_id = 'Organization unit cannot be its own parent'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !orgUnitId) return

    const result = await update(orgUnitId, {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      parent_id: formData.parent_id || null,
      is_active: formData.is_active,
    })

    if (result) {
      toast.success('Organization unit updated successfully')
      navigate(`/hrm/org-units/${orgUnitId}`)
    }
  }

  // Access guard: only Admin, HR Manager, and Manager can edit
  if (!canEditOrgUnit()) {
    return (
      <>
        <PageTitle title="Edit Organization Unit" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          You do not have permission to edit organization unit records.
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/org-units')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Organization Units
        </Button>
      </>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Edit Organization Unit" subName="HRM" />
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
        <PageTitle title="Edit Organization Unit" subName="HRM" />
        <Alert variant="warning">
          <Icon icon="mdi:alert-circle-outline" className="me-2" width={20} />
          {error}
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/org-units')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Organization Units
        </Button>
      </>
    )
  }

  // Not found state
  if (!orgUnit) {
    return (
      <>
        <PageTitle title="Edit Organization Unit" subName="HRM" />
        <Alert variant="info">
          <Icon icon="mdi:information-outline" className="me-2" width={20} />
          Organization unit not found or you do not have access to this record.
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/hrm/org-units')}>
          <Icon icon="mdi:arrow-left" className="me-1" width={18} />
          Back to Organization Units
        </Button>
      </>
    )
  }

  // Filter out current org unit from parent options to prevent self-reference
  const parentOptions = orgUnits.filter((ou) => ou.id !== orgUnitId)

  return (
    <>
      <PageTitle title="Edit Organization Unit" subName="HRM" />

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
                  <Icon icon="mdi:office-building-outline" width={32} />
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1">Edit: {orgUnit.name}</h4>
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
                  Organization Unit Details
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Code (Read-Only) */}
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control type="text" value={orgUnit.code} disabled readOnly />
                  <Form.Text className="text-muted">
                    Code is immutable and cannot be changed.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!formErrors.name}
                    placeholder="Enter organization unit name"
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback d-block">{formErrors.name}</div>
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

                <Form.Group className="mb-3">
                  <Form.Label>Parent Organization Unit</Form.Label>
                  <Form.Select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    isInvalid={!!formErrors.parent_id}
                  >
                    <option value="">— No parent (top-level unit) —</option>
                    {parentOptions.map((ou) => (
                      <option key={ou.id} value={ou.id}>
                        {ou.name} ({ou.code})
                      </option>
                    ))}
                  </Form.Select>
                  {formErrors.parent_id && (
                    <div className="invalid-feedback d-block">{formErrors.parent_id}</div>
                  )}
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

export default OrgUnitEditPage
