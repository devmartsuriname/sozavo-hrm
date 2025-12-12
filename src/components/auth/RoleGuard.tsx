/**
 * RoleGuard Component
 * Conditional rendering based on user roles
 * Phase 3 – Step 3.3: Permission Utilities
 */

import { ReactNode } from 'react'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'
import type { AppRole } from '@/types/supabase-auth'

interface RoleGuardProps {
  /**
   * Roles that are allowed to see the children.
   * If user has ANY of these roles, children will be rendered.
   */
  allowedRoles: AppRole[]
  
  /**
   * Content to render if user has permission
   */
  children: ReactNode
  
  /**
   * Optional fallback content if user doesn't have permission.
   * Defaults to null (render nothing).
   */
  fallback?: ReactNode
}

/**
 * Conditionally renders children based on user's roles.
 * If the current user has ANY of the allowedRoles, children are rendered.
 * Otherwise, fallback is rendered (defaults to null).
 * 
 * @example
 * // Only show for admins
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 * 
 * @example
 * // Show for admin or HR manager, with fallback
 * <RoleGuard 
 *   allowedRoles={['admin', 'hr_manager']} 
 *   fallback={<p>Access denied</p>}
 * >
 *   <RestrictedContent />
 * </RoleGuard>
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleGuardProps) {
  const { roles, status } = useSupabaseAuth()
  
  // Don't render anything while still checking auth
  if (status === 'checking' || status === 'idle') {
    return null
  }
  
  // Check if user has any of the allowed roles
  const hasPermission = roles.some(role => allowedRoles.includes(role))
  
  if (hasPermission) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

export default RoleGuard
