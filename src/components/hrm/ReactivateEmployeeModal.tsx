/**
 * ReactivateEmployeeModal
 * Modal dialog for reactivating a terminated employee
 * Phase 4.2.1 implementation - Darkone-consistent styling
 */

import { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'

interface ReactivateEmployeeModalProps {
  show: boolean
  onClose: () => void
  onConfirm: (reactivationReason: string | null) => void
  employeeName: string
  employeeCode: string
  isReactivating: boolean
  /** If true, reason is required (HR Manager role or cooldown period) */
  requireReason?: boolean
}

export const ReactivateEmployeeModal: React.FC<ReactivateEmployeeModalProps> = ({
  show,
  onClose,
  onConfirm,
  employeeName,
  employeeCode,
  isReactivating,
  requireReason = false,
}) => {
  const [reactivationReason, setReactivationReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setReactivationReason('')
      setReasonError(null)
    }
  }, [show])

  const validateAndConfirm = () => {
    setReasonError(null)

    // Validate reason if required
    if (requireReason && !reactivationReason.trim()) {
      setReasonError('Reactivation reason is required.')
      return
    }

    // Validate max length
    if (reactivationReason.length > 500) {
      setReasonError('Reason must be 500 characters or less.')
      return
    }

    onConfirm(reactivationReason.trim() || null)
  }

  const handleClose = () => {
    if (!isReactivating) {
      onClose()
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered backdrop={isReactivating ? 'static' : true}>
      <Modal.Header closeButton={!isReactivating}>
        <Modal.Title>
          <Icon icon="mdi:account-reactivate" className="me-2" width={24} />
          Reactivate Employee
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          <Icon icon="mdi:information-outline" className="me-2" width={20} />
          <strong>You are about to reactivate:</strong>
          <br />
          {employeeName} ({employeeCode})
        </Alert>

        <p className="text-muted mb-3">
          This will restore the employee's active status. The original termination history will be preserved for audit purposes.
        </p>

        <Form.Group className="mb-3">
          <Form.Label>
            Reason for Reactivation
            {requireReason && <span className="text-danger ms-1">*</span>}
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter reason for reactivation (optional unless required by policy)"
            value={reactivationReason}
            onChange={(e) => setReactivationReason(e.target.value)}
            maxLength={500}
            isInvalid={!!reasonError}
            disabled={isReactivating}
          />
          {reasonError && (
            <div className="invalid-feedback d-block">{reasonError}</div>
          )}
          <Form.Text className="text-muted">
            {reactivationReason.length}/500 characters
            {requireReason && ' • Required for HR Managers or during cooldown period'}
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isReactivating}>
          Cancel
        </Button>
        <Button variant="primary" onClick={validateAndConfirm} disabled={isReactivating}>
          {isReactivating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Reactivating...
            </>
          ) : (
            <>
              <Icon icon="mdi:account-reactivate" className="me-1" width={18} />
              Reactivate Employee
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
