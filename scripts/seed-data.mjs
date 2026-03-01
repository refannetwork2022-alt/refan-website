import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hlhavnqicoflcwtudjli.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaGF2bnFpY29mbGN3dHVkamxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTMxMjEsImV4cCI6MjA4Njk4OTEyMX0.Q1VDGd02Rrnv55sWDNNbx2o-L0_Hi-9sAs1ALRbhwA8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in as admin first (required by RLS policies)
const ADMIN_EMAIL = "refannetwork2022@gmail.com";
const ADMIN_PASSWORD = "Goreth.ReFAN";

// ── Announcements ──────────────────────────────────────────
const announcements = [
  {
    title: "ReFAN Annual General Meeting 2026",
    content:
      "We are pleased to invite all ReFAN members and supporters to our Annual General Meeting on March 15, 2026 at the Dzaleka Community Center. The meeting will cover our achievements in 2025, financial reports, and plans for the new year. Refreshments will be provided. Please confirm your attendance by contacting us.",
    image_url: "/gallery-community.jpg",
    donation_count: 12,
  },
  {
    title: "New Education Sponsorship Program Launched",
    content:
      "ReFAN is proud to announce the launch of our new Education Sponsorship Program! Starting this month, we will be sponsoring 50 additional orphaned children in Dzaleka Refugee Camp to attend school. Each sponsorship covers school fees, uniforms, books, and school supplies. If you would like to sponsor a child, please reach out to our team.",
    image_url: "/gallery-classroom.jpg",
    donation_count: 35,
  },
  {
    title: "Emergency Food Distribution Drive",
    content:
      "Due to the ongoing food shortages in Dzaleka Refugee Camp, ReFAN is organizing an emergency food distribution drive on February 28, 2026. We aim to reach 200 vulnerable families including widows and orphan-headed households. Donations of maize flour, beans, cooking oil, and salt are welcome. Drop-off points are at the ReFAN office and community center.",
    image_url: "/IMG-20260217-WA0046.jpg",
    donation_count: 58,
  },
  {
    title: "Women Empowerment Workshop - Registration Open",
    content:
      "ReFAN is hosting a 3-day Women Empowerment Workshop from March 20-22, 2026. The workshop will cover entrepreneurship skills, financial literacy, and mental health support for widows and single mothers in the camp. Limited spots available - register now through our office or call us directly.",
    image_url: "/IMG-20260217-WA0055.jpg",
    donation_count: 8,
  },
];

// ── Stories ─────────────────────────────────────────────────
const stories = [
  {
    title: "How Education Changed My Life - Emmanuel's Story",
    excerpt:
      "From an orphan with no hope to a top student dreaming of becoming a doctor, Emmanuel shares his journey with ReFAN.",
    content:
      "My name is Emmanuel, and I am 16 years old. When my parents passed away, I thought my life was over. I had no one to pay my school fees, no one to buy me books, and no one to encourage me. Then ReFAN came into my life.\n\nThey enrolled me in school, provided all my supplies, and connected me with a mentor. For the first time in years, I felt like someone believed in me. Today, I am one of the top students in my class, and I dream of becoming a doctor so I can help others in my community.\n\nReFAN didn't just give me an education — they gave me hope. To every orphan out there, I want you to know: your story is not over. There are people who care about you.",
    image_url: "/gallery-children-smiling.jpg",
    category: "story",
    date: "2026-02-10",
  },
  {
    title: "A Widow's Journey to Self-Reliance - Marie's Testimony",
    excerpt:
      "After losing her husband, Marie found strength through ReFAN's community programs and now leads a small business.",
    content:
      "When my husband died, I was left alone with three children and no income. Life in the refugee camp was already difficult, but without my husband, it became unbearable. I didn't know how I would feed my children or keep them in school.\n\nReFAN's community resilience program changed everything. They taught me skills in tailoring and small business management. With a small grant from the organization, I started a tailoring business in the camp. Today, I earn enough to feed my family and pay school fees for all three of my children.\n\nBut more than the money, ReFAN gave me a community. The other widows in the program became my sisters. We support each other, share our struggles, and celebrate our victories together. I am no longer alone.",
    image_url: "/IMG-20260217-WA0040.jpg",
    category: "story",
    date: "2026-01-25",
  },
  {
    title: "From Grief to Growth - The Bereavement Support Program",
    excerpt:
      "How ReFAN's bereavement support helped families heal and find strength after losing loved ones.",
    content:
      "Losing a loved one is painful anywhere in the world, but in a refugee camp, the grief can feel overwhelming. There is no familiar home to return to, no extended family to lean on, and the daily struggles of camp life make healing seem impossible.\n\nReFAN's Bereavement Support Program was created to address this. We provide counseling sessions, support groups, and practical assistance to families who have lost a breadwinner. Our trained community counselors, many of whom have experienced loss themselves, walk alongside grieving families.\n\nSince the program started, we have supported over 30 families. Many of them say that the support group sessions are the most meaningful — knowing that you are not alone in your grief makes all the difference.",
    image_url: "/IMG-20260217-WA0044.jpg",
    category: "story",
    date: "2026-01-15",
  },
  {
    title: "Children's Day Celebration at Dzaleka",
    excerpt:
      "ReFAN organized a special Children's Day event with games, food, and gifts for over 100 orphaned children.",
    content:
      "On January 5, 2026, ReFAN organized a Children's Day celebration for the orphaned children in Dzaleka Refugee Camp. Over 100 children attended the event, which featured games, singing, dancing, and a special meal.\n\nFor many of these children, it was the first time they had celebrated anything in a long time. The smiles on their faces reminded us why we do this work. Every child deserves to feel special, to laugh, and to play without worrying about tomorrow.\n\nWe also distributed school supplies and clothing to all the children. A heartfelt thank you to everyone who contributed to making this day possible. Together, we are building a brighter future for these children.",
    image_url: "/gallery-children-playing.jpg",
    category: "announcement",
    date: "2026-01-05",
  },
];

// ── Blog Posts ──────────────────────────────────────────────
const blogPosts = [
  {
    title: "Understanding the Challenges Facing Refugee Orphans in Malawi",
    excerpt:
      "An in-depth look at the unique challenges orphaned children face in Dzaleka Refugee Camp and what can be done to help.",
    content:
      "Dzaleka Refugee Camp in Malawi is home to over 50,000 refugees from countries like the Democratic Republic of Congo, Burundi, Rwanda, and Somalia. Among them are hundreds of orphaned children who face challenges that most of us cannot imagine.\n\nThese children have lost their parents to war, disease, or the harsh conditions of displacement. Without parents, they often lack access to education, proper nutrition, and emotional support. Many are cared for by elderly grandparents or older siblings who are themselves struggling to survive.\n\nThe education gap is particularly concerning. While some organizations provide primary education, secondary school and beyond remains out of reach for most orphans. Without education, these children have very limited prospects for the future.\n\nAt ReFAN, we believe that every orphaned child deserves a chance at a better life. Our education sponsorship program covers school fees, uniforms, books, and provides mentorship to help these children succeed academically and emotionally.\n\nBut we cannot do it alone. We need partners, sponsors, and volunteers who share our vision of a world where no child is left behind because of circumstances beyond their control.",
    image_url: "/gallery-boys-running.jpg",
    author: "Goreth Niyigena",
    tags: ["education", "orphans", "refugees"],
    date: "2026-02-20",
  },
  {
    title: "The Power of Community-Led Solutions in Refugee Camps",
    excerpt:
      "Why refugee-led organizations like ReFAN are uniquely positioned to create lasting change in their communities.",
    content:
      "There is a growing recognition in the humanitarian sector that the most effective and sustainable solutions often come from within affected communities themselves. Refugee-led organizations understand the needs, culture, and dynamics of their communities in ways that external organizations simply cannot.\n\nReFAN is a perfect example of this. Founded in 2022 by refugees living in Dzaleka Refugee Camp, our organization was born out of a simple observation: orphans and widows in the camp were falling through the cracks of traditional humanitarian assistance.\n\nBeing refugee-led gives us several advantages. First, we have trust. Community members know us, trust us, and are willing to open up about their needs. Second, we understand the context. We know the cultural sensitivities, the power dynamics, and the real barriers that people face. Third, we are here for the long term. We are not going to pack up and leave when a project ends — this is our home.\n\nHowever, being refugee-led also comes with challenges. Access to funding is limited, as many donors prefer to work with established international organizations. Administrative requirements can be overwhelming for small organizations run by volunteers. And the emotional toll of serving your own community while dealing with your own challenges is immense.\n\nDespite these challenges, we believe that community-led solutions are the future of humanitarian response. We call on donors, partners, and the international community to invest in organizations like ReFAN — not just with money, but with capacity building, mentorship, and genuine partnership.",
    image_url: "/team-refan.jpg",
    author: "Wagstan Muhire",
    tags: ["community", "refugee-led", "empowerment"],
    date: "2026-02-05",
  },
  {
    title: "Mental Health in Refugee Settings: Breaking the Silence",
    excerpt:
      "Addressing the often-overlooked mental health crisis among refugees, especially widows and orphans.",
    content:
      "Mental health is one of the most critical yet overlooked issues in refugee camps. The trauma of war, displacement, loss of loved ones, and the daily stress of life in a camp can have devastating effects on mental well-being.\n\nFor widows, the grief of losing a husband is compounded by the sudden responsibility of being the sole provider for their children. Many experience depression, anxiety, and feelings of hopelessness. For orphans, the loss of parents at a young age can lead to behavioral issues, difficulty in school, and deep emotional wounds that may take years to heal.\n\nYet mental health services in refugee camps are extremely limited. There are few trained counselors, and cultural stigma around mental health means that many people suffer in silence.\n\nAt ReFAN, we are working to change this. Our bereavement support program provides a safe space for grieving families to share their experiences and receive emotional support. We train community members as peer counselors, creating a sustainable network of mental health support within the camp.\n\nWe have seen remarkable results. Participants report feeling less isolated, more hopeful, and better equipped to cope with their challenges. Children in our program show improved school performance and better relationships with their caregivers.\n\nMental health is not a luxury — it is a fundamental human need. We urge the humanitarian community to prioritize mental health support in refugee settings.",
    image_url: "/IMG-20260217-WA0048.jpg",
    author: "Goreth Niyigena",
    tags: ["mental-health", "widows", "support"],
    date: "2026-01-18",
  },
];

// ── Insert data ────────────────────────────────────────────
async function seed() {
  // Sign in as admin
  console.log("Signing in as admin...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authErr) {
    console.error("Auth error:", authErr.message);
    console.log("Trying without auth (tables may need public INSERT policy)...");
  } else {
    console.log("  ✓ Signed in as", authData.user.email);
  }

  console.log("\nSeeding announcements...");
  const { data: annData, error: annErr } = await supabase
    .from("announcements")
    .insert(announcements)
    .select();
  if (annErr) console.error("Announcements error:", annErr);
  else console.log(`  ✓ ${annData.length} announcements inserted`);

  console.log("Seeding stories...");
  const { data: storyData, error: storyErr } = await supabase
    .from("stories")
    .insert(stories)
    .select();
  if (storyErr) console.error("Stories error:", storyErr);
  else console.log(`  ✓ ${storyData.length} stories inserted`);

  console.log("Seeding blog posts...");
  const { data: blogData, error: blogErr } = await supabase
    .from("blog_posts")
    .insert(blogPosts)
    .select();
  if (blogErr) console.error("Blog posts error:", blogErr);
  else console.log(`  ✓ ${blogData.length} blog posts inserted`);

  console.log("\nDone! All example data has been added.");
}

seed();
