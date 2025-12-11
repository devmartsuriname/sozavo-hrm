/**
 * Hook for loading dropdown options for the Employee Edit Form.
 * Fetches org units, positions, and employees (for manager dropdown).
 * RLS determines visibility of each option set.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useSupabaseAuth } from '@/context/SupabaseAuthContext'

export interface FormOption {
  value: string
  label: string
}

interface UseEmployeeFormOptionsReturn {
  orgUnits: FormOption[]
  positions: FormOption[]
  employees: FormOption[]
  isLoading: boolean
  error: string | null
}

export function useEmployeeFormOptions(): UseEmployeeFormOptionsReturn {
  const { status } = useSupabaseAuth()
  const [orgUnits, setOrgUnits] = useState<FormOption[]>([])
  const [positions, setPositions] = useState<FormOption[]>([])
  const [employees, setEmployees] = useState<FormOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') {
      setIsLoading(false)
      return
    }

    const fetchOptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [orgUnitsRes, positionsRes, employeesRes] = await Promise.all([
          supabase
            .from('hrm_organization_units')
            .select('id, name')
            .eq('is_active', true)
            .order('name'),
          supabase
            .from('hrm_positions')
            .select('id, title')
            .eq('is_active', true)
            .order('title'),
          supabase
            .from('hrm_employees')
            .select('id, first_name, last_name, employee_code')
            .eq('is_active', true)
            .order('last_name'),
        ])

        // Map results to dropdown options
        if (!orgUnitsRes.error && orgUnitsRes.data) {
          setOrgUnits(
            orgUnitsRes.data.map((ou) => ({
              value: ou.id,
              label: ou.name,
            }))
          )
        }

        if (!positionsRes.error && positionsRes.data) {
          setPositions(
            positionsRes.data.map((p) => ({
              value: p.id,
              label: p.title,
            }))
          )
        }

        if (!employeesRes.error && employeesRes.data) {
          setEmployees(
            employeesRes.data.map((e) => ({
              value: e.id,
              label: `${e.first_name} ${e.last_name} (${e.employee_code})`,
            }))
          )
        }
      } catch (err) {
        console.error('Error loading form options:', err)
        setError('Failed to load form options')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [status])

  return {
    orgUnits,
    positions,
    employees,
    isLoading,
    error,
  }
}
