# HRM Bootstrap Instructions

This document provides step-by-step instructions for initializing the HRM database in Supabase.

## Prerequisites

Before running the bootstrap script, ensure the following:

### 1. Test Users Exist in Supabase Auth

The following 4 test users must be created in Supabase Authentication before running the bootstrap:

| Email | Role | UUID |
|-------|------|------|
| `admin@sozavo.sr` | Admin | `185e5b0b-2d3c-4245-a0e3-8c07623c8ad4` |
| `hr.manager@sozavo.sr` | HR Manager | `4231ee5a-2bc8-47b0-93a0-c9fd172c24e3` |
| `manager@sozavo.sr` | Manager | `a6bffd30-455c-491e-87cf-7a41d5f4fffe` |
| `employee@sozavo.sr` | Employee | `8628fd46-b774-4b5f-91fc-3a8e1ba56d9a` |

**To verify users exist:**
1. Go to [Supabase Authentication](https://supabase.com/dashboard/project/rroawstekhvirwfgjqyd/auth/users)
2. Check that all 4 users are listed

### 2. Correct Supabase Project

Ensure you are working in the correct Supabase project:
- **Project ID**: `rroawstekhvirwfgjqyd`
- **Project Name**: SoZaVo HRM

---

## How to Run the Full Bootstrap

### Step 1: Open Supabase SQL Editor

Navigate to: https://supabase.com/dashboard/project/rroawstekhvirwfgjqyd/sql/new

### Step 2: Open the Bootstrap Script

In the Lovable repository, open the file:
```
db/hrm/bootstrap_hrm_full.sql
```

### Step 3: Copy the Entire File Content

Select all content (Ctrl+A / Cmd+A) and copy (Ctrl+C / Cmd+C).

### Step 4: Paste into SQL Editor

Paste the content into the Supabase SQL Editor.

### Step 5: Run the Script

Click the **Run** button (or press Ctrl+Enter / Cmd+Enter).

### Step 6: Verify Success

The script should complete with "Success. No rows returned."

---

## Alternative: Schema-Only Bootstrap

If you want to initialize only the database structure (no test data), use:
```
db/hrm/bootstrap_hrm_schema_only.sql
```

This creates:
- ✅ 5 enum types
- ✅ 4 tables
- ✅ 12 functions
- ✅ 48 RLS policies
- ❌ No role seeds
- ❌ No HRM test data

---

## Verification Queries

After running the bootstrap, execute these queries to verify success:

### Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'hrm_employees', 'hrm_positions', 'hrm_organization_units');
```

**Expected result:** 4 rows (one for each table)

### Check Enum Types Exist

```sql
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

**Expected result:** 5 rows (`app_role`, `employment_status`, `leave_status`, `attendance_status`, `document_type`)

### Check Functions Exist

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Expected result:** 12 functions

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'hrm_employees', 'hrm_positions', 'hrm_organization_units');
```

**Expected result:** All 4 tables should show `rowsecurity = true`

### Check Seed Data (Full Bootstrap Only)

```sql
-- Role assignments
SELECT COUNT(*) AS role_count FROM public.user_roles;
-- Expected: 4

-- Employees
SELECT COUNT(*) AS employee_count FROM public.hrm_employees;
-- Expected: 4

-- Organization units
SELECT COUNT(*) AS org_unit_count FROM public.hrm_organization_units;
-- Expected: 3

-- Positions
SELECT COUNT(*) AS position_count FROM public.hrm_positions;
-- Expected: 4
```

---

## Common Errors & Troubleshooting

### Error: Foreign Key Violation on `user_roles`

```
ERROR: insert or update on table "user_roles" violates foreign key constraint "user_roles_user_id_fkey"
```

**Cause:** The test user UUIDs don't exist in `auth.users`.

**Fix:** Create the 4 test users in Supabase Authentication with the exact UUIDs specified in the prerequisites.

### Error: Relation Already Exists

```
ERROR: relation "user_roles" already exists
```

**Cause:** This shouldn't happen because the script uses `CREATE TABLE IF NOT EXISTS`.

**Fix:** The script is idempotent, so re-running should work. If not, manually drop the tables and re-run.

### Error: Policy Already Exists

This error should NOT occur because the bootstrap script uses `DROP POLICY IF EXISTS` before each `CREATE POLICY`.

If you see this error, ensure you're running the bootstrap script, not the original `rls_policies.sql`.

### Script Runs But No Data

If the verification queries show 0 rows for seed data:

1. Check that you ran `bootstrap_hrm_full.sql` (not `bootstrap_hrm_schema_only.sql`)
2. Check for silent errors by reviewing the query output panel
3. Ensure the test users exist in `auth.users`

---

## Re-Running the Script

The bootstrap script is **idempotent** (safe to run multiple times):

- **Enums**: Use `IF NOT EXISTS` pattern
- **Tables**: Use `CREATE TABLE IF NOT EXISTS`
- **Functions**: Use `CREATE OR REPLACE`
- **RLS Policies**: Use `DROP POLICY IF EXISTS` before `CREATE POLICY`
- **Seed Data**: Use `INSERT ... WHERE NOT EXISTS`

You can re-run the script at any time without causing errors or duplicating data.

---

## Available Bootstrap Scripts

| File | Purpose |
|------|---------|
| `db/hrm/bootstrap_hrm_full.sql` | Complete setup with test data |
| `db/hrm/bootstrap_hrm_schema_only.sql` | Schema only (no seeds) |

---

## Quick Reference

1. Open: https://supabase.com/dashboard/project/rroawstekhvirwfgjqyd/sql/new
2. Copy entire content of `db/hrm/bootstrap_hrm_full.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify with queries above
