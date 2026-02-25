-- Create content and submission tables for ReFAN.
-- Replaces localStorage-based store with persistent Supabase tables.

-- ============================================================
-- 1. STORIES
-- ============================================================
CREATE TABLE public.stories (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  excerpt    TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  image_url  TEXT,
  category   TEXT NOT NULL DEFAULT 'story' CHECK (category IN ('story', 'announcement')),
  date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Anyone can read stories
CREATE POLICY "Public read stories"
  ON public.stories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert
CREATE POLICY "Admin insert stories"
  ON public.stories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admin update stories"
  ON public.stories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admin delete stories"
  ON public.stories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2. BLOG POSTS
-- ============================================================
CREATE TABLE public.blog_posts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  excerpt    TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  image_url  TEXT,
  author     TEXT NOT NULL DEFAULT 'ReFAN Team',
  tags       TEXT[] NOT NULL DEFAULT '{}',
  date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blog_posts"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert blog_posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update blog_posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete blog_posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 3. GALLERY ITEMS
-- ============================================================
CREATE TABLE public.gallery_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
  date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery_items"
  ON public.gallery_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert gallery_items"
  ON public.gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update gallery_items"
  ON public.gallery_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete gallery_items"
  ON public.gallery_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. VOLUNTEER / SPONSOR SUBMISSIONS
-- ============================================================
CREATE TABLE public.volunteer_submissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'volunteer' CHECK (type IN ('volunteer', 'sponsor')),
  message    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public form)
CREATE POLICY "Public insert volunteer_submissions"
  ON public.volunteer_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "Admin read volunteer_submissions"
  ON public.volunteer_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 5. DONATION SUBMISSIONS
-- ============================================================
CREATE TABLE public.donation_submissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  amount     NUMERIC NOT NULL CHECK (amount > 0),
  message    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a donation record (public form)
CREATE POLICY "Public insert donation_submissions"
  ON public.donation_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read donation records
CREATE POLICY "Admin read donation_submissions"
  ON public.donation_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 6. SEED DATA (default stories and blog posts)
-- ============================================================
INSERT INTO public.stories (title, excerpt, content, category, date) VALUES
  ('Clean Water Reaches Okudu Village',
   'After months of effort, clean water now flows freely for 2,000 residents.',
   'Our clean water project in Okudu village has been completed successfully, providing access to clean water for over 2,000 residents. The borehole was drilled and fitted with a solar-powered pump system.',
   'story', '2026-01-15'),
  ('Back-to-School Drive 2026',
   'ReFAN distributes school supplies to 500 children across 3 communities.',
   'Our annual back-to-school drive was a tremendous success. We distributed books, uniforms, and stationery to 500 children in underserved communities.',
   'announcement', '2026-02-01');

INSERT INTO public.blog_posts (title, excerpt, content, author, tags, date) VALUES
  ('Why Community-Led Development Works',
   'When communities lead their own development, outcomes are sustainable and impactful.',
   'Community-led development has been at the heart of ReFAN''s approach since our founding. Research consistently shows that projects designed and owned by local communities are more sustainable.',
   'ReFAN Team', ARRAY['community', 'development'], '2026-01-20'),
  ('5 Ways You Can Support Rural Education',
   'Simple actions that create lasting change in rural classrooms.',
   'Education is the cornerstone of community development. Here are five practical ways you can support rural education initiatives and create lasting impact.',
   'ReFAN Team', ARRAY['education', 'volunteering'], '2026-02-05');

INSERT INTO public.gallery_items (title, url, type, date) VALUES
  ('Community Health Outreach', '', 'photo', '2026-01-10'),
  ('Education Workshop', '', 'photo', '2026-01-20'),
  ('Tree Planting Drive', '', 'photo', '2026-02-01');
