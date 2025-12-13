-- Phase 4.2: Add terminated_by and termination_reason columns for audit trail
-- Also add manager-scoped UPDATE RLS policy for hrm_employees

-- 1. Add new columns to hrm_employees table
ALTER TABLE public.hrm_employees 
ADD COLUMN IF NOT EXISTS terminated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS termination_reason text;

-- 2. Add manager-scoped UPDATE policy for hrm_employees
-- Managers can update employees within their org unit only
DROP POLICY IF EXISTS "hrm_employees_update_manager" ON public.hrm_employees;
CREATE POLICY "hrm_employees_update_manager" ON public.hrm_employees
FOR UPDATE USING (
  user_is_manager(auth.uid()) AND 
  org_unit_id = get_user_org_unit(auth.uid())
)
WITH CHECK (
  user_is_manager(auth.uid()) AND 
  org_unit_id = get_user_org_unit(auth.uid())
);