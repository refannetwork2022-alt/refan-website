-- Create remaining tables: announcements, contact_messages, members
-- These were previously stored only in localStorage.

-- ============================================================
-- 1. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE public.announcements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  content        TEXT NOT NULL DEFAULT '',
  image_url      TEXT,
  donation_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read announcements"
  ON public.announcements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2. CONTACT MESSAGES
-- ============================================================
CREATE TABLE public.contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message (public form)
CREATE POLICY "Public insert contact_messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "Admin read contact_messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete messages
CREATE POLICY "Admin delete contact_messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 3. MEMBERS
-- ============================================================
CREATE TABLE public.members (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reg_number           TEXT NOT NULL UNIQUE,
  surname              TEXT NOT NULL,
  first_name           TEXT NOT NULL,
  other_name           TEXT NOT NULL DEFAULT '',
  country_of_origin    TEXT NOT NULL DEFAULT '',
  country_of_residence TEXT NOT NULL DEFAULT '',
  unhcr_id             TEXT NOT NULL DEFAULT '',
  phone                TEXT NOT NULL DEFAULT '',
  phone_code           TEXT NOT NULL DEFAULT '',
  gender               TEXT NOT NULL DEFAULT '',
  marital_status       TEXT NOT NULL DEFAULT '',
  date_of_birth        TEXT NOT NULL DEFAULT '',
  family_size          INTEGER NOT NULL DEFAULT 1,
  photo                TEXT NOT NULL DEFAULT '',
  document             TEXT NOT NULL DEFAULT '',
  payment_currency     TEXT NOT NULL DEFAULT '',
  payment_amount       NUMERIC NOT NULL DEFAULT 0,
  registration_date    TEXT NOT NULL DEFAULT '',
  expiry_date          TEXT NOT NULL DEFAULT '',
  branch_name          TEXT NOT NULL DEFAULT '',
  username             TEXT NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Only admins can read members
CREATE POLICY "Admin read members"
  ON public.members FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert members
CREATE POLICY "Admin insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update members
CREATE POLICY "Admin update members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete members
CREATE POLICY "Admin delete members"
  ON public.members FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. ADD MISSING COLUMNS to existing tables
-- ============================================================

-- volunteer_submissions needs country and date columns
ALTER TABLE public.volunteer_submissions
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS date TEXT NOT NULL DEFAULT '';

-- donation_submissions needs currency and date columns
ALTER TABLE public.donation_submissions
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS date TEXT NOT NULL DEFAULT '';

-- ============================================================
-- 5. SEED DEFAULT ANNOUNCEMENTS
-- ============================================================
INSERT INTO public.announcements (title, content, image_url, donation_count) VALUES
  ('ReFAN Offers education assistance to girls who may have had to leave school due to financial constraints',
   'ReFAN exposes the girls facing challenges due to lack of support in education. Through our programs, we ensure every girl gets a chance to continue her studies and build a better future.',
   '/gallery-girls-walking.jpg', 0),
  ('Mr. Felix would like to ask for your support to the believed families within refugee Camp',
   'Despite the difficulties of overcoming grief and moving forward, Felix believes that ReFAN can provide a sense of hope and resilience for the families in need.',
   '/IMG-20260217-WA0039.jpg', 0),
  ('Community Resilience Workshop for Widows in Dzaleka',
   'ReFAN has launched a new Community Resilience workshop for widows in Dzaleka Refugee Camp. The program includes peer support groups, skills training, and income-generating activities.',
   '/gallery-community.jpg', 0),
  ('Education Support Reaches 100 Orphans in Dzaleka Camp',
   'Through our Education Support program, we have now reached over 100 orphaned children in Dzaleka Refugee Camp with school fees, uniforms, books, and after-school mentorship.',
   '/gallery-classroom.jpg', 0);
