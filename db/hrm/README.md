# HRM Database Schema

This folder contains all SQL definitions for the SoZaVo HRM system database.

## File Structure

| File | Purpose |
|------|---------|
| `enums.sql` | Custom PostgreSQL enum type definitions |
| `schema.sql` | Table definitions (structure only, no RLS) |
| `functions.sql` | Security definer functions for RLS |
| `rls_policies.sql` | Row-Level Security policies |

## Execution Order

Run files in this order when setting up a fresh database:

1. `enums.sql` — Creates enum types
2. `schema.sql` — Creates tables (depends on enums)
3. `functions.sql` — Creates helper functions (depends on tables)
4. `rls_policies.sql` — Enables RLS and creates policies (depends on functions)

## Conventions

- All HRM tables use `hrm_` prefix (except `user_roles` for RBAC)
- All objects are created in the `public` schema
- Scripts are idempotent where possible (safe to re-run)
- Foreign keys to `auth.users` reference `auth.users(id)`

## Related Documentation

- [HRM Backend Architecture](../../docs/hrm/HRM_Backend_Architecture.md)
- [HRM System Master Architecture](../../docs/hrm/HRM_System_Master_Architecture.md)
