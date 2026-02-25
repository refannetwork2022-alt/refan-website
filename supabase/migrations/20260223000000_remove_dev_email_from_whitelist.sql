-- Remove developer email from admin whitelist.
-- Only refannetwork2022@gmail.com should be auto-assigned admin role.

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(trim(NEW.email)) IN (
    'refannetwork2022@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Also remove dev user's admin role if it exists
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE lower(trim(email)) = 'abdulshakurfawzan986@gmail.com'
);
