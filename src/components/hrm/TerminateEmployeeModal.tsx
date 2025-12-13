/**
 * TerminateEmployeeModal Component
 * Modal for terminating an employee with confirmation and reason input.
 * Uses Darkone modal pattern with Flatpickr date picker.
 * Phase 4.2 implementation
 */

import { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

interface TerminateEmployeeModalProps {
  show: boolean
  onClose: () => void
  onConfirm: (terminationDate: string, terminationReason: string | null) => Promise<void>
  employeeName: string
  employeeCode: string
  isTerminating: boolean
}

export function TerminateEmployeeModal({
  show,
  onClose,
  onConfirm,
  employeeName,
  employeeCode,
  isTerminating,
}: TerminateEmployeeModalProps) {
  const [terminationDate, setTerminationDate] = useState<Date | null>(null)
  const [terminationReason, setTerminationReason] = useState('')
  const [dateError, setDateError] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setTerminationDate(new Date())
      setTerminationReason('')
      setDateError(null)
    }
  }, [show])

  const validateDate = (): boolean => {
    if (!terminationDate) {
      setDateError('Termination date is required.')
      return false
    }
    
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    if (terminationDate > today) {
      setDateError('Termination date cannot be in the future.')
      return false
    }
    
    setDateError(null)
    return true
  }

  const handleConfirm = async () => {
    if (!validateDate()) return
    
    const dateStr = terminationDate!.toISOString().split('T')[0]
    const reason = terminationReason.trim() || null
    
    await onConfirm(dateStr, reason)
  }

  const handleClose = () => {
    if (!isTerminating) {
      onClose()
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-bottom bg-danger bg-opacity-10">
        <Modal.Title className="d-flex align-items-center gap-2 text-danger">
          <Icon icon="mdi:account-remove" width={24} />
          <span>Terminate Employee</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Warning message */}
        <Alert variant="warning" className="d-flex align-items-start gap-2">
          <Icon icon="mdi:alert" width={24} className="flex-shrink-0 mt-1" />
          <div>
            <strong>This action will archive the employee record.</strong>
            <p className="mb-0 mt-1">
              The employee <strong>{employeeName}</strong> ({employeeCode}) will be marked as 
              terminated and their account access will be revoked. This action can be reversed 
              by an administrator.
            </p>
          </div>
        </Alert>

        {/* Termination Date */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-medium">
            Termination Date <span className="text-danger">*</span>
          </Form.Label>
          <Flatpickr
            value={terminationDate || undefined}
            onChange={(dates) => {
              setTerminationDate(dates[0] || null)
              setDateError(null)
            }}
            options={{
              dateFormat: 'Y-m-d',
              maxDate: 'today',
              allowInput: true,
            }}
            className={`form-control ${dateError ? 'is-invalid' : ''}`}
            placeholder="Select termination date"
            disabled={isTerminating}
          />
          {dateError && (
            <Form.Text className="text-danger">{dateError}</Form.Text>
          )}
        </Form.Group>

        {/* Termination Reason */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-medium">
            Termination Reason <span className="text-muted">(optional)</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            placeholder="Enter reason for termination (e.g., resignation, contract end, performance)"
            disabled={isTerminating}
            maxLength={500}
          />
          <Form.Text className="text-muted">
            {terminationReason.length}/500 characters. This will be stored for audit purposes.
          </Form.Text>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button variant="outline-secondary" onClick={handleClose} disabled={isTerminating}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={isTerminating || !terminationDate}
        >
          {isTerminating ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              <Icon icon="mdi:account-remove" width={18} className="me-1" />
              Terminate Employee
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
