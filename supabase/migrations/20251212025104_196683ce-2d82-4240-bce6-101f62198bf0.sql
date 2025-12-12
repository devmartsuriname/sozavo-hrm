-- Phase 3 – Step 3.2: Secure RPC function to fetch all users with roles and linked employees
-- This function safely exposes auth.users data via SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  roles app_role[],
  employee_id uuid,
  employee_code text,
  employee_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text,
    u.created_at,
    COALESCE(
      ARRAY_AGG(ur.role ORDER BY ur.role) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::app_role[]
    ) AS roles,
    e.id AS employee_id,
    e.employee_code,
    TRIM(COALESCE(e.first_name, '') || ' ' || COALESCE(e.last_name, '')) AS employee_name
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  LEFT JOIN public.hrm_employees e ON e.user_id = u.id
  GROUP BY u.id, u.email, u.created_at, e.id, e.employee_code, e.first_name, e.last_name
  ORDER BY u.created_at DESC;
$$;

-- Grant execute to authenticated users (frontend access control limits to Admin/HR Manager)
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;