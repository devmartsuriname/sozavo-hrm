# Restore Point — Phase 4 Step 4.1: Org Unit & Position Edit Forms

**Created**: 2025-12-13
**Purpose**: Rollback point before implementing Manager scoped RLS and edit forms

## Current RLS Policies (Before Change)

### hrm_organization_units

| Policy Name | Command | Condition |
|-------------|---------|-----------|
| org_units_select_admin | SELECT | user_is_admin(auth.uid()) |
| org_units_select_hr | SELECT | user_is_hr_manager(auth.uid()) |
| org_units_select_manager | SELECT | FALSE (denied) |
| org_units_select_employee | SELECT | FALSE (denied) |
| org_units_update_admin | UPDATE | user_is_admin(auth.uid()) |
| org_units_update_hr | UPDATE | user_is_hr_manager(auth.uid()) |
| org_units_update_manager | UPDATE | FALSE (denied) |
| org_units_update_employee | UPDATE | FALSE (denied) |

### hrm_positions

| Policy Name | Command | Condition |
|-------------|---------|-----------|
| positions_select_admin | SELECT | user_is_admin(auth.uid()) |
| positions_select_hr | SELECT | user_is_hr_manager(auth.uid()) |
| positions_select_manager | SELECT | FALSE (denied) |
| positions_select_employee | SELECT | FALSE (denied) |
| positions_update_admin | UPDATE | user_is_admin(auth.uid()) |
| positions_update_hr | UPDATE | user_is_hr_manager(auth.uid()) |
| positions_update_manager | UPDATE | FALSE (denied) |
| positions_update_employee | UPDATE | FALSE (denied) |

## Affected Routes (Before Change)

| Route | Page Component | State |
|-------|----------------|-------|
| /hrm/org-units | OrgUnitsPage.tsx | Read-only listing |
| /hrm/org-units/:orgUnitId | OrgUnitDetailPage.tsx | Read-only detail |
| /hrm/positions | PositionsPage.tsx | Read-only listing |
| /hrm/positions/:positionId | PositionDetailPage.tsx | Read-only detail |

## Changes Introduced in Phase 4.1

1. **RLS Policy Updates**:
   - Manager scoped SELECT for org units: `user_is_manager(auth.uid()) AND get_user_org_unit(auth.uid()) = id`
   - Manager scoped SELECT for positions: `user_is_manager(auth.uid()) AND org_unit_id = get_user_org_unit(auth.uid())`
   - Manager scoped UPDATE with same conditions

2. **New Routes**:
   - `/hrm/org-units/:orgUnitId/edit` → OrgUnitEditPage.tsx
   - `/hrm/positions/:positionId/edit` → PositionEditPage.tsx

3. **Service Layer**:
   - Added `updateOrgUnit()` to hrmOrgUnitService.ts
   - Added `updatePosition()` to hrmPositionService.ts

4. **New Hooks**:
   - `useUpdateOrgUnit.ts`
   - `useUpdatePosition.ts`

5. **New Components**:
   - `OrgUnitFormBase.tsx`
   - `PositionFormBase.tsx`

6. **Permission Updates**:
   - Added `canEditOrgUnit()` to usePermissions.ts
   - Added `canEditPosition()` to usePermissions.ts

## Rollback Steps

1. **Revert RLS Policies**: Re-run original policies from db/hrm/rls_policies.sql (pre-Phase 4.1 version)
2. **Remove New Routes**: Delete edit route entries from src/routes/index.tsx
3. **Remove New Files**:
   - src/app/(admin)/hrm/org-units/OrgUnitEditPage.tsx
   - src/app/(admin)/hrm/positions/PositionEditPage.tsx
   - src/components/hrm/OrgUnitFormBase.tsx
   - src/components/hrm/PositionFormBase.tsx
   - src/hooks/useUpdateOrgUnit.ts
   - src/hooks/useUpdatePosition.ts
4. **Revert Detail Pages**: Remove Edit buttons from OrgUnitDetailPage.tsx and PositionDetailPage.tsx
5. **Revert usePermissions.ts**: Remove canEditOrgUnit and canEditPosition functions
6. **Revert Service Files**: Remove updateOrgUnit and updatePosition functions

## Notes

- Code fields remain immutable (read-only in forms)
- org_unit_id on positions is read-only for all roles
- Self-parenting validation enforced in UI for org units
