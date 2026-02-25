-- Newsletter subscribers table.
-- Stores email addresses from the public newsletter signup form.
-- The opt_in flag records explicit consent to receive updates.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    opt_in BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous/unauthenticated visitors) can subscribe.
-- The opt_in check ensures the form cannot submit without explicit consent.
CREATE POLICY "Allow newsletter insert with opt-in"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (opt_in = true);

-- Explicitly block all reads from clients.
CREATE POLICY "Block newsletter select"
ON public.newsletter_subscribers
FOR SELECT
TO anon, authenticated
USING (false);

-- Block updates from clients.
CREATE POLICY "Block newsletter update"
ON public.newsletter_subscribers
FOR UPDATE
TO anon, authenticated
USING (false);

-- Block deletes from clients.
CREATE POLICY "Block newsletter delete"
ON public.newsletter_subscribers
FOR DELETE
TO anon, authenticated
USING (false);
