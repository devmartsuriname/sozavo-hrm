// LEGACY AUTH TYPES (Darkone fake backend)
// Currently not used by SupabaseAuthContext.
// Kept only for historical reference. Do not use for new code.
// New auth types are in src/types/supabase-auth.ts

export type UserType = {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  token: string
}
