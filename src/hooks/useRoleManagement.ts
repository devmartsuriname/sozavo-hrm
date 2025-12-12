/**
 * useRoleManagement Hook
 * Manages role assignment and user-employee linking state for the Role Manager modal.
 * Phase 3 – Step 3.2
 */

import { useState, useCallback, useMemo } from 'react'
import type { AppRole } from '@/types/supabase-auth'
import type { HrmUserWithRoles } from '@/types/hrm-users'
import {
  assignRole,
  removeRole,
  linkUserToEmployee,
  unlinkUserFromEmployee,
} from '@/services/hrmUserService'

interface UseRoleManagementProps {
  user: HrmUserWithRoles
  onSuccess: () => void
}

interface UseRoleManagementReturn {
  // State
  selectedRoles: AppRole[]
  selectedEmployeeId: string | null
  isSaving: boolean
  validationError: string | null
  
  // Actions
  toggleRole: (role: AppRole) => void
  setSelectedEmployeeId: (employeeId: string | null) => void
  saveChanges: () => Promise<void>
  resetState: () => void
  
  // Derived
  hasChanges: boolean
  canSave: boolean
}

const ALL_ROLES: AppRole[] = ['admin', 'hr_manager', 'manager', 'employee']

export function useRoleManagement({
  user,
  onSuccess,
}: UseRoleManagementProps): UseRoleManagementReturn {
  // Local state for editing
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>(user.roles)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(user.employeeId)
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Toggle a role on/off
  const toggleRole = useCallback((role: AppRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role]
      }
    })
    // Clear validation error when user makes changes
    setValidationError(null)
  }, [])

  // Reset state to original values
  const resetState = useCallback(() => {
    setSelectedRoles(user.roles)
    setSelectedEmployeeId(user.employeeId)
    setValidationError(null)
  }, [user.roles, user.employeeId])

  // Check if there are changes
  const hasChanges = useMemo(() => {
    const rolesChanged = 
      selectedRoles.length !== user.roles.length ||
      !selectedRoles.every(r => user.roles.includes(r))
    const employeeChanged = selectedEmployeeId !== user.employeeId
    return rolesChanged || employeeChanged
  }, [selectedRoles, selectedEmployeeId, user.roles, user.employeeId])

  // Validate: users with roles must be linked to an employee
  const validate = useCallback((): boolean => {
    if (selectedRoles.length > 0 && !selectedEmployeeId) {
      setValidationError('Users with roles must be linked to an employee record.')
      return false
    }
    setValidationError(null)
    return true
  }, [selectedRoles, selectedEmployeeId])

  // Can save: has changes and passes validation
  const canSave = useMemo(() => {
    // Check business rule: roles require employee link
    if (selectedRoles.length > 0 && !selectedEmployeeId) {
      return false
    }
    return hasChanges
  }, [hasChanges, selectedRoles, selectedEmployeeId])

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!validate()) {
      return
    }

    setIsSaving(true)

    try {
      // Compute role diff
      const rolesToAdd = selectedRoles.filter(r => !user.roles.includes(r))
      const rolesToRemove = user.roles.filter(r => !selectedRoles.includes(r))

      // Apply role changes
      for (const role of rolesToAdd) {
        await assignRole(user.userId, role)
      }
      for (const role of rolesToRemove) {
        await removeRole(user.userId, role)
      }

      // Handle employee linking
      if (selectedEmployeeId !== user.employeeId) {
        if (selectedEmployeeId) {
          await linkUserToEmployee(user.userId, selectedEmployeeId)
        } else {
          // Only unlink if no roles (validated above)
          await unlinkUserFromEmployee(user.userId)
        }
      }

      onSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save changes'
      setValidationError(message)
    } finally {
      setIsSaving(false)
    }
  }, [selectedRoles, selectedEmployeeId, user, validate, onSuccess])

  return {
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
  }
}

export { ALL_ROLES }
