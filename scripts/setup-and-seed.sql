-- ============================================================
-- ReFAN: Create all tables + seed example data
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    opt_in BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow newsletter insert with opt-in" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (opt_in = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. STORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stories (
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
DO $$ BEGIN
  CREATE POLICY "Public read stories" ON public.stories FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert stories" ON public.stories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin update stories" ON public.stories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin delete stories" ON public.stories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
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
DO $$ BEGIN
  CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert blog_posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin update blog_posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin delete blog_posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
  date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert gallery_items" ON public.gallery_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin delete gallery_items" ON public.gallery_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 5. VOLUNTEER SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.volunteer_submissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'volunteer' CHECK (type IN ('volunteer', 'sponsor')),
  message    TEXT NOT NULL DEFAULT '',
  country    TEXT NOT NULL DEFAULT '',
  date       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.volunteer_submissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public insert volunteer_submissions" ON public.volunteer_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin read volunteer_submissions" ON public.volunteer_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 6. DONATION SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donation_submissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  amount     NUMERIC NOT NULL CHECK (amount > 0),
  message    TEXT NOT NULL DEFAULT '',
  currency   TEXT NOT NULL DEFAULT '',
  date       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donation_submissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public insert donation_submissions" ON public.donation_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin read donation_submissions" ON public.donation_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 7. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  content        TEXT NOT NULL DEFAULT '',
  image_url      TEXT,
  donation_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin update announcements" ON public.announcements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 8. CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public insert contact_messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin read contact_messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin delete contact_messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 9. MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.members (
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
DO $$ BEGIN
  CREATE POLICY "Admin read members" ON public.members FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin update members" ON public.members FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admin delete members" ON public.members FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- ============================================================
-- SEED EXAMPLE DATA
-- ============================================================
-- ============================================================

-- ── ANNOUNCEMENTS ──────────────────────────────────────────
INSERT INTO public.announcements (title, content, image_url, donation_count) VALUES
  ('ReFAN Annual General Meeting 2026',
   'We are pleased to invite all ReFAN members and supporters to our Annual General Meeting on March 15, 2026 at the Dzaleka Community Center. The meeting will cover our achievements in 2025, financial reports, and plans for the new year. Refreshments will be provided. Please confirm your attendance by contacting us.',
   '/gallery-community.jpg', 12),

  ('New Education Sponsorship Program Launched',
   'ReFAN is proud to announce the launch of our new Education Sponsorship Program! Starting this month, we will be sponsoring 50 additional orphaned children in Dzaleka Refugee Camp to attend school. Each sponsorship covers school fees, uniforms, books, and school supplies. If you would like to sponsor a child, please reach out to our team.',
   '/gallery-classroom.jpg', 35),

  ('Emergency Food Distribution Drive',
   'Due to the ongoing food shortages in Dzaleka Refugee Camp, ReFAN is organizing an emergency food distribution drive on February 28, 2026. We aim to reach 200 vulnerable families including widows and orphan-headed households. Donations of maize flour, beans, cooking oil, and salt are welcome. Drop-off points are at the ReFAN office and community center.',
   '/IMG-20260217-WA0046.jpg', 58),

  ('Women Empowerment Workshop - Registration Open',
   'ReFAN is hosting a 3-day Women Empowerment Workshop from March 20-22, 2026. The workshop will cover entrepreneurship skills, financial literacy, and mental health support for widows and single mothers in the camp. Limited spots available - register now through our office or call us directly.',
   '/IMG-20260217-WA0055.jpg', 8);

-- ── STORIES ────────────────────────────────────────────────
INSERT INTO public.stories (title, excerpt, content, image_url, category, date) VALUES
  ('How Education Changed My Life - Emmanuel''s Story',
   'From an orphan with no hope to a top student dreaming of becoming a doctor, Emmanuel shares his journey with ReFAN.',
   'My name is Emmanuel, and I am 16 years old. When my parents passed away, I thought my life was over. I had no one to pay my school fees, no one to buy me books, and no one to encourage me. Then ReFAN came into my life.

They enrolled me in school, provided all my supplies, and connected me with a mentor. For the first time in years, I felt like someone believed in me. Today, I am one of the top students in my class, and I dream of becoming a doctor so I can help others in my community.

ReFAN didn''t just give me an education — they gave me hope. To every orphan out there, I want you to know: your story is not over. There are people who care about you.',
   '/gallery-children-smiling.jpg', 'story', '2026-02-10'),

  ('A Widow''s Journey to Self-Reliance - Marie''s Testimony',
   'After losing her husband, Marie found strength through ReFAN''s community programs and now leads a small business.',
   'When my husband died, I was left alone with three children and no income. Life in the refugee camp was already difficult, but without my husband, it became unbearable. I didn''t know how I would feed my children or keep them in school.

ReFAN''s community resilience program changed everything. They taught me skills in tailoring and small business management. With a small grant from the organization, I started a tailoring business in the camp. Today, I earn enough to feed my family and pay school fees for all three of my children.

But more than the money, ReFAN gave me a community. The other widows in the program became my sisters. We support each other, share our struggles, and celebrate our victories together. I am no longer alone.',
   '/IMG-20260217-WA0040.jpg', 'story', '2026-01-25'),

  ('From Grief to Growth - The Bereavement Support Program',
   'How ReFAN''s bereavement support helped families heal and find strength after losing loved ones.',
   'Losing a loved one is painful anywhere in the world, but in a refugee camp, the grief can feel overwhelming. There is no familiar home to return to, no extended family to lean on, and the daily struggles of camp life make healing seem impossible.

ReFAN''s Bereavement Support Program was created to address this. We provide counseling sessions, support groups, and practical assistance to families who have lost a breadwinner. Our trained community counselors, many of whom have experienced loss themselves, walk alongside grieving families.

Since the program started, we have supported over 30 families. Many of them say that the support group sessions are the most meaningful — knowing that you are not alone in your grief makes all the difference.',
   '/IMG-20260217-WA0044.jpg', 'story', '2026-01-15'),

  ('Children''s Day Celebration at Dzaleka',
   'ReFAN organized a special Children''s Day event with games, food, and gifts for over 100 orphaned children.',
   'On January 5, 2026, ReFAN organized a Children''s Day celebration for the orphaned children in Dzaleka Refugee Camp. Over 100 children attended the event, which featured games, singing, dancing, and a special meal.

For many of these children, it was the first time they had celebrated anything in a long time. The smiles on their faces reminded us why we do this work. Every child deserves to feel special, to laugh, and to play without worrying about tomorrow.

We also distributed school supplies and clothing to all the children. A heartfelt thank you to everyone who contributed to making this day possible. Together, we are building a brighter future for these children.',
   '/gallery-children-playing.jpg', 'announcement', '2026-01-05');

-- ── BLOG POSTS ─────────────────────────────────────────────
INSERT INTO public.blog_posts (title, excerpt, content, image_url, author, tags, date) VALUES
  ('Understanding the Challenges Facing Refugee Orphans in Malawi',
   'An in-depth look at the unique challenges orphaned children face in Dzaleka Refugee Camp and what can be done to help.',
   'Dzaleka Refugee Camp in Malawi is home to over 50,000 refugees from countries like the Democratic Republic of Congo, Burundi, Rwanda, and Somalia. Among them are hundreds of orphaned children who face challenges that most of us cannot imagine.

These children have lost their parents to war, disease, or the harsh conditions of displacement. Without parents, they often lack access to education, proper nutrition, and emotional support. Many are cared for by elderly grandparents or older siblings who are themselves struggling to survive.

The education gap is particularly concerning. While some organizations provide primary education, secondary school and beyond remains out of reach for most orphans. Without education, these children have very limited prospects for the future.

At ReFAN, we believe that every orphaned child deserves a chance at a better life. Our education sponsorship program covers school fees, uniforms, books, and provides mentorship to help these children succeed academically and emotionally.

But we cannot do it alone. We need partners, sponsors, and volunteers who share our vision of a world where no child is left behind because of circumstances beyond their control.',
   '/gallery-boys-running.jpg', 'Goreth Niyigena', ARRAY['education', 'orphans', 'refugees'], '2026-02-20'),

  ('The Power of Community-Led Solutions in Refugee Camps',
   'Why refugee-led organizations like ReFAN are uniquely positioned to create lasting change in their communities.',
   'There is a growing recognition in the humanitarian sector that the most effective and sustainable solutions often come from within affected communities themselves. Refugee-led organizations understand the needs, culture, and dynamics of their communities in ways that external organizations simply cannot.

ReFAN is a perfect example of this. Founded in 2022 by refugees living in Dzaleka Refugee Camp, our organization was born out of a simple observation: orphans and widows in the camp were falling through the cracks of traditional humanitarian assistance.

Being refugee-led gives us several advantages. First, we have trust. Community members know us, trust us, and are willing to open up about their needs. Second, we understand the context. We know the cultural sensitivities, the power dynamics, and the real barriers that people face. Third, we are here for the long term. We are not going to pack up and leave when a project ends — this is our home.

However, being refugee-led also comes with challenges. Access to funding is limited, as many donors prefer to work with established international organizations. Administrative requirements can be overwhelming for small organizations run by volunteers. And the emotional toll of serving your own community while dealing with your own challenges is immense.

Despite these challenges, we believe that community-led solutions are the future of humanitarian response. We call on donors, partners, and the international community to invest in organizations like ReFAN — not just with money, but with capacity building, mentorship, and genuine partnership.',
   '/team-refan.jpg', 'Wagstan Muhire', ARRAY['community', 'refugee-led', 'empowerment'], '2026-02-05'),

  ('Mental Health in Refugee Settings: Breaking the Silence',
   'Addressing the often-overlooked mental health crisis among refugees, especially widows and orphans.',
   'Mental health is one of the most critical yet overlooked issues in refugee camps. The trauma of war, displacement, loss of loved ones, and the daily stress of life in a camp can have devastating effects on mental well-being.

For widows, the grief of losing a husband is compounded by the sudden responsibility of being the sole provider for their children. Many experience depression, anxiety, and feelings of hopelessness. For orphans, the loss of parents at a young age can lead to behavioral issues, difficulty in school, and deep emotional wounds that may take years to heal.

Yet mental health services in refugee camps are extremely limited. There are few trained counselors, and cultural stigma around mental health means that many people suffer in silence.

At ReFAN, we are working to change this. Our bereavement support program provides a safe space for grieving families to share their experiences and receive emotional support. We train community members as peer counselors, creating a sustainable network of mental health support within the camp.

We have seen remarkable results. Participants report feeling less isolated, more hopeful, and better equipped to cope with their challenges. Children in our program show improved school performance and better relationships with their caregivers.

Mental health is not a luxury — it is a fundamental human need. We urge the humanitarian community to prioritize mental health support in refugee settings.',
   '/IMG-20260217-WA0048.jpg', 'Goreth Niyigena', ARRAY['mental-health', 'widows', 'support'], '2026-01-18');
