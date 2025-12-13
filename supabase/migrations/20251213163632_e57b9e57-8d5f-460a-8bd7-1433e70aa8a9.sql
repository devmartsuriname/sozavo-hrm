-- Phase 4.1: Manager Scoped RLS for Org Units & Positions
-- Allows Managers to SELECT and UPDATE records within their own org unit scope

-- =============================================================================
-- Step 1: Drop existing Manager policies (they currently deny all access)
-- =============================================================================

-- hrm_organization_units: Manager policies
DROP POLICY IF EXISTS "org_units_select_manager" ON public.hrm_organization_units;
DROP POLICY IF EXISTS "org_units_update_manager" ON public.hrm_organization_units;

-- hrm_positions: Manager policies
DROP POLICY IF EXISTS "positions_select_manager" ON public.hrm_positions;
DROP POLICY IF EXISTS "positions_update_manager" ON public.hrm_positions;

-- =============================================================================
-- Step 2: Create Manager scoped SELECT policies
-- =============================================================================

-- Manager can SELECT only their own org unit
CREATE POLICY "org_units_select_manager"
    ON public.hrm_organization_units
    FOR SELECT
    TO authenticated
    USING (
        public.user_is_manager(auth.uid()) 
        AND public.get_user_org_unit(auth.uid()) = id
    );

-- Manager can SELECT positions belonging to their org unit
CREATE POLICY "positions_select_manager"
    ON public.hrm_positions
    FOR SELECT
    TO authenticated
    USING (
        public.user_is_manager(auth.uid()) 
        AND org_unit_id = public.get_user_org_unit(auth.uid())
    );

-- =============================================================================
-- Step 3: Create Manager scoped UPDATE policies
-- =============================================================================

-- Manager can UPDATE only their own org unit
CREATE POLICY "org_units_update_manager"
    ON public.hrm_organization_units
    FOR UPDATE
    TO authenticated
    USING (
        public.user_is_manager(auth.uid()) 
        AND public.get_user_org_unit(auth.uid()) = id
    )
    WITH CHECK (
        public.user_is_manager(auth.uid()) 
        AND public.get_user_org_unit(auth.uid()) = id
    );

-- Manager can UPDATE positions belonging to their org unit
CREATE POLICY "positions_update_manager"
    ON public.hrm_positions
    FOR UPDATE
    TO authenticated
    USING (
        public.user_is_manager(auth.uid()) 
        AND org_unit_id = public.get_user_org_unit(auth.uid())
    )
    WITH CHECK (
        public.user_is_manager(auth.uid()) 
        AND org_unit_id = public.get_user_org_unit(auth.uid())
    );