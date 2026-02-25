-- =============================================================================
-- RLS Policy Reference for public.user_roles
-- =============================================================================
--
-- This file documents the complete set of Row Level Security policies applied
-- to the user_roles table. It is NOT executed directly — the actual policies
-- live in the migration files under supabase/migrations/.
--
-- Table: public.user_roles
--   Columns: id (UUID PK), user_id (FK → auth.users), role (app_role enum)
--   RLS: ENABLED
--
-- Design principle:
--   The client (anon key) can NEVER modify user_roles. Only two paths can
--   write to this table:
--     1. The SECURITY DEFINER trigger `handle_new_user_role` — fires on
--        auth.users INSERT and grants the 'admin' role to whitelisted emails.
--     2. The service_role key (bypasses RLS entirely) — for manual admin
--        operations via the Supabase dashboard or server-side scripts.
--
-- =============================================================================

-- READ: authenticated users can see their own role row only.
-- (Migration: 20260220053340)
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- WRITE: all client-side mutations are explicitly denied.
-- (Migration: 20260221000000)
CREATE POLICY "No client inserts"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No client updates"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No client deletes"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- ANONYMOUS: no access at all.
-- (Migration: 20260221000000)
CREATE POLICY "No anonymous access"
ON public.user_roles
FOR SELECT
TO anon
USING (false);

-- =============================================================================
-- How admin roles are assigned
-- =============================================================================
--
-- A SECURITY DEFINER trigger on auth.users (AFTER INSERT) checks the new
-- user's email against a whitelist. If the email matches, it inserts a row
-- into user_roles with role = 'admin'. The trigger bypasses RLS because it
-- runs as the function owner (postgres), not as the authenticated user.
--
-- Whitelisted emails (see migration 20260221000001):
--   - refannetwork2022@gmail.com
--   - abdulshakurfawzan986@gmail.com
--
-- Email matching uses lower(trim(NEW.email)) so it is case-insensitive and
-- whitespace-tolerant. Whitelist literals must be stored in lowercase.
--
-- To add a new admin:
--   1. Update the handle_new_user_role() function to include the new email
--      (always lowercase), OR
--   2. Use the Supabase dashboard (service_role) to insert directly:
--      INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid>', 'admin');
--
-- =============================================================================
-- Client-side isAdmin check (useAuth hook)
-- =============================================================================
--
-- The React app checks admin status by querying:
--   supabase.from("user_roles").select("role").eq("user_id", id).eq("role", "admin")
--
-- This query hits the "Users can read own roles" policy, so a user can only
-- read their own row. A non-admin user gets zero rows back → isAdmin = false.
-- A user CANNOT read another user's role or fabricate an admin row.
--
-- The has_role() function (SECURITY DEFINER) is available for use in other
-- RLS policies if needed in the future.
-- =============================================================================
