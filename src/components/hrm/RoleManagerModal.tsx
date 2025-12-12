/**
 * RoleManagerModal Component
 * Modal for managing user roles and employee linking.
 * Admin: Full edit access | HR Manager: Read-only view
 * Phase 3 – Step 3.2
 */

import { Modal, Button, Form, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { AppRole } from '@/types/supabase-auth'
import type { HrmUserWithRoles } from '@/types/hrm-users'
import { useRoleManagement, ALL_ROLES } from '@/hooks/useRoleManagement'

interface EmployeeOption {
  id: string
  code: string
  name: string
  orgUnitName: string | null
}

interface RoleManagerModalProps {
  show: boolean
  onClose: () => void
  user: HrmUserWithRoles
  employees: EmployeeOption[]
  isAdmin: boolean
  isHRManager: boolean
  onSave: () => void
}

// Role display configuration
const ROLE_CONFIG: Record<AppRole, { label: string; variant: string; icon: string }> = {
  admin: { label: 'Administrator', variant: 'danger', icon: 'mingcute:shield-star-line' },
  hr_manager: { label: 'HR Manager', variant: 'primary', icon: 'mingcute:user-setting-line' },
  manager: { label: 'Manager', variant: 'info', icon: 'mingcute:user-star-line' },
  employee: { label: 'Employee', variant: 'secondary', icon: 'mingcute:user-3-line' },
}

export function RoleManagerModal({
  show,
  onClose,
  user,
  employees,
  isAdmin,
  isHRManager,
  onSave,
}: RoleManagerModalProps) {
  const {
    selectedRoles,
    selectedEmployeeId,
    isSaving,
    validationError,
    toggleRole,
    setSelectedEmployeeId,
    saveChanges,
    resetState,
    hasChanges,
    canSave,
  } = useRoleManagement({
    user,
    onSuccess: () => {
      onSave()
      onClose()
    },
  })

  // Determine if controls should be disabled (read-only for HR Manager)
  const isReadOnly = !isAdmin

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleSave = async () => {
    await saveChanges()
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Icon icon="mingcute:user-setting-line" width={24} />
          <span>Manage Roles & Linking</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* User Info Header */}
        <div className="mb-4 p-3 bg-light rounded">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-semibold"
              style={{ width: 48, height: 48, fontSize: '1.25rem' }}
            >
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h6 className="mb-0">{user.email || 'Unknown User'}</h6>
              <small className="text-muted">ID: {user.userId}</small>
            </div>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <Alert variant="danger" className="d-flex align-items-center gap-2">
            <Icon icon="mingcute:warning-line" width={20} />
            {validationError}
          </Alert>
        )}

        {/* Read-only notice for HR Manager */}
        {isReadOnly && (
          <Alert variant="info" className="d-flex align-items-center gap-2">
            <Icon icon="mingcute:information-line" width={20} />
            You have read-only access. Only administrators can modify roles and linking.
          </Alert>
        )}

        <Row>
          {/* Left Column: Role Checkboxes */}
          <Col md={6}>
            <h6 className="mb-3 d-flex align-items-center gap-2">
              <Icon icon="mingcute:shield-line" width={18} />
              Assigned Roles
            </h6>
            <div className="d-flex flex-column gap-2">
              {ALL_ROLES.map(role => {
                const config = ROLE_CONFIG[role]
                const isChecked = selectedRoles.includes(role)
                return (
                  <Form.Check
                    key={role}
                    type="checkbox"
                    id={`role-${role}`}
                    disabled={isReadOnly || isSaving}
                    checked={isChecked}
                    onChange={() => toggleRole(role)}
                    label={
                      <span className="d-flex align-items-center gap-2">
                        <Icon icon={config.icon} width={18} />
                        <Badge bg={config.variant} className="px-2 py-1">
                          {config.label}
                        </Badge>
                      </span>
                    }
                  />
                )
              })}
            </div>

            {/* Current roles count */}
            <div className="mt-3 text-muted small">
              {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
            </div>
          </Col>

          {/* Right Column: Employee Linking */}
          <Col md={6}>
            <h6 className="mb-3 d-flex align-items-center gap-2">
              <Icon icon="mingcute:link-line" width={18} />
              Linked Employee
            </h6>

            <Form.Group>
              <Form.Select
                value={selectedEmployeeId || ''}
                onChange={e => setSelectedEmployeeId(e.target.value || null)}
                disabled={isReadOnly || isSaving}
                className={!selectedEmployeeId && selectedRoles.length > 0 ? 'border-danger' : ''}
              >
                <option value="">— No employee linked —</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.code} — {emp.name}
                    {emp.orgUnitName ? ` (${emp.orgUnitName})` : ''}
                  </option>
                ))}
              </Form.Select>
              {selectedRoles.length > 0 && !selectedEmployeeId && (
                <Form.Text className="text-danger">
                  Users with roles must be linked to an employee.
                </Form.Text>
              )}
            </Form.Group>

            {/* Current linked employee info */}
            {selectedEmployeeId && (
              <div className="mt-3 p-2 bg-light rounded">
                <small className="text-muted">Currently linked:</small>
                <div className="fw-medium">
                  {employees.find(e => e.id === selectedEmployeeId)?.name || 'Unknown'}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button variant="outline-secondary" onClick={handleClose} disabled={isSaving}>
          {isReadOnly ? 'Close' : 'Cancel'}
        </Button>
        {!isReadOnly && (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="mingcute:check-line" width={18} className="me-1" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}
