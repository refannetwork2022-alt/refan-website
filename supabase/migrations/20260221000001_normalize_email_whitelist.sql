-- Normalize email comparison in the admin whitelist trigger.
--
-- Problem: Supabase may store emails with varying case or leading/trailing
-- whitespace depending on the auth provider (email/password, Google OAuth,
-- etc.). A raw IN comparison like `NEW.email IN ('admin@example.com')` would
-- miss 'Admin@Example.com' or ' admin@example.com '.
--
-- Fix: compare using lower(trim(NEW.email)) against lowercase literals.
-- This ensures case-insensitive, whitespace-tolerant matching.

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(trim(NEW.email)) IN (
    'refannetwork2022@gmail.com',
    'abdulshakurfawzan986@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
