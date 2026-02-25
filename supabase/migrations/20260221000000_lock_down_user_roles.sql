-- Lock down user_roles: no client-side INSERT, UPDATE, or DELETE.
-- Only the service role (bypasses RLS) or the SECURITY DEFINER trigger
-- (handle_new_user_role) can write to this table.

-- Drop any accidental permissive policies that may have been added
-- (safe to run even if they don't exist — DO NOTHING on error via IF EXISTS).

-- Explicit deny: authenticated users cannot insert their own roles
CREATE POLICY "No client inserts"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Explicit deny: authenticated users cannot update roles
CREATE POLICY "No client updates"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Explicit deny: authenticated users cannot delete roles
CREATE POLICY "No client deletes"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- Explicit deny: anonymous users cannot read roles
CREATE POLICY "No anonymous access"
ON public.user_roles
FOR SELECT
TO anon
USING (false);
